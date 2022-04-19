/**
 * loads and decorates the list block
 * @param {Element} block The list block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    row.classList.add('list-row');
    const columns = [...row.children];
    columns.forEach((column) => {
      column.classList.add('list-col');
      const prevDetail = column.querySelector('p:first-child + h2, p:first-child + h3');
      const postDetail = column.querySelector('h2 + p em, h3 + p em');
      if (prevDetail) {
        const p = column.querySelector('p:first-child');
        const em = p.querySelector('em');
        if (p.textContent === em.textContent) {
          p.classList.add('detail', 'list-detail');
        }
      }
      if (postDetail) {
        const p = column.querySelector('h2 + p, h3 + p');
        const em = p.querySelector('em');
        if (p.textContent === em.textContent) {
          p.classList.add('detail', 'list-detail');
        }
      }
      const pa = column.querySelector('p a');
      const as = column.querySelectorAll('a');
      if (pa) {
        const p = pa.parentNode;
        if (p.textContent === pa.textContent) {
          p.classList.add('list-btn-wrapper');
          pa.classList.add('btn', 'list-btn');
        }
      }
      as.forEach((a) => {
        if (a.parentNode.nodeName === 'DIV') {
          a.classList.add('btn', 'list-btn');
        }
      });
    });
    // if (columns.length === 1) { // single column layout
    // }
  });
}
