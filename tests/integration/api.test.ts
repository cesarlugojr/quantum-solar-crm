import { describe, it, expect } from 'vitest'

describe('API Integration Tests', () => {
  describe('CRM Endpoints', () => {
    it('fetches leads from API', async () => {
      const response = await fetch('/api/crm/leads')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('first_name')
      expect(data[0]).toHaveProperty('last_name')
      expect(data[0]).toHaveProperty('email')
      expect(data[0]).toHaveProperty('status')
    })

    it('fetches projects from API', async () => {
      const response = await fetch('/api/crm/projects')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('name')
      expect(data[0]).toHaveProperty('status')
      expect(data[0]).toHaveProperty('value')
      expect(data[0]).toHaveProperty('stage')
    })

    it('fetches candidates from API', async () => {
      const response = await fetch('/api/crm/candidates')
      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBeGreaterThan(0)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('first_name')
      expect(data[0]).toHaveProperty('last_name')
      expect(data[0]).toHaveProperty('position_applied')
      expect(data[0]).toHaveProperty('status')
    })
  })

  describe('Contact Form', () => {
    it('submits contact form successfully', async () => {
      const formData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '555-0123',
        message: 'Test message'
      }

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toHaveProperty('success', true)
      expect(data).toHaveProperty('message')
    })
  })

  describe('Authentication', () => {
    it('handles auth callback', async () => {
      const response = await fetch('/api/auth/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      expect(response.ok).toBe(true)

      const data = await response.json()
      expect(data).toHaveProperty('success', true)
    })
  })
})