# 🧪 Testing & QA Framework Plan for Quantum Solar CRM

Based on comprehensive research of modern testing frameworks for Next.js 15 + Supabase applications in 2025, this document outlines the optimal testing stack for our CRM system.

## 🎯 Testing Strategy Overview

### Multi-Layer Testing Approach
1. **Unit Testing** - Component logic and utilities
2. **Integration Testing** - API routes and database operations  
3. **End-to-End Testing** - Complete user workflows
4. **Visual Regression Testing** - UI consistency across updates
5. **Performance Testing** - Load and stress testing
6. **Security Testing** - Authentication and data protection

## 🛠️ Recommended Testing Stack

### **Primary Testing Framework: Vitest + React Testing Library**
**Why Vitest over Jest for 2025:**
- ⚡ **5-10x faster** than Jest due to native ESM support
- 🔧 **Better Next.js 15 compatibility** with App Router
- 📦 **Smaller bundle size** and faster CI/CD pipelines  
- 🔄 **Hot Module Replacement** during test development
- 🎯 **Native TypeScript support** without configuration
- 🚀 **Vite ecosystem integration** for consistent tooling

```bash
# Core testing dependencies
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### **End-to-End Testing: Playwright**
**Why Playwright over Cypress:**
- 🌐 **Cross-browser testing** (Chrome, Firefox, Safari, Edge)
- 📱 **Mobile viewport testing** built-in
- 🎭 **Better developer experience** with TypeScript
- ⚡ **Faster execution** and more reliable than Cypress
- 🔧 **Microsoft maintenance** ensures long-term support
- 📸 **Built-in screenshot/video recording**

```bash
npm install -D @playwright/test
npx playwright install
```

### **Database Testing: Supabase Local + pg_prove**
**Supabase Database Testing Strategy:**
- 🗄️ **Local Supabase instance** for isolated testing
- 🧪 **pg_prove** for PostgreSQL unit testing
- 🔄 **Database migrations testing** with rollback scenarios
- 🔐 **Row Level Security (RLS) policy testing**

```bash
# Supabase local development
npm install -D supabase
supabase start --db-port 54322
```

### **API Testing: MSW (Mock Service Worker)**
**For Supabase API mocking:**
- 🌐 **Network-level mocking** for realistic testing
- 🔄 **Supabase client mocking** for offline development
- 📡 **Real-time subscription testing**

```bash
npm install -D msw
```

### **Visual Regression Testing: Chromatic + Storybook**
**For CRM UI consistency:**
- 📸 **Component visual testing** with Storybook
- 🎨 **Design system validation** 
- 📱 **Cross-device screenshot comparison**
- 🔄 **Automated PR reviews** for UI changes

```bash
npm install -D @storybook/nextjs chromatic
```

## 📁 Testing Architecture

```
tests/
├── __mocks__/                 # Mock configurations
│   ├── supabase.ts           # Supabase client mocks
│   └── next-auth.ts          # Authentication mocks
├── fixtures/                  # Test data and fixtures
│   ├── leads.json            # Sample lead data
│   ├── projects.json         # Sample project data
│   └── users.json            # Sample user profiles
├── unit/                      # Unit tests
│   ├── components/           # React component tests
│   ├── utils/                # Utility function tests
│   └── lib/                  # Business logic tests
├── integration/               # Integration tests
│   ├── api/                  # API route tests
│   ├── database/             # Database operation tests
│   └── auth/                 # Authentication flow tests
├── e2e/                       # End-to-end tests
│   ├── lead-management.spec.ts
│   ├── project-pipeline.spec.ts
│   ├── mobile-workflows.spec.ts
│   └── admin-functions.spec.ts
├── visual/                    # Visual regression tests
│   ├── components.stories.ts # Storybook stories
│   └── pages.visual.spec.ts  # Page-level visual tests
└── performance/               # Performance tests
    ├── load-testing.js       # K6 load tests
    └── lighthouse.spec.ts    # Core Web Vitals
```

## 🔧 Configuration Files

### **vitest.config.ts**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### **playwright.config.ts**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## 🧪 CRM-Specific Testing Scenarios

### **Lead Management Testing**
```typescript
// tests/integration/lead-management.test.ts
describe('Lead Management', () => {
  it('should create lead with custom QSLID', async () => {
    const leadData = {
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      utility_company: 'ComEd'
    }
    
    const lead = await createLead(leadData)
    expect(lead.custom_id).toMatch(/QSLID\d{6}/)
    expect(lead.qualification_status).toBe('pending')
  })
  
  it('should enforce TCPA compliance', async () => {
    const leadData = { /* without TCPA consent */ }
    await expect(createLead(leadData)).rejects.toThrow('TCPA consent required')
  })
})
```

### **Sales Pipeline Testing**
```typescript
// tests/e2e/sales-pipeline.spec.ts
test('Complete sales pipeline flow', async ({ page }) => {
  // 1. Create lead from splash form
  await page.goto('/state-promotions/illinois/ameren-il')
  await page.fill('[data-testid="first-name"]', 'Jane')
  await page.fill('[data-testid="last-name"]', 'Smith')
  await page.fill('[data-testid="email"]', 'jane@example.com')
  await page.click('[data-testid="submit-form"]')
  
  // 2. Verify lead creation with QSLID
  await expect(page.locator('[data-testid="lead-id"]')).toContainText('QSLID')
  
  // 3. Convert to opportunity
  await page.click('[data-testid="create-opportunity"]')
  await page.fill('[data-testid="system-size"]', '7.5')
  await page.fill('[data-testid="estimated-cost"]', '25000')
  
  // 4. Verify opportunity creation with QSOID
  await expect(page.locator('[data-testid="opportunity-id"]')).toContainText('QSOID')
  
  // 5. Convert to project
  await page.click('[data-testid="create-project"]')
  
  // 6. Verify project creation with QSPID
  await expect(page.locator('[data-testid="project-id"]')).toContainText('QSPID')
})
```

### **Mobile App Testing**
```typescript
// tests/e2e/mobile-workflows.spec.ts
test.describe('Mobile Installer App', () => {
  test('Photo capture workflow', async ({ page }) => {
    await page.goto('/mobile/projects/QSPID000001/photos')
    
    // Test photo capture categories
    const categories = ['roof_overview', 'electrical_panel', 'meter']
    
    for (const category of categories) {
      await page.click(`[data-testid="capture-${category}"]`)
      await page.setInputFiles('[data-testid="file-input"]', 'tests/fixtures/sample-photo.jpg')
      await expect(page.locator(`[data-testid="${category}-uploaded"]`)).toBeVisible()
    }
    
    // Verify offline sync
    await page.context().setOffline(true)
    await page.click('[data-testid="sync-photos"]')
    await expect(page.locator('[data-testid="sync-pending"]')).toBeVisible()
  })
})
```

## 📊 QA Metrics and Reporting

### **Coverage Requirements**
- **Unit Tests**: 90% code coverage minimum
- **Integration Tests**: 80% API endpoint coverage
- **E2E Tests**: 100% critical user journey coverage
- **Visual Tests**: 100% component story coverage

### **Performance Benchmarks**
- **Page Load Times**: < 2 seconds (LCP)
- **API Response Times**: < 200ms (p95)
- **Database Queries**: < 100ms average
- **Mobile Performance**: 60+ FPS interactions

### **Automated QA Pipeline**
```yaml
# .github/workflows/qa.yml
name: QA Pipeline
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run unit tests
        run: npm run test:unit
        
  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
    steps:
      - name: Start Supabase
        run: npx supabase start
      - name: Run integration tests
        run: npm run test:integration
        
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run Playwright tests
        run: npx playwright test
        
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - name: Run Chromatic
        run: npm run chromatic
```

## 🔐 Security Testing

### **Authentication Testing**
- **Clerk integration** with different user roles
- **RLS policy enforcement** testing
- **JWT token validation** and expiration
- **Session management** across devices

### **Data Protection Testing**
- **TCPA compliance** validation
- **PII data encryption** verification
- **Database injection** prevention
- **XSS protection** validation

## 📈 Performance Testing

### **Load Testing with K6**
```javascript
// tests/performance/load-testing.js
import http from 'k6/http'
import { check } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
}

export default function () {
  let response = http.get('http://localhost:3000/api/leads')
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  })
}
```

## 🚀 Implementation Timeline

### **Phase 1: Foundation (Week 1)**
- Set up Vitest + React Testing Library
- Configure Playwright for E2E testing
- Create basic test utilities and mocks

### **Phase 2: Core Testing (Week 2)**
- Write unit tests for custom ID system
- Create integration tests for database operations
- Implement Supabase mocking strategy

### **Phase 3: User Workflows (Week 3)**
- E2E tests for lead management
- Sales pipeline testing scenarios
- Mobile app workflow testing

### **Phase 4: QA Automation (Week 4)**
- Visual regression testing setup
- Performance testing implementation
- CI/CD pipeline integration

### **Phase 5: Advanced Testing (Week 5)**
- Security testing automation
- Load testing scenarios
- Cross-browser compatibility testing

## 📚 Resources and Documentation

- [Vitest Documentation](https://vitest.dev/)
- [Playwright Testing Guide](https://playwright.dev/)
- [React Testing Library Best Practices](https://testing-library.com/docs/react-testing-library/intro/)
- [Supabase Testing Guide](https://supabase.com/docs/guides/local-development/testing/overview)
- [Next.js Testing Documentation](https://nextjs.org/docs/app/guides/testing)

## 🎯 Success Metrics

By implementing this testing framework, we aim to achieve:

- **99.9% uptime** for critical CRM functions
- **Zero regression bugs** in production
- **< 2 second** average page load times
- **100% TCPA compliance** validation
- **Automated deployment** confidence
- **Cross-platform compatibility** assurance

This comprehensive testing strategy ensures the Quantum Solar CRM extension maintains enterprise-grade quality while supporting rapid development cycles.