import { readBlockConfig, toClassName } from '../../scripts/scripts.js';

function closeMenu(el) {
  el.setAttribute('aria-expanded', false);
}

function closeAllMenus() {
  const expanded = document.querySelectorAll('header [aria-expanded="true"]');
  expanded.forEach((ex) => closeMenu(ex));
}

function openMenu(el) {
  el.setAttribute('aria-expanded', true);
}

function toggleMenu(e) {
  const btn = e.target.closest('[role="button"]');
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    closeMenu(btn);
  } else {
    openMenu(btn);
  }
}

function onMediaChange() {
  const mq = window.matchMedia('(min-width: 992px)');
  const header = document.querySelector('header');
  const collapsed = [...header.classList].includes('collapsed');
  const nav = header.querySelector('.nav');
  if (mq.matches && collapsed) {
    header.classList.remove('collapsed');
    if (nav) nav.setAttribute('aria-expanded', true);
  } else if (!mq.matches && !collapsed) {
    header.classList.add('collapsed');
    if (nav) nav.setAttribute('aria-expanded', false);
  }
}

function buildSemanticNav(el) {
  el.outerHTML = el.outerHTML.replace(/div/g, 'nav');
}

function buildLanguageSwitch(el) {
  const languages = el.querySelectorAll('li');
  el.querySelector('ul').classList.add('nav-language-switch-options');
  // populate language selector options
  languages.forEach((lang) => {
    const selected = lang.querySelector('strong');
    if (selected) {
      // build button
      const btn = document.createElement('a');
      btn.id = 'language-btn';
      btn.classList.add('nav-language-switch-btn');
      btn.setAttribute('aria-current', 'page');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', 0);
      btn.setAttribute('title', 'Switch language');
      btn.setAttribute('aria-label', lang.textContent);
      btn.innerHTML = `${lang.textContent.substring(0, 2)}<span>${lang.textContent.substring(2)}</span>
      <img class="icon icon-angle-down-gray" src="/icons/angle-down-gray.svg" alt=""/>`;
      btn.addEventListener('click', toggleMenu);
      el.prepend(btn);
      lang.closest('li').remove();
    } else {
      // style options
      lang.classList.add('nav-language-switch-option');
    }
  });
}

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */
function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-section').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';

  // expanded or contracted menu
  onMediaChange();
  window.addEventListener('resize', onMediaChange);

  // fetch nav content
  const navPath = config.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  const html = await resp.text();

  // decorate nav DOM
  const nav = document.createElement('div');
  nav.classList.add('nav');
  nav.setAttribute('aria-role', 'navigation');
  const navRow = document.createElement('div');
  navRow.classList.add('nav-row');
  const navSections = document.createElement('div');
  navSections.classList.add('nav-sections');
  nav.innerHTML = html;
  nav.querySelectorAll(':scope > div').forEach((navSection, i) => {
    if (i < 3) {
      const sections = ['brand', 'language-switch', 'social'];
      // first three sections in a row
      navSection.classList.add(`nav-${sections[i]}`);
      navRow.append(navSection);
    } else {
      // all other sections
      navSections.append(navSection);
      navSection.classList.add('nav-section');
      // subsections within sections
      const subsections = navSection.querySelectorAll('h2 + ul');
      if (subsections.length) {
        subsections.forEach((sub) => {
          sub.classList.add(`nav-${toClassName(sub.previousElementSibling.textContent)}`);
          sub.previousElementSibling.remove();
        });
      }
    }
  });
  nav.append(navRow, navSections);
  buildSemanticNav(nav.querySelector('.nav-links').parentNode);
  buildLanguageSwitch(nav.querySelector('.nav-language-switch'));

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    closeAllMenus();
    document.body.style.overflowY = expanded ? '' : 'hidden';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  nav.append(hamburger);
  nav.setAttribute('aria-expanded', 'false');

  block.append(nav);
}
