// screenshot.js
import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

(async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // --- Wide (desktop) screenshot ---
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('http://localhost:4173/');
    await page.waitForTimeout(1000);
    const timerWide = await page.screenshot({ fullPage: true });
    fs.writeFileSync(path.join('public', 'screenshot-timer-wide.png'), timerWide);
    const timerWideSize = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
    }));
    console.log(`Timer (wide): ${timerWideSize.width}x${timerWideSize.height}`);

    await page.goto('http://localhost:4173/history');
    await page.waitForTimeout(1000);
    const historyWide = await page.screenshot({ fullPage: true });
    fs.writeFileSync(path.join('public', 'screenshot-history-wide.png'), historyWide);
    const historyWideSize = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
    }));
    console.log(`History (wide): ${historyWideSize.width}x${historyWideSize.height}`);

    // --- Mobile (narrow) screenshot ---
    await page.setViewportSize({ width: 750, height: 1334 });
    await page.goto('http://localhost:4173/');
    await page.waitForTimeout(1000);
    const timerMobile = await page.screenshot({ fullPage: true });
    fs.writeFileSync(path.join('public', 'screenshot-timer-mobile.png'), timerMobile);
    const timerMobileSize = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
    }));
    console.log(`Timer (mobile): ${timerMobileSize.width}x${timerMobileSize.height}`);

    await page.goto('http://localhost:4173/history');
    await page.waitForTimeout(1000);
    const historyMobile = await page.screenshot({ fullPage: true });
    fs.writeFileSync(path.join('public', 'screenshot-history-mobile.png'), historyMobile);
    const historyMobileSize = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
    }));
    console.log(`History (mobile): ${historyMobileSize.width}x${historyMobileSize.height}`);

    await browser.close();
})();