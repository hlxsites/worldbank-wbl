import {
  readBlockConfig,
  toClassName,
} from '../../scripts/scripts.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;

  footer.querySelectorAll(':scope > div').forEach((section) => {
    const row = document.createElement('div');
    row.classList.add('footer-row');
    row.append(section);
    footer.append(row);
    // subsections within sections
    const subsections = section.querySelectorAll('h2 + ul');
    if (subsections.length) {
      subsections.forEach((sub) => {
        sub.classList.add(`footer-${toClassName(sub.previousElementSibling.textContent)}`);
        sub.previousElementSibling.remove();
      });
    }
  });
  block.append(footer);
}
