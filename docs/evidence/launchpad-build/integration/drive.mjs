// Click-through driver over headless Chrome CDP (Node 22, no deps). 390px results are headless, not a device.
// Usage: node drive.mjs <url> <width> <persona|-> <out-prefix> '<js step 1>' '<js step 2>' ...
// Each step is evaluated in the page (may return a string), then 2.5 s wait, then text + screenshot <prefix>-<n>.png.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [url, width, persona, prefix, ...steps] = process.argv.slice(2);
const port = 9400 + Math.floor(Math.random() * 500);
const proc = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'int-'))}`, 'about:blank']);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
try {
  let t; for (let i = 0; i < 30 && !t; i++) { await wait(300); t = await fetch(`http://127.0.0.1:${port}/json`).then((r) => r.json()).catch(() => undefined); }
  const ws = new WebSocket(t.find((x) => x.type === 'page').webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener('open', r));
  let id = 0;
  const send = (method, params = {}) => new Promise((res) => { const n = ++id; const on = (e) => { const m = JSON.parse(e.data); if (m.id === n) { ws.removeEventListener('message', on); res(m.result); } }; ws.addEventListener('message', on); ws.send(JSON.stringify({ id: n, method, params })); });
  const w = Number(width);
  await send('Page.enable');
  await send('Page.setInterceptFileChooserDialog', { enabled: false }).catch(() => {});
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: w > 500 ? 800 : 844, deviceScaleFactor: 1, mobile: w <= 500 });
  if (persona !== '-') await send('Network.setCookie', { name: 'persona', value: persona, url });
  await send('Page.navigate', { url });
  await wait(3500);
  ws.addEventListener('message', (e) => { const m = JSON.parse(e.data); if (m.method === 'Page.javascriptDialogOpening') send('Page.handleJavaScriptDialog', { accept: true, promptText: 'Synthetic demo reason' }); });
  for (let s = 0; s <= steps.length; s++) {
    if (s > 0) { const r = await send('Runtime.evaluate', { expression: steps[s - 1], returnByValue: true, awaitPromise: true }); process.stdout.write(`--- step ${s} returned: ${JSON.stringify(r?.result?.value ?? r?.exceptionDetails?.text)}\n`); await wait(2500); }
    const { result } = await send('Runtime.evaluate', { expression: 'JSON.stringify({sw: document.documentElement.scrollWidth, text: document.body.innerText})', returnByValue: true });
    const m = JSON.parse(result.value);
    writeFileSync(`${prefix}-${s}.png`, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
    writeFileSync(`${prefix}-${s}.txt`, `width ${w} scrollWidth ${m.sw}\n${m.text}\n`);
  }
  ws.close();
} finally { proc.kill(); }
