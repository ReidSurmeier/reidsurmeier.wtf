import playwright from 'playwright';

const { chromium } = playwright;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(8000);

  // Click Web + UI/UX
  try {
    await page.locator('text=Web + UI/UX').first().click({ timeout: 5000 });
  } catch {
    await page.evaluate(() => {
      const els = document.querySelectorAll('span');
      for (const el of els) {
        if (el.textContent?.includes('Web + UI/UX')) {
          el.click();
          break;
        }
      }
    });
  }
  await page.waitForTimeout(2000);

  // Scroll the inner gallery content container, not the page
  await page.evaluate(() => {
    const containers = document.querySelectorAll('div');
    for (const el of containers) {
      const style = window.getComputedStyle(el);
      if (style.overflowY === 'auto' && el.scrollHeight > el.clientHeight) {
        el.scrollTop = el.scrollHeight; // scroll to bottom to find phones
        return;
      }
    }
  });
  await page.waitForTimeout(1000);

  // Now scroll back up a bit to find the phone mockups
  await page.evaluate(() => {
    const containers = document.querySelectorAll('div');
    for (const el of containers) {
      const style = window.getComputedStyle(el);
      if (style.overflowY === 'auto' && el.scrollHeight > el.clientHeight) {
        // Look for the phone frame images
        const imgs = el.querySelectorAll('img[src*="phone-frame"]');
        if (imgs.length > 0) {
          imgs[0].scrollIntoView({ block: 'center' });
        }
        return;
      }
    }
  });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: '/tmp/phone-mockup-check.png', fullPage: false });
  console.log('Screenshot saved');

  await browser.close();
})();
