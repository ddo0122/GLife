// server.js
const express = require('express');
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteerExtra.use(StealthPlugin());

const app = express();

app.get('/api/notices', async (req, res) => {
  try {
    const browser = await puppeteerExtra.launch({ headless: false });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.kosha.or.kr/'
    });
    await page.goto('https://www.kosha.or.kr/kosha/report/notice.do', { waitUntil: 'networkidle2' });

    const notices = await page.evaluate(() => {
      const noticeElements = document.querySelectorAll('div.notice_list ul li a');
      const results = [];
      noticeElements.forEach(el => {
        const title = el.textContent.trim();
        const link = el.getAttribute('href');
        if (title && link) {
          results.push({ title, link });
        }
      });
      return results;
    });

    await browser.close();
    res.json(notices);
  } catch (err) {
    res.json([]);
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));