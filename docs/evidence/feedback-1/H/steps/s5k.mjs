export default async ({ js, wait, text, shot, log }) => {
  log('5k reason: ' + await js(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Dismiss'); let box = b.parentElement; while (box && !box.querySelector('input,textarea')) box = box.parentElement; const el = box.querySelector('input,textarea'); const p = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype; Object.getOwnPropertyDescriptor(p, 'value').set.call(el, 'Synthetic: the address document was the wrong one; Bob is re-sending it.'); el.dispatchEvent(new Event('input', { bubbles: true })); return 'typed into ' + el.outerHTML.slice(0, 60); })()`)); await wait(300);
  log('5k dismiss: ' + await js(`(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim() === 'Dismiss'); if (b.disabled) return 'disabled'; b.click(); return 'clicked'; })()`)); await wait(2500);
  const t = await text(); log('5k after: Needs decision gone? ' + !/Needs decision/.test(t));
  await shot('05-hannah-dismissed');
};
