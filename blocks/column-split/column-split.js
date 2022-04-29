/**
 * loads and decorates the column split block
 * @param {Element} block The column split block element
 */
export default async function decorate(block) {
  const container = block.parentNode.parentNode;
  const wrapper = document.createElement('div');
  const split = document.createElement('div');
  split.classList.add('content-wrapper');
  [...container.children].forEach((child) => {
    if (![...child.classList].includes('column-split-wrapper')) {
      split.append(child);
    } else {
      wrapper.append(child);
    }
  });
  wrapper.prepend(split);
  const h1 = wrapper.querySelector('h1');
  if (h1) {
    wrapper.prepend(h1);
  }

  container.append(wrapper);
}
