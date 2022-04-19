import { buildIcon } from '../../scripts/scripts.js';

function toggle(e) {
  const expanded = e.target.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    e.target.setAttribute('aria-expanded', false);
  } else {
    e.target.setAttribute('aria-expanded', true);
  }
}

/**
 * loads and decorates the accordion block
 * @param {Element} block The accordion block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  rows.forEach((row) => {
    const head = row.querySelector('h2, h3');
    head.classList.add('accordion-head');
    head.setAttribute('role', 'button');
    head.setAttribute('aria-expanded', false);
    head.addEventListener('click', toggle);
    const arrow = buildIcon('angle-down-blue');
    head.append(arrow);
    row.prepend(head);
    row.lastChild.classList.add('accordion-body');
    row.classList.add('accordion-item');
  });
}
