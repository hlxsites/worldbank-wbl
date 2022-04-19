/**
 * loads and decorates the tabs block
 * @param {Element} block The tabs block element
 */
export default async function decorate(block) {
  const tabs = block.querySelectorAll('ul li');
  tabs.forEach((tab) => {
    tab.classList.add('tab');
    if (tab.querySelector('strong')) {
      tab.classList.add('tab-current');
      tab.setAttribute('aria-current', 'page');
    }
  });
}
