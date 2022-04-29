/* eslint-disable no-undef */
import {
  buildIcon,
  readBlockConfig,
} from '../../scripts/scripts.js';

function closeModal() {
  const modal = document.querySelector('.page-options-info-modal');
  if (modal) modal.remove();
}

function displayInfo(e) {
  const target = e.target.closest('[data-info]');
  const existingModal = document.querySelector('.page-options-info-modal');
  if (target && !existingModal) {
    const modal = document.createElement('aside');
    modal.classList.add('page-options-info-modal');
    const closeBtn = document.createElement('a');
    closeBtn.classList.add('page-options-info-modal-close');
    closeBtn.setAttribute('title', 'Close');
    closeBtn.addEventListener('click', closeModal);
    const info = document.createElement('p');
    info.textContent = target.getAttribute('data-info');
    modal.append(info, closeBtn);
    document.querySelector('main').append(modal);
  } else if (existingModal) {
    closeModal();
  }
}

function buildButton(type, info) {
  const a = document.createElement('a');
  a.classList.add('page-options-btn');
  a.setAttribute('title', `${type.charAt(0).toUpperCase()}${type.slice(1)}`);
  if (info) a.setAttribute('data-info', info);
  if (type === 'print') {
    a.addEventListener('click', () => window.print());
  } else if (type === 'info') {
    a.addEventListener('click', displayInfo);
  }
  a.append(buildIcon(`${type}-blue`));
  return a;
}

/**
 * loads and decorates the page options
 * @param {Element} block The page options block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';

  // build print btn
  const printBtn = buildButton('print');
  block.append(printBtn);
  // build info btn
  if (config?.info) {
    const infoBtn = buildButton('info', config.info);
    block.prepend(infoBtn);
  }
}
