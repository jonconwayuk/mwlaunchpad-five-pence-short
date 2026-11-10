// Screenshot + page text through headless Chrome CDP (Node 22, no deps). 390px results are headless, not a device.
// Usage: node shot.mjs <url> <out.png> <width> [personaCookie] [waitMs]
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [url, out, width = '390', persona, waitMs = '4000'] = process.argv.slice(2);
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
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: w > 500 ? 800 : 844, deviceScaleFactor: 1, mobile: w <= 500 });
  if (persona) await send('Network.setCookie', { name: 'persona', value: persona, url });
  await send('Page.navigate', { url });
  await wait(Number(waitMs));
  const { result } = await send('Runtime.evaluate', { expression: 'JSON.stringify({sw: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, text: document.body.innerText})', returnByValue: true });
  const m = JSON.parse(result.value);
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: Math.min(m.h, 4000), deviceScaleFactor: 1, mobile: w <= 500 });
  writeFileSync(out, Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
  process.stdout.write(`width ${w} scrollWidth ${m.sw}\n${m.text}\n`);
  ws.close();
} finally { proc.kill(); }
