import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the main heading', async ({ page }) => {
    await page.goto('/')

    const heading = page.getByRole('heading', {
      name: /professional home services, delivered fast/i
    })
    await expect(heading).toBeVisible()
  })

  test('should have navigation links', async ({ page }) => {
    await page.goto('/')

    // Check header navigation
    await expect(page.getByRole('link', { name: /services/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /how it works/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /get started/i })).toBeVisible()
  })

  test('should navigate to service categories', async ({ page }) => {
    await page.goto('/')

    // Click on Plumbing service
    const plumbingLink = page.getByRole('link', { name: /view plumbing services/i })
    await plumbingLink.click()

    await expect(page).toHaveURL('/services/plumbing')
  })

  test('should display trust indicators', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByText(/verified professionals/i)).toBeVisible()
    await expect(page.getByText(/licensed & insured/i)).toBeVisible()
    await expect(page.getByText(/same-day service/i)).toBeVisible()
  })

  test('should have CTA buttons', async ({ page }) => {
    await page.goto('/')

    // Hero section CTAs
    const bookServiceBtn = page.getByRole('link', { name: /book a service/i }).first()
    await expect(bookServiceBtn).toBeVisible()

    const learnMoreBtn = page.getByRole('link', { name: /learn more/i }).first()
    await expect(learnMoreBtn).toBeVisible()
  })
})
