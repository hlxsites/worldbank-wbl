/**
 * loads and decorates the column split block
 * @param {Element} block The column split block element
 */
export default async function decorate(block) {
  const container = block.parentNode.parentNode;
  const split = document.createElement('div');
  split.classList.add('content-wrapper');
  [...container.children].forEach((child) => {
    if (![...child.classList].includes('column-split-wrapper')) {
      split.append(child);
    }
  });
  container.prepend(split);
}
