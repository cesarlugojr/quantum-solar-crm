import { http, HttpResponse } from 'msw'

export const handlers = [
  // CRM API endpoints
  http.get('/api/crm/leads', () => {
    return HttpResponse.json([
      {
        id: 'QSLID-001',
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        phone: '555-0123',
        status: 'new',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ])
  }),

  http.get('/api/crm/projects', () => {
    return HttpResponse.json([
      {
        id: 'QSPID-001',
        name: 'Solar Installation - Smith Residence',
        status: 'in_progress',
        value: 25000,
        stage: 'site_survey',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      }
    ])
  }),

  http.get('/api/crm/candidates', () => {
    return HttpResponse.json([
      {
        id: 'QSCID-001',
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane@example.com',
        phone: '555-0124',
        position_applied: 'Solar Installer',
        experience_level: 'mid',
        location: 'Chicago, IL',
        status: 'interview',
        application_date: '2024-01-01T00:00:00Z'
      }
    ])
  }),

  // Auth endpoints
  http.post('/api/auth/callback', () => {
    return HttpResponse.json({ success: true })
  }),

  // Contact form submissions
  http.post('/api/contact', () => {
    return HttpResponse.json({
      success: true,
      message: 'Contact form submitted successfully'
    })
  })
]