import { test, expect } from '@playwright/test';

test.describe('TripMatch landing page', () => {
  test('has app title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Easy Travels|TripMatch/);
  });

  test('shows hero heading and CTA buttons', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', {
        name: /Let's plan a trip that actually fits you/i,
      })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('shows feature sections', async ({ page }) => {
    await page.goto('/');
    await expect(
      page.getByRole('heading', { name: 'AI-Powered Suggestions' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Smart Planning' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Discover New Places' })
    ).toBeVisible();
  });
});
