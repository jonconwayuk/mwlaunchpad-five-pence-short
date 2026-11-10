// Real mouse click on the first visible element whose text includes t.
export const rc = async ({ js, send, wait }, t, sel = 'a, button') => {
  const p = await js(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(sel)})].find((b) => b.offsetParent !== null && b.textContent.trim().includes(${JSON.stringify(t)})); if (!el) return null; el.scrollIntoView({block:'center'}); const r = el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  if (!p) return 'NOT FOUND';
  for (const type of ['mouseMoved','mousePressed','mouseReleased']) await send('Input.dispatchMouseEvent', { type, button: 'left', clickCount: 1, ...p });
  await wait(300); return 'clicked';
};
