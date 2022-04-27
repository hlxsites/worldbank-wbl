import {
  buildIcon,
  fetchEconomies,
  fetchIndicators,
  readBlockConfig,
  toCamelCase,
  toggleMenu,
} from '../../scripts/scripts.js';

function buildOption(name, path, url) {
  const o = document.createElement('a');
  o.textContent = name;
  const sanitizedPath = path
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // eslint-disable-next-line no-useless-escape
    .replace(/[^_\.\/a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  o.href = new URL(`${url}${sanitizedPath}`);
  const li = document.createElement('li');
  li.classList.add('dropdown-option');
  li.append(o);
  return li;
}

function filterDropdown(e) {
  const { target } = e;
  const { value } = target;
  const parent = target.closest('.dropdown-links');
  parent.querySelectorAll('.dropdown-option').forEach((option) => {
    if (!value.length || option.textContent.toLowerCase().includes(value)) {
      option.classList.remove('hide');
    } else {
      option.classList.add('hide');
    }
  });
}

/**
 * loads and decorates the dropdown links
 * @param {Element} block The dropdown links block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';

  // build button
  const btn = document.createElement('a');
  btn.classList.add('dropdown-btn');
  btn.id = `dropdown-btn-${toCamelCase(config.type)}`;
  btn.setAttribute('aria-expanded', false);
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', `Select ${config.type.match(/^[aieouAIEOU].*/) ? 'an' : 'a'} ${config.type}`);
  btn.innerHTML = `<span>Select ${config.type.match(/^[aieouAIEOU].*/) ? 'an' : 'a'} ${config.type}</span>
    ${buildIcon('angle-down-white').outerHTML}`;
  btn.addEventListener('click', toggleMenu);
  block.prepend(btn);

  // build options wrapper
  const options = document.createElement('ul');
  options.classList.add('dropdown-options');
  // populate options
  if (config.type.toLowerCase() === 'indicator') {
    const indicators = await fetchIndicators();
    indicators.forEach((i) => {
      if (i.IndicatorCode !== 'WBL_ALL') {
        const option = buildOption(
          i.IndicatorPublishedName,
          i.IndicatorCode.toLowerCase().replace('_', '-'),
          config.url,
        );
        options.append(option);
      }
    });
    block.append(options);
  } else if (config.type.toLowerCase() === 'economy') {
    const wrapper = document.createElement('div');
    wrapper.classList.add('dropdown-options', 'dropdown-filter-wrapper');
    // build filter
    const filter = document.createElement('input');
    filter.classList.add('dropdown-filter');
    filter.id = `dropdown-btn-${toCamelCase(config.type)}-filter`;
    filter.setAttribute('placeholder', `Filter ${config.type.toLowerCase()} list...`);
    filter.addEventListener('keyup', filterDropdown);
    const icon = buildIcon('filter-blue');
    wrapper.prepend(filter, icon);
    const economies = await fetchEconomies();
    economies.forEach((e) => {
      const path = !window.location.pathname.includes('/reforms') && !window.location.pathname.includes('/local-experts')
        ? `${e.EconomyUrlName.toLowerCase()}/${new Date().getFullYear()}`
        : e.EconomyUrlName.toLowerCase();
      const option = buildOption(e.Name, path, config.url);
      options.append(option);
    });
    wrapper.append(options);
    block.append(wrapper);
  } else if (config.type.toLowerCase() === 'country') {
    const economies = await fetchEconomies();
    economies.forEach((e) => {
      const segments = e.Name.replace(/\./g, '').split(' ').map((w, i) => (i !== 0 ? w.toLowerCase() : w));
      const option = buildOption(e.Name, `${segments.join('-')}.pdf`, config.url);
      options.append(option);
    });
    block.append(options);
  }

  const wrapper = block.parentElement;
  if (wrapper?.nextElementSibling) {
    const or = (wrapper.nextElementSibling.textContent.toLowerCase() === 'or')
      && (wrapper.parentNode.children.length === 3);
    // setup layout for two dropdowns separated by OR
    if (or) {
      const p = wrapper.nextElementSibling.querySelector('p');
      if (p) { p.classList.add('detail', 'or-detail'); }
      const container = wrapper.parentElement;
      container.classList.add('dropdown-links-or');
    }
  }
}
