/* eslint-disable no-undef */
import {
  buildIcon,
  fetchAPI,
  fetchEconomies,
  fetchIndicators,
  readBlockConfig,
} from '../../scripts/scripts.js';

import {
  closeAllMenus,
  toggleMenu,
} from '../dropdown-links/dropdown-links.js';

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

function drawTable(el, cols, rows, specs = {}) {
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

  const table = new google.visualization.Table(el);
  table.draw(data, config);
  if (specs.results) {
    const results = document.createElement('p');
    results.classList.add('detail', 'indicator-data-results');
    results.textContent = `Showing 1 - ${rows.length} of ${rows.length} results`;
    el.prepend(results);
  }
}

async function updateTable(indicatorCode, economyCode) {
  const [data] = await fetchAPI(`/economy/${economyCode}/indicator/${indicatorCode}/year/current/indicatordatapointvalues/multilevel`);
  const content = writeTableContent(data);
  const table = document.querySelector('.indicator-data-table');
  drawTable(table, content.columns, content.rows, { sort: false });
  closeAllMenus();
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
  block.textContent = '';
  block.classList.add('data-loading');
  const indicators = await fetchIndicators();

  if (config.indicator) {
    // fetch table data
    const { IndicatorCode } = indicators.find((i) => config.indicator === i.IndicatorPublishedName);
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
    block.append(table);
    block.classList.remove('data-loading');
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
    const { EconomyCode: economyCode } = economies.find((e) => config.economy === e.Name);
    const dropdown = buildDropdownToggle(options, economyCode);
    block.append(dropdown);
    // build table
    const [data] = await fetchAPI(`/economy/${economyCode}/indicator/${options[0].code}/year/current/indicatordatapointvalues/multilevel`);
    const content = writeTableContent(data);
    const table = document.createElement('div');
    table.classList.add('indicator-data-table');
    drawTable(table, content.columns, content.rows, { sort: false });
    block.append(table);
    block.classList.remove('data-loading');
  }
}
