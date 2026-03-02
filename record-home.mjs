import playwright from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const { chromium } = playwright;
const FRAMES_DIR = '/tmp/pw-frames-home';

(async () => {
  // Clean up previous frames
  if (fs.existsSync(FRAMES_DIR)) fs.rmSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  await page.goto('http://localhost:3000');

  // Capture frames at ~30fps for 12 seconds = 360 frames
  const totalDuration = 12000;
  const interval = 33; // ~30fps
  const totalFrames = Math.ceil(totalDuration / interval);

  for (let i = 0; i < totalFrames; i++) {
    const padded = String(i).padStart(5, '0');
    await page.screenshot({ path: path.join(FRAMES_DIR, `frame_${padded}.png`) });
    if (i < totalFrames - 1) {
      await page.waitForTimeout(interval);
    }
  }

  await browser.close();
  console.log(`Captured ${totalFrames} frames`);

  // Compose frames into video at 30fps, scale up to 780x1688
  execSync(`ffmpeg -y -framerate 30 -i "${FRAMES_DIR}/frame_%05d.png" -vf "scale=780:1688:flags=lanczos" -vcodec libx264 -crf 18 -preset slow -movflags +faststart -pix_fmt yuv420p "/Users/reidsurmeier/Meta_Finder/18_Code Base/PersonalWebsite/public/mobile-home.mp4"`);
  console.log('Done: mobile-home.mp4');
})();
