import { test, expect } from '@playwright/test'

test.describe('CRM Navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the CRM dashboard
    await page.goto('/crm')
  })

  test('should navigate to leads page from sidebar', async ({ page }) => {
    await page.click('[href="/crm/leads"]')
    await expect(page).toHaveURL('/crm/leads')
    await expect(page.locator('h1')).toContainText('Leads')
    await expect(page.locator('text=Manage and track your solar leads')).toBeVisible()
  })

  test('should navigate to projects page from sidebar', async ({ page }) => {
    await page.click('[href="/crm/projects"]')
    await expect(page).toHaveURL('/crm/projects')
    await expect(page.locator('h1')).toContainText('Projects')
    await expect(page.locator('text=Track solar installation projects')).toBeVisible()
  })

  test('should navigate to candidates page from sidebar', async ({ page }) => {
    await page.click('[href="/crm/candidates"]')
    await expect(page).toHaveURL('/crm/candidates')
    await expect(page.locator('h1')).toContainText('Job Candidates')
    await expect(page.locator('text=Manage solar industry job applications')).toBeVisible()
  })

  test('should display statistics cards on leads page', async ({ page }) => {
    await page.goto('/crm/leads')
    await expect(page.locator('text=Total Leads')).toBeVisible()
    await expect(page.locator('text=New Leads')).toBeVisible()
    await expect(page.locator('text=Qualified')).toBeVisible()
    await expect(page.locator('text=Converted')).toBeVisible()
  })

  test('should display search functionality on all CRM pages', async ({ page }) => {
    // Test leads search
    await page.goto('/crm/leads')
    await expect(page.locator('input[placeholder="Search leads..."]')).toBeVisible()

    // Test projects search
    await page.goto('/crm/projects')
    await expect(page.locator('input[placeholder="Search projects..."]')).toBeVisible()

    // Test candidates search
    await page.goto('/crm/candidates')
    await expect(page.locator('input[placeholder="Search candidates..."]')).toBeVisible()
  })

  test('should display action buttons on all CRM pages', async ({ page }) => {
    // Test leads action button
    await page.goto('/crm/leads')
    await expect(page.locator('text=Add Lead')).toBeVisible()

    // Test projects action button
    await page.goto('/crm/projects')
    await expect(page.locator('text=New Project')).toBeVisible()

    // Test candidates action button
    await page.goto('/crm/candidates')
    await expect(page.locator('text=Add Candidate')).toBeVisible()
  })
})