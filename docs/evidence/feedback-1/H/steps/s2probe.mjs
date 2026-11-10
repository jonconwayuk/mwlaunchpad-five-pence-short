export default async ({ js }) => {
  console.log(await js(`[...document.querySelectorAll('select')].map((s,i)=>i+':'+(s.getAttribute('aria-label')||s.closest('label')?.textContent.slice(0,20)||'')+':'+s.options[0].text).join(' | ')`));
  console.log(await js(`[...document.querySelectorAll('.react-flow__node')].map(n=>n.dataset.id).join(' ')`));
  console.log(await js(`[...document.querySelectorAll('.react-flow__edge')].map(n=>n.getAttribute('data-testid')||n.id).join(' ')`));
};
