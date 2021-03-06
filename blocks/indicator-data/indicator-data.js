import {
  buildIcon,
  buildLoadingScreen,
  removeLoadingScreen,
  fetchAPI,
  fetchEconomies,
  fetchIndicators,
  readBlockConfig,
  closeAllMenus,
  toggleMenu,
} from '../../scripts/scripts.js';

function writeTableContent(data) {
  const columns = ['Questions', 'Answer', 'Score', 'Law'];
  const rows = [];
  data.IndicatorDataPointList.forEach((d) => {
    const answer = d.IndicatorDataPointValues.find((v) => v.IndicatorDataPointValueTypeName === 'Answer');
    const score = d.IndicatorDataPointValues.find((v) => v.IndicatorDataPointValueTypeName === 'Score');
    const law = d.IndicatorDataPointValues.find((v) => v.IndicatorDataPointValueTypeName === 'Law 1');
    const row = [
      d.IndicatorDataPointName,
      answer?.Value || '',
      score?.Value || '',
      law?.Value || '',
    ];
    rows.push(row);
  });
  return { columns, rows };
}

function resetResults() {
  const results = document.querySelector('span.displayed');
  if (results) results.textContent = document.querySelectorAll('tbody tr').length;
  const filter = document.querySelector('.indicator-data-filter');
  if (filter) filter.value = '';
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
  if (specs.sort) {
    // eslint-disable-next-line no-undef
    google.visualization.events.addListener(table, 'sort', resetResults);
  }
  if (specs.results) {
    const results = document.createElement('p');
    results.classList.add('detail', 'indicator-data-results');
    results.innerHTML = `Showing 1 - <span class="displayed">${rows.length}</span> of ${rows.length} results`;
    el.prepend(results);
  }
}

async function updateTable(indicatorCode, economyCode) {
  buildLoadingScreen();
  const [data] = await fetchAPI(`/economy/${economyCode}/indicator/${indicatorCode}/year/current/indicatordatapointvalues/multilevel`);
  const content = writeTableContent(data);
  const table = document.querySelector('.indicator-data-table');
  drawTable(table, content.columns, content.rows, { sort: false });
  closeAllMenus();
  removeLoadingScreen();
}

function filterTable(e) {
  const { value } = e.target;
  const table = document.querySelector('tbody');
  table.querySelectorAll('tr').forEach((row) => {
    if (!value.length || row.textContent.toLowerCase().includes(value)) {
      row.classList.remove('hide');
    } else {
      row.classList.add('hide');
    }
  });
  const results = document.querySelector('span.displayed');
  results.textContent = table.querySelectorAll('tr:not(.hide)').length;
}

function updateDropdown(indicator) {
  const btn = document.getElementById('dropdown-btn-toggle').querySelector('span');
  btn.textContent = indicator;
}

async function updateIndicatorBlock(e) {
  const indicator = e.target.textContent;
  const indicatorCode = e.target.getAttribute('data-code');
  const economyCode = e.target.closest('[data-economy-code]').getAttribute('data-economy-code');
  updateDropdown(indicator);
  await updateTable(indicatorCode, economyCode);
}

function buildOption(option) {
  const o = document.createElement('a');
  o.textContent = option.name;
  o.setAttribute('data-code', option.code);
  o.addEventListener('click', updateIndicatorBlock);
  const li = document.createElement('li');
  li.classList.add('dropdown-option');
  li.append(o);
  return li;
}

function buildDropdownToggle(values, code) {
  const wrapper = document.createElement('div');
  wrapper.classList.add('block', 'dropdown-toggle');
  wrapper.setAttribute('data-economy-code', code);
  const btn = document.createElement('a');
  btn.classList.add('dropdown-btn');
  btn.id = 'dropdown-btn-toggle';
  btn.setAttribute('aria-expanded', false);
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', 'Select an Indicator');
  btn.innerHTML = `<span>${values[0].name}</span>
    ${buildIcon('angle-down-white').outerHTML}`;
  btn.addEventListener('click', toggleMenu);
  const options = document.createElement('ul');
  options.classList.add('dropdown-options');
  values.forEach((v) => {
    const option = buildOption(v);
    options.append(option);
  });
  wrapper.append(btn, options);
  return wrapper;
}

/**
 * loads and decorates the indicator data
 * @param {Element} block The indicator data block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  if (config.economy?.toLowerCase() === 'from url') {
    // eslint-disable-next-line prefer-destructuring
    config.economy = window.location.pathname.split('/')[3];
  }
  if (config.year?.toLowerCase() === 'from url') {
    // eslint-disable-next-line prefer-destructuring
    config.year = window.location.pathname.split('/')[4];
  }
  block.textContent = '';
  buildLoadingScreen();

  const indicators = await fetchIndicators();
  try {
    if (config.indicator) {
      // build filter
      const filter = document.createElement('input');
      filter.classList.add('indicator-data-filter');
      filter.setAttribute('placeholder', 'Filter by economy, region, or data point values...');
      filter.addEventListener('keyup', filterTable);
      // fetch table data
      const { IndicatorCode } = indicators
        .find((i) => config.indicator === i.IndicatorPublishedName);
      const code = IndicatorCode.toLowerCase();
      const [{ IndicatorDataPoints: questions }] = await fetchAPI(`/indicator/${code}/year/${config.year}/indicatordatapoints`);
      const columns = ['Economy', 'Region', ...questions.map((q) => q.IndicatorDataPointName)];
      const answersByEconomy = await fetchAPI(`/indicator/${code}/year/${config.year}/indicatoreconomydatapointvalues/multilevel`);
      const rows = [];
      answersByEconomy.forEach((economy) => {
        const row = [
          `<a href="/data/exploreeconomies/${economy.EconomyUrlName}/${config.year}">${economy.EconomyName}</a>`,
          economy.RegionCode,
          ...economy.DataPointValues.map((v) => v.Value || ''),
        ];
        rows.push(row);
      });
      // draw table
      const table = document.createElement('div');
      table.classList.add('indicator-data-table');
      drawTable(table, columns, rows, {
        frozenColumns: 2,
        height: 480,
        results: true,
        sort: true,
      });

      block.append(filter, table);
    } else if (config.economy) {
      // add title
      const title = document.createElement('h2');
      title.textContent = 'Indicator Data';
      block.append(title);
      // build dropdown
      const options = [];
      indicators.forEach((i) => {
        if (i.IndicatorCode !== 'WBL_ALL') {
          options.push({
            name: i.IndicatorPublishedName,
            code: i.IndicatorCode.toLowerCase(),
          });
        }
      });
      const economies = await fetchEconomies();
      const thisEconomy = economies.find((e) => config.economy === e.EconomyUrlName
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      const { EconomyCode: economyCode } = thisEconomy;
      const dropdown = buildDropdownToggle(options, economyCode);
      // build table
      const [data] = await fetchAPI(`/economy/${economyCode}/indicator/${options[0].code}/year/current/indicatordatapointvalues/multilevel`);
      const content = writeTableContent(data);
      const table = document.createElement('div');
      table.classList.add('indicator-data-table');
      drawTable(table, content.columns, content.rows, { sort: false });

      block.append(dropdown, table);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Could not display indicator data', error);
    block.insertAdjacentHTML('beforeend', '<p><strong>Indicator data could not be displayed</strong></p>');
  }
  removeLoadingScreen();
}
