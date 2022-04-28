import {
  buildIcon,
  fetchEconomies,
  readBlockConfig,
  toCamelCase,
  toggleMenu,
  closeAllMenus,
} from '../../scripts/scripts.js';

function sanitizePath(path) {
  return path
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // eslint-disable-next-line no-useless-escape
    .replace(/[^\/a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function setDropdownValue(e) {
  const target = e.target.closest('[data-value]');
  const btn = e.target.closest('ul').previousElementSibling;
  const text = target.textContent;
  const value = target.getAttribute('data-value');
  btn.setAttribute('data-value', value);
  btn.querySelector('span').textContent = text;
  closeAllMenus();
}

function buildOption(option) {
  const o = document.createElement('a');
  o.textContent = option.name;
  o.setAttribute('data-value', option.value);
  o.addEventListener('click', setDropdownValue);
  const li = document.createElement('li');
  li.classList.add('dropdown-option');
  li.append(o);
  return li;
}

function buildDropdown(type, options) {
  // build wrapper
  const dropdown = document.createElement('div');
  dropdown.classList.add('dropdown-toggle', 'block');
  // build button
  const btn = document.createElement('a');
  btn.classList.add('dropdown-btn');
  btn.id = `dropdown-btn-${toCamelCase(type)}`;
  btn.setAttribute('data-btn-role', toCamelCase(type));
  btn.setAttribute('aria-expanded', false);
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', `Select ${type.match(/^[aieouAIEOU].*/) ? 'an' : 'a'} ${type}`);
  btn.innerHTML = `<span>Select ${type.match(/^[aieouAIEOU].*/) ? 'an' : 'a'} ${type}</span>
    ${buildIcon('angle-down-white').outerHTML}`;
  btn.addEventListener('click', toggleMenu);
  // build options wrapper
  const optionsWrapper = document.createElement('ul');
  optionsWrapper.classList.add('dropdown-options');
  // populate options
  options.forEach((o) => {
    const option = buildOption(o);
    optionsWrapper.append(option);
  });

  dropdown.append(btn, optionsWrapper);
  return dropdown;
}

function drawTable(el, cols, rows, specs = {}) {
  // eslint-disable-next-line no-undef
  const data = new google.visualization.DataTable();
  cols.forEach((col) => {
    data.addColumn(typeof col, col);
  });
  data.addRows(rows);

  const config = {
    allowHtml: true,
    width: '100%',
    sort: 'disable',
  };
  if (specs.frozenColumns) {
    config.frozenColumns = specs.frozenColumns;
  }
  if (specs.sort) {
    config.sort = 'enable';
  }
  if (specs.height) {
    config.height = `${specs.height}px`;
  }

  // eslint-disable-next-line no-undef
  const table = new google.visualization.Table(el);
  table.draw(data, config);
  if (specs.results) {
    const results = document.createElement('p');
    results.classList.add('detail', 'indicator-data-results');
    results.textContent = `Showing 1 - ${rows.length} of ${rows.length} results`;
    el.prepend(results);
  }
}

function filterQuestionnaires(e, economies, topics, langs) {
  e.preventDefault();
  const values = {};
  const btns = document.querySelectorAll('.dropdown-toggle > .dropdown-btn');
  btns.forEach((btn) => {
    const value = btn.getAttribute('data-value');
    if (!value) {
      btn.classList.add('unselected');
      setTimeout(() => { btn.classList.remove('unselected'); }, 1000);
    } else {
      values[btn.getAttribute('data-btn-role')] = [value];
    }
  });
  if (values.economy && values.topic) {
    if (values.economy.includes('all')) {
      values.economy = economies.map((ec) => ({
        name: ec.Name,
        code: ec.EconomyCode,
        path: sanitizePath(ec.EconomyUrlName),
      }));
    } else {
      const economy = economies.find((ec) => values.economy[0] === ec.EconomyCode);
      values.economy = [{
        name: economy.Name,
        code: economy.EconomyCode,
        path: sanitizePath(economy.EconomyUrlName),
      }];
    }
    if (values.topic.includes('all')) {
      values.topic = topics;
    } else {
      const topic = topics.find((t) => values.topic[0] === t.value);
      values.topic = [topic];
    }
    const block = document.querySelector('.questionnaire-data');
    const prevTable = block.querySelector('.questionnaire-data-table');
    if (prevTable) prevTable.remove();
    // draw table
    const table = document.createElement('div');
    table.classList.add('questionnaire-data-table');
    const columns = ['Topic', 'Economy', 'Word Questionnaire', 'Online Questionnaire'];
    const rows = [];
    const qUrl = 'https://surveyv2.doingbusiness.org/fs.aspx?surveyid=fcf1e15ed4840818d2b350c2c02e380&campid=3C67F361-3DE9-4347-8B31-6A4DD309BED1&lcode=en-us';
    // write table content
    values.economy.forEach((economy) => {
      values.topic.forEach((topic) => {
        langs.forEach((lang) => {
          const row = [
            topic.name,
            economy.name,
            `<a href="https://wbl.worldbank.org/content/dam/wbl/country/${economy.path.charAt(0)}/${economy.path}/${economy.code}_${topic.value}_${lang}.doc" target="_blank">${economy.code}_${topic.value}_${lang}.doc</a>`,
            `<a href="${qUrl}" target="_blank">Fill online questionnaire</a>`,
          ];
          rows.push(row);
        });
      });
    });
    drawTable(table, columns, rows);

    block.append(table);
  }
}

/**
 * loads and decorates the questionnaire data
 * @param {Element} block The questionnaire data block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  const langs = config.languages?.split(',').map((l) => l.trim()) || ['en']; // english default
  block.textContent = '';

  try {
    // build dropdowns
    const wrapper = document.createElement('div');
    wrapper.classList.add('dropdown-wrapper');
    // economy dropdown
    const economies = await fetchEconomies();
    const economyOptions = [{ name: 'All economies', value: 'all' }, ...economies.map((e) => ({
      name: e.Name,
      value: e.EconomyCode,
    }))];
    const economyDropdown = buildDropdown('Economy', economyOptions);
    // topic dropdown (not indicator)
    const topics = [
      { name: 'All topics', value: 'all' },
      { name: 'Family Lawyer', value: 'family_survey' },
      { name: 'Labor Lawyer', value: 'labor_survey' },
      { name: 'Violence Against Women', value: 'vaw_survey' },
    ];
    const topicDropdown = buildDropdown('Topic', topics);
    wrapper.append(economyDropdown, topicDropdown);
    // search btn
    const btn = document.createElement('button');
    btn.classList.add('btn', 'questionnaire-btn');
    btn.textContent = 'Search';
    btn.addEventListener('click', (e) => {
      filterQuestionnaires(e, economies, topics.slice(1), langs);
    });

    block.append(wrapper, btn);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Could not display questionnaire data', error);
    block.insertAdjacentHTML('beforeend', '<p><strong>Questionnaire data could not be displayed</strong></p>');
  }
}
