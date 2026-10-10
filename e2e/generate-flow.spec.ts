import { test, expect } from '@playwright/test';

test.describe('Space Weaver End-to-End Flow', () => {
  test('should create a room, generate layouts, and display results', async ({ page }) => {
    // 1. Navigate to home page
    await page.goto('http://localhost:5173');

    // 2. We should be on the StudioSetup page (first step).
    // Let's assume the user enters width, length and clicks "Next"
    // (Playwright will find the inputs by label or placeholder)
    
    // Instead of deep testing specific UI elements (which might change),
    // let's do a broad check. If there's a specific flow we need to click, we can target it.
    
    // Usually, the flow is:
    // Room Settings (Width, Length) -> Click Next
    // Add Furniture -> Click Next 
    // Add Intent (Vibe/Description) -> Click Generate
    
    // Let's write a generic resilient test that tries to click buttons that move the flow forward.
    await expect(page.getByText('Room Dimensions', { exact: false })).toBeVisible();
    
    // The "Next" button usually continues to the next step
    const nextBtn = page.getByRole('button', { name: /Next|Continue/i }).first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
    }

    // Now on furniture setup
    await expect(page.getByText('Furniture', { exact: false })).toBeVisible();
    
    const nextBtn2 = page.getByRole('button', { name: /Next|Continue/i }).first();
    if (await nextBtn2.isVisible()) {
      await nextBtn2.click();
    }
    
    // Now on Intent/Vibe step
    await expect(page.getByText('Vibe', { exact: false }).or(page.getByText('Intent', { exact: false }))).toBeVisible();
    
    // Click Generate
    const generateBtn = page.getByRole('button', { name: /Generate Layout|Weave Space/i });
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // 4. Verify we hit the Design Results page
    // The engine takes some time (e.g. 500ms to 2000ms) to respond
    // We expect the UI to show something like "Shopping List", "Layout", or "Score"
    await expect(page.getByText(/Shopping List|Score Breakdown|Selected Philosophy/i).first()).toBeVisible({ timeout: 15000 });
    
    // Ensure the 2D canvas rendered
    await expect(page.locator('canvas').first()).toBeVisible();
  });
});
