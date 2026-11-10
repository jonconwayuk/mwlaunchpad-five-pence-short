export default async ({ go, wait, js, text, log, click }) => {
  await go('/portal'); await wait(4000);
  log('p0 url: ' + await js('location.pathname'));
  log('p0 selects: ' + await js(`[...document.querySelectorAll('select')].map((s,i)=>i+':'+(s.getAttribute('aria-label')||s.closest('label')?.textContent?.slice(0,30)||'')+'='+s.options[s.selectedIndex]?.text).join(' | ')`));
  log('p0 buttons: ' + await js(`[...document.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim().slice(0,40)).join(' | ')`));
};
