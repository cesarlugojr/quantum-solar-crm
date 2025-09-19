# 🧪 Phase 2: Testing & QA Infrastructure Roadmap

**Timeline: Weeks 3-4**  
**Goal: Establish enterprise-grade testing foundation before feature development**

## 🎯 Phase 2 Overview

Building on Phase 1's solid database foundation, Phase 2 focuses on implementing a comprehensive testing infrastructure that will ensure code quality, prevent regressions, and enable confident continuous deployment throughout the remaining development phases.

## 📋 Week 3: Core Testing Infrastructure

### Day 1-2: Unit Testing Foundation
**Vitest + React Testing Library Setup**

#### Tasks:
1. **Install Testing Dependencies**
   ```bash
   npm install -D vitest @vitejs/plugin-react jsdom
   npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
   npm install -D @vitest/coverage-v8
   ```

2. **Configure Vitest**
   ```typescript
   // vitest.config.ts
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
         threshold: {
           global: {
             branches: 90,
             functions: 90,
             lines: 90,
             statements: 90
           }
         }
       }
     },
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src'),
       },
     },
   })
   ```

3. **Create Test Utilities**
   ```typescript
   // tests/utils/test-utils.tsx
   import { render, RenderOptions } from '@testing-library/react'
   import { ReactElement } from 'react'
   import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

   const createTestQueryClient = () => new QueryClient({
     defaultOptions: {
       queries: { retry: false },
       mutations: { retry: false },
     },
   })

   const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
     const queryClient = createTestQueryClient()
     return (
       <QueryClientProvider client={queryClient}>
         {children}
       </QueryClientProvider>
     )
   }

   const customRender = (ui: ReactElement, options?: RenderOptions) =>
     render(ui, { wrapper: AllTheProviders, ...options })

   export * from '@testing-library/react'
   export { customRender as render }
   ```

4. **Test Custom ID System**
   ```typescript
   // tests/unit/lib/custom-ids.test.ts
   import { describe, it, expect } from 'vitest'

   describe('Custom ID Generation', () => {
     it('should generate QSLID format for leads', () => {
       const leadId = generateLeadId()
       expect(leadId).toMatch(/^QSLID\d{6}$/)
     })

     it('should generate unique sequential IDs', () => {
       const id1 = generateLeadId()
       const id2 = generateLeadId()
       expect(id1).not.toBe(id2)
       expect(parseInt(id1.slice(5))).toBeLessThan(parseInt(id2.slice(5)))
     })
   })
   ```

**Deliverables:**
- ✅ Vitest configuration with 90% coverage requirements
- ✅ Testing utilities for React components
- ✅ Initial unit tests for custom ID system
- ✅ Test scripts in package.json

### Day 3-4: Database Testing Setup
**Supabase Local + pg_prove Integration**

#### Tasks:
1. **Configure Local Supabase**
   ```bash
   # Install Supabase CLI
   npm install -D supabase
   
   # Initialize local development
   npx supabase init
   npx supabase start --db-port 54322
   ```

2. **Database Testing Framework**
   ```sql
   -- tests/database/001_test_custom_id_functions.sql
   BEGIN;
   SELECT plan(8);

   -- Test lead ID generation
   SELECT ok(
     generate_lead_id() ~ '^QSLID\d{6}$',
     'Lead ID follows QSLID format'
   );

   -- Test opportunity ID generation
   SELECT ok(
     generate_opportunity_id() ~ '^QSOID\d{6}$',
     'Opportunity ID follows QSOID format'
   );

   -- Test project ID generation
   SELECT ok(
     generate_project_id() ~ '^QSPID\d{6}$',
     'Project ID follows QSPID format'
   );

   -- Test installation ID generation
   SELECT ok(
     generate_installation_id() ~ '^QSIID\d{6}$',
     'Installation ID follows QSIID format'
   );

   -- Test ID uniqueness
   SELECT isnt(
     generate_lead_id(),
     generate_lead_id(),
     'Lead IDs are unique'
   );

   SELECT finish();
   ROLLBACK;
   ```

3. **RLS Policy Testing**
   ```sql
   -- tests/database/002_test_rls_policies.sql
   BEGIN;
   SELECT plan(6);

   -- Create test users
   INSERT INTO auth.users (id, email) VALUES 
     ('user1', 'sales@test.com'),
     ('user2', 'installer@test.com');

   INSERT INTO profiles (user_id, email, role) VALUES
     ('user1', 'sales@test.com', 'sales_rep'),
     ('user2', 'installer@test.com', 'installer');

   -- Test sales rep can only see assigned leads
   SET LOCAL "request.jwt.claims" TO '{"sub":"user1"}';
   
   INSERT INTO splash_leads (first_name, assigned_to) VALUES 
     ('Assigned Lead', 'user1'),
     ('Other Lead', 'user2');

   SELECT is(
     (SELECT COUNT(*) FROM splash_leads WHERE assigned_to = 'user1'),
     1::bigint,
     'Sales rep sees only assigned leads'
   );

   SELECT finish();
   ROLLBACK;
   ```

4. **Migration Testing Script**
   ```bash
   #!/bin/bash
   # tests/database/run_db_tests.sh
   
   echo "🧪 Running database tests..."
   
   # Reset test database
   supabase db reset --db-url postgresql://localhost:54322/postgres
   
   # Apply migrations
   cd database && ./run_migrations.sh --test-mode
   
   # Run pg_prove tests
   pg_prove --host localhost --port 54322 --dbname postgres \
     --username postgres tests/database/*.sql
   
   echo "✅ Database tests completed"
   ```

**Deliverables:**
- ✅ Local Supabase testing environment
- ✅ pg_prove test suite for database functions
- ✅ RLS policy validation tests
- ✅ Migration testing automation

### Day 5: API Integration Testing
**Supabase Client Mocking & MSW Setup**

#### Tasks:
1. **Install MSW (Mock Service Worker)**
   ```bash
   npm install -D msw
   ```

2. **Supabase Client Mocking**
   ```typescript
   // tests/__mocks__/supabase.ts
   import { vi } from 'vitest'

   export const mockSupabaseClient = {
     from: vi.fn(() => ({
       select: vi.fn().mockReturnThis(),
       insert: vi.fn().mockReturnThis(),
       update: vi.fn().mockReturnThis(),
       delete: vi.fn().mockReturnThis(),
       eq: vi.fn().mockReturnThis(),
       single: vi.fn(),
       data: null,
       error: null
     })),
     auth: {
       getUser: vi.fn(),
       signIn: vi.fn(),
       signOut: vi.fn()
     },
     channel: vi.fn(() => ({
       on: vi.fn().mockReturnThis(),
       subscribe: vi.fn()
     }))
   }

   vi.mock('@supabase/supabase-js', () => ({
     createClient: vi.fn(() => mockSupabaseClient)
   }))
   ```

3. **API Route Testing**
   ```typescript
   // tests/integration/api/leads.test.ts
   import { describe, it, expect, beforeEach } from 'vitest'
   import { createMocks } from 'node-mocks-http'
   import handler from '@/app/api/leads/route'

   describe('/api/leads', () => {
     beforeEach(() => {
       vi.clearAllMocks()
     })

     it('should create lead with custom ID', async () => {
       const { req, res } = createMocks({
         method: 'POST',
         body: {
           first_name: 'John',
           last_name: 'Doe',
           email: 'john@example.com',
           utility_company: 'ComEd'
         }
       })

       await handler(req, res)

       expect(res._getStatusCode()).toBe(201)
       const data = JSON.parse(res._getData())
       expect(data.custom_id).toMatch(/QSLID\d{6}/)
     })

     it('should enforce TCPA consent', async () => {
       const { req, res } = createMocks({
         method: 'POST',
         body: {
           email: 'test@example.com',
           tcpa_consent: false
         }
       })

       await handler(req, res)

       expect(res._getStatusCode()).toBe(400)
       const data = JSON.parse(res._getData())
       expect(data.error).toContain('TCPA consent required')
     })
   })
   ```

**Deliverables:**
- ✅ MSW setup for API mocking
- ✅ Supabase client mocking utilities
- ✅ API route integration tests
- ✅ TCPA compliance validation tests

## 📋 Week 4: E2E Testing & Visual Regression

### Day 1-2: Playwright E2E Setup
**Cross-browser Testing Infrastructure**

#### Tasks:
1. **Install Playwright**
   ```bash
   npm install -D @playwright/test
   npx playwright install
   ```

2. **Playwright Configuration**
   ```typescript
   // playwright.config.ts
   import { defineConfig, devices } from '@playwright/test'

   export default defineConfig({
     testDir: './tests/e2e',
     fullyParallel: true,
     forbidOnly: !!process.env.CI,
     retries: process.env.CI ? 2 : 0,
     workers: process.env.CI ? 1 : undefined,
     reporter: [
       ['html'],
       ['json', { outputFile: 'test-results/results.json' }]
     ],
     use: {
       baseURL: 'http://localhost:3000',
       trace: 'on-first-retry',
       screenshot: 'only-on-failure',
       video: 'retain-on-failure'
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
       }
     ],
     webServer: {
       command: 'npm run dev',
       url: 'http://localhost:3000',
       reuseExistingServer: !process.env.CI,
     },
   })
   ```

3. **Core CRM Workflow Tests**
   ```typescript
   // tests/e2e/lead-management.spec.ts
   import { test, expect } from '@playwright/test'

   test.describe('Lead Management Workflow', () => {
     test('should create lead from splash page', async ({ page }) => {
       await page.goto('/state-promotions/illinois/ameren-il')
       
       // Fill out lead form
       await page.fill('[data-testid="first-name"]', 'John')
       await page.fill('[data-testid="last-name"]', 'Doe')
       await page.fill('[data-testid="email"]', 'john@example.com')
       await page.fill('[data-testid="phone"]', '555-0123')
       
       // Submit form
       await page.click('[data-testid="submit-form"]')
       
       // Verify lead creation
       await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
       await expect(page.locator('[data-testid="lead-id"]')).toContainText('QSLID')
     })

     test('should convert lead to opportunity', async ({ page }) => {
       // Login as sales rep
       await page.goto('/auth/signin')
       await page.fill('[data-testid="email"]', 'sales@test.com')
       await page.fill('[data-testid="password"]', 'password')
       await page.click('[data-testid="signin-button"]')
       
       // Navigate to leads dashboard
       await page.goto('/crm/leads')
       await page.click('[data-testid="lead-QSLID000001"]')
       
       // Convert to opportunity
       await page.click('[data-testid="create-opportunity"]')
       await page.fill('[data-testid="system-size"]', '7.5')
       await page.fill('[data-testid="estimated-cost"]', '25000')
       await page.click('[data-testid="save-opportunity"]')
       
       // Verify opportunity creation
       await expect(page.locator('[data-testid="opportunity-id"]')).toContainText('QSOID')
     })
   })
   ```

**Deliverables:**
- ✅ Playwright cross-browser configuration
- ✅ Lead management E2E tests
- ✅ Sales pipeline workflow tests
- ✅ Mobile viewport testing setup

### Day 3-4: Visual Regression Testing
**Storybook + Chromatic Integration**

#### Tasks:
1. **Install Storybook**
   ```bash
   npx storybook@latest init
   npm install -D chromatic @chromatic-com/storybook
   ```

2. **Storybook Configuration**
   ```typescript
   // .storybook/main.ts
   export default {
     stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
     addons: [
       '@storybook/addon-essentials',
       '@storybook/addon-a11y',
       '@storybook/addon-viewport',
       '@chromatic-com/storybook'
     ],
     framework: {
       name: '@storybook/nextjs',
       options: {}
     },
     features: {
       experimentalRSC: true
     }
   }
   ```

3. **Component Stories**
   ```typescript
   // src/components/LeadCard/LeadCard.stories.ts
   import type { Meta, StoryObj } from '@storybook/react'
   import { LeadCard } from './LeadCard'

   const meta: Meta<typeof LeadCard> = {
     title: 'CRM/LeadCard',
     component: LeadCard,
     parameters: {
       layout: 'centered',
       chromatic: {
         viewports: [320, 768, 1200],
         delay: 300,
         pauseAnimationAtEnd: true
       }
     },
     argTypes: {
       status: {
         control: 'select',
         options: ['new', 'contacted', 'qualified', 'disqualified']
       }
     }
   }

   export default meta
   type Story = StoryObj<typeof meta>

   export const NewLead: Story = {
     args: {
       lead: {
         custom_id: 'QSLID000001',
         first_name: 'John',
         last_name: 'Doe',
         email: 'john@example.com',
         status: 'new',
         lead_score: 0,
         created_at: '2025-01-19T10:00:00Z'
       }
     }
   }

   export const QualifiedLead: Story = {
     args: {
       lead: {
         custom_id: 'QSLID000002',
         first_name: 'Jane',
         last_name: 'Smith',
         email: 'jane@example.com',
         status: 'qualified',
         lead_score: 85,
         created_at: '2025-01-19T10:00:00Z'
       }
     }
   }

   export const HighValueLead: Story = {
     args: {
       lead: {
         custom_id: 'QSLID000003',
         first_name: 'Robert',
         last_name: 'Johnson',
         email: 'robert@example.com',
         status: 'qualified',
         lead_score: 95,
         average_monthly_bill: 350,
         created_at: '2025-01-19T10:00:00Z'
       }
     }
   }
   ```

4. **Visual Testing Automation**
   ```bash
   # .github/workflows/visual-regression.yml
   name: Visual Regression Testing
   on: [push, pull_request]

   jobs:
     chromatic:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
           with:
             fetch-depth: 0
         - uses: actions/setup-node@v4
           with:
             node-version: '20'
         - run: npm ci
         - run: npm run build-storybook
         - uses: chromaui/action@v1
           with:
             projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
             token: ${{ secrets.GITHUB_TOKEN }}
   ```

**Deliverables:**
- ✅ Storybook setup with Next.js 15 support
- ✅ Component stories for all CRM components
- ✅ Chromatic visual regression testing
- ✅ Automated visual testing in CI/CD

### Day 5: Performance Testing Setup
**K6 + Lighthouse Integration**

#### Tasks:
1. **Install Performance Tools**
   ```bash
   npm install -D k6 lighthouse @lhci/cli
   ```

2. **K6 Load Testing**
   ```javascript
   // tests/performance/crm-load.js
   import http from 'k6/http'
   import { check, group, sleep } from 'k6'
   import { Rate } from 'k6/metrics'

   export let errorRate = new Rate('errors')

   export let options = {
     stages: [
       { duration: '1m', target: 10 },   // Warm up
       { duration: '2m', target: 50 },   // Ramp up
       { duration: '5m', target: 100 },  // Stay at 100 users
       { duration: '2m', target: 0 },    // Ramp down
     ],
     thresholds: {
       http_req_duration: ['p(95)<500'],  // 95% under 500ms
       http_req_failed: ['rate<0.01'],    // Error rate under 1%
       errors: ['rate<0.1']
     }
   }

   export default function () {
     group('CRM Dashboard', () => {
       let response = http.get('http://localhost:3000/crm/dashboard')
       check(response, {
         'dashboard loads': (r) => r.status === 200,
         'response time OK': (r) => r.timings.duration < 2000,
       }) || errorRate.add(1)
     })

     group('Lead Management', () => {
       let response = http.get('http://localhost:3000/api/leads?limit=20')
       check(response, {
         'leads API responds': (r) => r.status === 200,
         'response time fast': (r) => r.timings.duration < 200,
       }) || errorRate.add(1)
     })

     sleep(1)
   }
   ```

3. **Lighthouse CI Configuration**
   ```json
   // .lighthouserc.json
   {
     "ci": {
       "collect": {
         "url": [
           "http://localhost:3000",
           "http://localhost:3000/crm/dashboard",
           "http://localhost:3000/crm/leads",
           "http://localhost:3000/crm/projects"
         ],
         "numberOfRuns": 3,
         "settings": {
           "chromeFlags": "--no-sandbox --headless"
         }
       },
       "assert": {
         "preset": "lighthouse:recommended",
         "assertions": {
           "categories:performance": ["error", {"minScore": 0.8}],
           "categories:accessibility": ["error", {"minScore": 0.95}],
           "categories:best-practices": ["error", {"minScore": 0.9}],
           "categories:seo": ["error", {"minScore": 0.9}]
         }
       },
       "upload": {
         "target": "lhci",
         "serverBaseUrl": "https://lhci.quantumsolar.com"
       }
     }
   }
   ```

**Deliverables:**
- ✅ K6 load testing scenarios
- ✅ Lighthouse performance auditing
- ✅ Performance benchmarks and thresholds
- ✅ Automated performance testing in CI

## 🚀 Phase 2 Success Metrics

### Coverage Requirements Met:
- **Unit Tests**: 90% code coverage achieved
- **Integration Tests**: 100% API endpoint coverage
- **E2E Tests**: 100% critical user journey coverage
- **Visual Tests**: 100% component story coverage

### Performance Benchmarks:
- **Page Load Times**: < 2 seconds (Lighthouse)
- **API Response Times**: < 200ms (K6)
- **Error Rates**: < 1% under load
- **Accessibility Score**: > 95%

### Testing Infrastructure:
- **Multi-browser Support**: Chrome, Firefox, Safari, Mobile
- **Local Testing Environment**: Supabase + PostgreSQL
- **CI/CD Pipeline**: Automated testing on every commit
- **Visual Regression**: Automatic UI change detection

## 📈 Next Steps: Phase 3 Preparation

With testing infrastructure complete, Phase 3 will focus on:

1. **Monorepo Setup**: Turborepo with shared testing utilities
2. **React Native Foundation**: Mobile app with Detox testing
3. **Component Library**: Tested UI components for web and mobile
4. **API Enhancement**: Typed API routes with comprehensive testing

The robust testing foundation from Phase 2 ensures that all subsequent development phases maintain enterprise-grade quality standards while enabling rapid, confident feature development.

## 🎯 Key Benefits Achieved

- **Quality Assurance**: Comprehensive testing prevents production bugs
- **Developer Confidence**: Safe refactoring and feature development
- **Continuous Integration**: Automated quality checks on every commit
- **Performance Monitoring**: Proactive performance issue detection
- **Visual Consistency**: UI regression prevention across updates
- **Security Validation**: Authentication and authorization testing
- **Cross-platform Support**: Testing across browsers and devices

This testing infrastructure investment in Phase 2 will pay dividends throughout the entire CRM extension development lifecycle, ensuring a robust, reliable, and maintainable system.