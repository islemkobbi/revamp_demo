import {chromium, expect} from '@playwright/test';

const browser = await chromium.launch({headless: true});
const url = process.env.TEST_URL || 'http://127.0.0.1:5173/';
const errors = [];

try {
  for (const format of ['webm', 'mp4']) {
    const page = await browser.newPage({viewport: {width: 1440, height: 1000}});
    page.on('pageerror', error => errors.push(error.message));
    if (format === 'mp4') {
      // Exercise the real source fallback, including the source error handler.
      await page.route('**/videos/browser/*.webm*', route => route.abort());
    }
    await page.goto(url);
    const videos = page.locator('#robustness video');
    await expect(videos).toHaveCount(3);
    await page.locator('#robustness').scrollIntoViewIfNeeded();
    for (const video of await videos.all()) {
      await expect(video.locator('source')).toHaveCount(2);
      await expect.poll(() => video.evaluate(el => el.readyState)).toBeGreaterThanOrEqual(2);
      const state = await video.evaluate(el => ({
        src: el.currentSrc, width: el.videoWidth, height: el.videoHeight,
        controls: el.controls, muted: el.muted, loop: el.loop,
        autoplay: el.autoplay, inline: el.playsInline, rate: el.playbackRate,
      }));
      expect(state.src).toContain(`/videos/browser/`);
      expect(state.src).toContain(`.${format}?v=`);
      expect(state.width).toBe(1280);
      expect(state.height).toBe(1162);
      for (const property of ['controls', 'muted', 'loop', 'autoplay', 'inline']) expect(state[property]).toBe(true);
      expect(state.rate).toBe(1.5);
      await video.evaluate(async el => {el.currentTime = 2; await el.play();});
      await expect.poll(() => video.evaluate(el => el.currentTime)).toBeGreaterThan(2.2);
      await video.evaluate(el => el.pause());
      expect(await video.evaluate(el => el.paused)).toBe(true);
    }
    const heights = await videos.evaluateAll(els => els.map(el => el.getBoundingClientRect().height));
    expect(Math.max(...heights) - Math.min(...heights)).toBeLessThan(1);
    await expect(page.locator('#robustness .video-error')).toHaveCount(0);
    await expect(page.locator('#robustness .robustness-video-frame')).toHaveCount(0);
    await expect(page.locator('#qualitative video')).toHaveCount(3);
    await page.close();
  }

  const mobile = await browser.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  mobile.on('pageerror', error => errors.push(error.message));
  await mobile.goto(url);
  const cards = await mobile.locator('#robustness .case-card').evaluateAll(els => els.map(el => {
    const {x, y, width, bottom} = el.getBoundingClientRect();
    return {x, y, width, bottom};
  }));
  expect(cards).toHaveLength(3);
  for (let index = 0; index < cards.length; index++) {
    expect(cards[index].x).toBeGreaterThanOrEqual(0);
    expect(cards[index].x + cards[index].width).toBeLessThanOrEqual(390);
    if (index) expect(cards[index].y).toBeGreaterThanOrEqual(cards[index - 1].bottom);
  }
  expect(await mobile.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  expect(errors).toEqual([]);
  console.log('Video checks passed: WebM playback, MP4 fallback, controls, seeking, speed, equal heights, and mobile layout.');
} finally {
  await browser.close();
}
