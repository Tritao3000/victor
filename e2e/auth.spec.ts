import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/')

    // Click on "Get started" button
    await page.getByRole('link', { name: /get started/i }).first().click()

    // Should be on signup page
    await expect(page).toHaveURL('/signup')
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/')

    // Click on "Sign in" button
    await page.getByRole('link', { name: /sign in/i }).click()

    // Should be on login page
    await expect(page).toHaveURL('/login')
  })

  test('should display signup form', async ({ page }) => {
    await page.goto('/signup')

    // Check for form elements (basic check - adjust based on actual form)
    await expect(page.locator('form')).toBeVisible()
  })

  test('should display login form', async ({ page }) => {
    await page.goto('/login')

    // Check for form elements
    await expect(page.locator('form')).toBeVisible()
  })
})
