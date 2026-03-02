import playwright from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const { chromium } = playwright;
const FRAMES_DIR = '/tmp/pw-frames-cv';

(async () => {
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(3000);

  // Navigate to CV
  const menuBtn = page.locator('button').filter({ hasText: 'Menu' }).first();
  await menuBtn.click();
  await page.waitForTimeout(500);
  await page.locator('text=Curriculum Vitae').first().click();
  await page.waitForTimeout(3500);

  let frameIdx = 0;
  const captureFrame = async () => {
    const padded = String(frameIdx++).padStart(5, '0');
    await page.screenshot({ path: path.join(FRAMES_DIR, `frame_${padded}.png`) });
  };

  // Helper: scroll the inner gallery container
  const scrollTo = async (y) => {
    await page.evaluate((scrollY) => {
      const divs = document.querySelectorAll('div');
      for (const el of divs) {
        const style = window.getComputedStyle(el);
        if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 100) {
          el.scrollTop = scrollY;
          return;
        }
      }
      window.scrollTo(0, scrollY);
    }, y);
  };

  // Ease in-out function
  const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

  const totalScroll = 1400;

  // Phase 1: 1.5s static at top (45 frames)
  for (let i = 0; i < 45; i++) {
    await captureFrame();
    await page.waitForTimeout(33);
  }

  // Phase 2: Scroll down over 3s (90 frames)
  for (let i = 0; i < 90; i++) {
    const scrollY = Math.round(easeInOut(i / 90) * totalScroll);
    await scrollTo(scrollY);
    await captureFrame();
    await page.waitForTimeout(33);
  }

  // Phase 3: 1s pause at bottom (30 frames)
  for (let i = 0; i < 30; i++) {
    await captureFrame();
    await page.waitForTimeout(33);
  }

  // Phase 4: Scroll back up over 3s (90 frames)
  for (let i = 0; i < 90; i++) {
    const scrollY = Math.round((1 - easeInOut(i / 90)) * totalScroll);
    await scrollTo(scrollY);
    await captureFrame();
    await page.waitForTimeout(33);
  }

  // Phase 5: 1s pause at top (30 frames)
  for (let i = 0; i < 30; i++) {
    await captureFrame();
    await page.waitForTimeout(33);
  }

  await browser.close();
  console.log(`Captured ${frameIdx} frames`);

  // Compose into video at 30fps
  execSync(`ffmpeg -y -framerate 30 -i "${FRAMES_DIR}/frame_%05d.png" -vf "scale=780:1688:flags=lanczos" -vcodec libx264 -crf 18 -preset slow -movflags +faststart -pix_fmt yuv420p "/Users/reidsurmeier/Meta_Finder/18_Code Base/PersonalWebsite/public/mobile-cv.mp4"`);
  console.log('Done: mobile-cv.mp4');
})();
