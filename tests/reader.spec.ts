import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const SCREENSHOT_DIR = path.resolve(process.cwd(), 'docs/screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

test.describe('BlueLeaf Books Reader - End-to-End Content Verification', () => {
  test('Project Gutenberg: displays real chapters beyond cover and navigates', async ({ page }) => {
    // Open Pride and Prejudice (PG #1342)
    await page.goto('/book/gutendex/1342');

    // Wait for reader canvas to load (no longer showing loading spinner)
    const readerCanvas = page.locator('div[aria-label^="Reading text for"]');
    await expect(readerCanvas).toBeVisible({ timeout: 35_000 });

    // Assert real text body is rendered, not just a cover or description
    const text = await readerCanvas.innerText();
    expect(text.length).toBeGreaterThan(1_000);

    // Screenshot 1: First Chapter / Readable Body
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'gutenberg-chapter-1.png'), fullPage: false });

    // Verify Chapter Navigation: Advance to Chapter 1 / Next Chapter
    const nextChapterButton = page.getByRole('button', { name: /next chapter/i });
    if (await nextChapterButton.isVisible()) {
      await nextChapterButton.click();
      await page.waitForTimeout(500);

      // Verify Chapter text is active
      const nextText = await readerCanvas.innerText();
      expect(nextText.length).toBeGreaterThan(500);
      expect(nextText.toLowerCase()).toContain('truth universally acknowledged');

      // Screenshot 2: Middle Chapter
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'gutenberg-chapter-2.png'), fullPage: false });

      // Advance again to test later chapter
      if (await nextChapterButton.isVisible()) {
        await nextChapterButton.click();
        await page.waitForTimeout(500);
        // Screenshot 3: Later Chapter
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'gutenberg-later-chapter.png'), fullPage: false });
      }
    }
  });

  test('Mobile Reader Layout: reader canvas is primary on small viewports', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/book/gutendex/1342');

    const readerCanvas = page.locator('div[aria-label^="Reading text for"]');
    await expect(readerCanvas).toBeVisible({ timeout: 35_000 });

    // In responsive order, reader canvas is visible at top without scrolling past the cover
    const canvasBox = await readerCanvas.boundingBox();
    expect(canvasBox).not.toBeNull();
    // Canvas should start in upper portion of viewport (below header/toolbar ~ 100-250px)
    expect(canvasBox!.y).toBeLessThan(350);

    // Screenshot 4: Mobile Viewport Reader
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-reader-layout.png'), fullPage: false });
  });

  test('Standard Ebooks: renders curated full-text edition in reader', async ({ page }) => {
    await page.goto('/book/standardebooks/jane-austen%2Fpride-and-prejudice');

    const readerCanvas = page.locator('div[aria-label^="Reading text for"]');
    await expect(readerCanvas).toBeVisible({ timeout: 25_000 });

    const text = await readerCanvas.innerText();
    expect(text.length).toBeGreaterThan(1_000);
    expect(text.toLowerCase()).toContain('truth universally acknowledged');

    // Screenshot 5: Standard Ebooks Reader
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'standardebooks-reading.png'), fullPage: false });
  });

  test('Wikisource: renders real article and poem body in reader', async ({ page }) => {
    await page.goto('/book/wikisource/The_Raven_and_Other_Poems%2FThe_Raven');

    const readerCanvas = page.locator('div[aria-label^="Reading text for"]');
    await expect(readerCanvas).toBeVisible({ timeout: 25_000 });

    const text = await readerCanvas.innerText();
    expect(text.length).toBeGreaterThan(500);
    expect(text.toLowerCase()).toContain('once upon a midnight dreary');

    // Screenshot 6: Wikisource Reader
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'wikisource-reading.png'), fullPage: false });
  });

  test('Internet Archive: renders OCR text or official BookReader embed beyond cover', async ({ page }) => {
    await page.goto('/book/internetarchive/alicesadventures00carr');

    // Either the in-app reader canvas or the official BookReader iframe must render
    const readerCanvas = page.locator('div[aria-label^="Reading text for"]');
    const iframeEmbed = page.locator('iframe[title^="Internet Archive"]');

    await expect(readerCanvas.or(iframeEmbed)).toBeVisible({ timeout: 25_000 });

    if (await readerCanvas.isVisible()) {
      const text = await readerCanvas.innerText();
      expect(text.length).toBeGreaterThan(500);
    } else {
      await expect(iframeEmbed).toBeVisible();
      const src = await iframeEmbed.getAttribute('src');
      expect(src).toContain('archive.org/embed/alicesadventures00carr');
    }

    // Screenshot 7: Internet Archive Reader
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'internet-archive-reading.png'), fullPage: false });
  });
});
