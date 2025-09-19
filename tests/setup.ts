import '@testing-library/jest-dom'
import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'
import { server } from './mocks/server'

// Global test setup
beforeAll(() => {
  // Mock environment variables for testing
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co'
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = 'pk_test_test-key'

  // Start MSW server
  server.listen({
    onUnhandledRequest: 'error'
  })
})

// Cleanup after each test
afterEach(() => {
  cleanup()
  server.resetHandlers()
})

// Global cleanup
afterAll(() => {
  server.close()
})