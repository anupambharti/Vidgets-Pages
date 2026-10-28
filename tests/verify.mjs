import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = resolve(fileURLToPath(new URL('../', import.meta.url)));
if (process.env.VIDGETS_APP_POLICY) {
  assert.deepEqual(
    JSON.parse(await readFile(resolve(root, 'content/privacy-policy.json'), 'utf8')),
    JSON.parse(await readFile(process.env.VIDGETS_APP_POLICY, 'utf8')),
    'Website and bundled app policies differ'
  );
}
const prefix = '/vidgets-support/';
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    assert(url.pathname.startsWith(prefix));
    const path = resolve(root, decodeURIComponent(url.pathname.slice(prefix.length) || 'index.html'));
    assert(path.startsWith(root + sep));
    const body = await readFile(path);
    res.setHeader('Content-Type', path.endsWith('.css') ? 'text/css' : path.endsWith('.svg') ? 'image/svg+xml' : 'text/html; charset=utf-8');
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
await mkdir(resolve(root, 'output'), { recursive: true });
let cases = 0;
try {
  for (const colorScheme of ['light', 'dark']) {
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, javaScriptEnabled: false });
      const page = await context.newPage();
      page.setDefaultTimeout(10000);
      page.setDefaultNavigationTimeout(10000);
      const external = [];
      const failures = [];
      page.on('request', req => { if (!req.url().startsWith(origin)) external.push(req.url()); });
      page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
      for (const name of ['index', 'privacy', 'support']) {
        const response = await page.goto(`${origin}${prefix}${name}.html`);
        assert.equal(response.status(), 200);
        assert.equal(await page.locator('h1').count(), 1);
        assert.equal(await page.locator('main').count(), 1);
        assert.equal(await page.locator('script').count(), 0);
        assert(await page.title());
        const layout = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
        assert(layout.scroll <= layout.width, `Horizontal overflow: ${name}, ${width}, ${colorScheme}`);
        const links = await page.locator('a[href], link[href], img[src]').evaluateAll(nodes => nodes.map(node => node.getAttribute('href') || node.getAttribute('src')));
        for (const href of links) {
          if (href.startsWith('#')) assert.equal(await page.locator(href).count(), 1, `Missing anchor ${href}`);
          else if (!/^(https:|mailto:)/.test(href)) {
            const linked = await context.request.get(new URL(href, page.url()).href);
            assert.equal(linked.status(), 200, `Broken local link ${href}`);
          }
        }
        if (name === 'privacy') {
          const policy = JSON.parse(await readFile(resolve(root, 'content/privacy-policy.json'), 'utf8'));
          for (const section of policy.sections) {
            assert.equal(await page.locator(`#${section.id} h2`).textContent(), section.title);
            assert.deepEqual(await page.locator(`#${section.id} p`).allTextContents(), section.paragraphs);
          }
        }
        if (name === 'support') {
          assert(await page.locator('a[href^="mailto:admin@technoforbes.com"]').count() > 0);
          assert((await page.locator('#manage-sets').textContent()).includes('Delete set'));
          const text = await page.locator('article').textContent();
          assert(text.includes('12 widget types'));
          for (const title of ['Habit check-in', 'Last done', 'Quick counter', 'Next priority', 'Month at a glance']) {
            assert(text.includes(title), `Missing widget help: ${title}`);
          }
          assert(text.includes('On first launch, finish the welcome screens'));
          assert(text.includes('Settings > Guided app tour'));
          assert(!/medication/i.test(text), 'Removed feature still advertised');
          await page.locator('summary').first().click();
          assert(await page.locator('details').first().getAttribute('open') !== null);
        }
        await page.screenshot({ path: resolve(root, `output/${name}-${width}-${colorScheme}.png`), fullPage: true });
        await page.screenshot({ path: resolve(root, `output/${name}-${width}-${colorScheme}-viewport.png`) });
        await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at 200% text: ${name}, ${width}`);
        cases += 1;
        console.log(`PASS: ${name}, ${width}px, ${colorScheme}`);
      }
      assert.deepEqual(external, [], 'Unexpected third-party request');
      assert.deepEqual(failures, [], 'Failed asset request');
      await context.close();
    }
  }
  console.log(`PASS: ${cases} page/viewport/appearance cases; 200% text; JavaScript disabled; nested project path; links; FAQ; policy parity; no third-party requests.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
