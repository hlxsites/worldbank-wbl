/**
 * loads and decorates the list block
 * @param {Element} block The list block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    row.classList.add('list-row');
    const cols = [...row.children];
    cols.forEach((col) => {
      col.classList.add('list-col');
      const img = col.querySelector('p picture');
      const pa = col.querySelector('p a');
      if ((img && pa) && (img.parentElement.nextElementSibling === pa.parentElement)) {
        const imgWrap = pa.cloneNode(true);
        imgWrap.innerHTML = img.outerHTML;
        img.replaceWith(imgWrap);
        pa.remove();
      }
      const prevDetail = col.querySelector('p:first-child + h2, p:first-child + h3');
      const postDetail = col.querySelector('h2 + p em, h3 + p em');
      if (prevDetail) {
        const p = col.querySelector('p:first-child');
        const em = p.querySelector('em');
        if (p.textContent === em.textContent) {
          p.classList.add('detail', 'list-detail');
        }
      }
      if (postDetail) {
        const p = col.querySelector('h2 + p, h3 + p');
        const em = p.querySelector('em');
        if (p.textContent === em.textContent) {
          p.classList.add('detail', 'list-detail');
        }
      }
      const as = col.querySelectorAll('a');
      as.forEach((a) => {
        if (a.parentNode.nodeName === 'DIV') {
          a.classList.add('btn', 'list-btn');
        }
      });
    });
    if (cols.length === 2) { // two column layout
      row.classList.add('list-row-2-col');
    }
  });
}
