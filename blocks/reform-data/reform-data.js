/* eslint-disable no-undef */
import {
  buildLoadingScreen,
  removeLoadingScreen,
  fetchAPI,
  fetchEconomies,
  fetchIndicators,
  readBlockConfig,
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

function writeTableContent(data, economies, indicators) {
  const columns = [
    { title: 'Economy' },
    { title: 'Region' },
    { title: 'Indicator' },
    { title: 'Report Year', type: 'number' },
    { title: 'Type of Reform', type: 'boolean' },
    { title: 'Reform Description' },
  ];
  const economyCodes = {};
  const indicatorCodes = {};
  const rows = [];
  data.forEach((d) => {
    const summary = d.ReformSummary;
    const year = summary.split(')')[0].replace(/\D/g, '');
    const economy = economyCodes[d.EconomyName] ? economyCodes[d.EconomyName]
      : economies.find((ec) => d.EconomyName === ec.Name);
    if (!economyCodes[d.EconomyName]) { // add to list for faster lookup
      economyCodes[d.EconomyName] = { RegionName: economy.RegionName };
    }
    const indicator = indicatorCodes[d.IndicatorName] ? indicatorCodes[d.IndicatorName]
      : indicators.find((i) => i.IndicatorPublishedName === d.IndicatorName);
    if (!indicatorCodes[d.IndicatorName]) { // add to list  for faster lookup
      indicatorCodes[d.IndicatorName] = { IndicatorCode: indicator.IndicatorCode };
    }
    const economyPath = sanitizePath(`/reforms/economy/${d.EconomyName}`);
    const indicatorPath = sanitizePath(`/reforms/topic/${indicator.IndicatorCode}`);
    const row = [
      `<a href="${economyPath}">${d.EconomyName}</a>`, // economy
      economy.RegionName, // region
      `<a href="${indicatorPath}">${d.IndicatorName}</a>`, // indicator
      { f: year, v: parseInt(year, 10) }, // report year
      d.ReformFlag >= 1, // type of reform
      summary.split(' ').slice(1).join(' '), // reform description
    ];
    rows.push(row);
  });
  return { columns, rows };
}

function drawTable(el, cols, rows, specs = {}) {
  const data = new google.visualization.DataTable();
  cols.forEach((col) => {
    data.addColumn(col.type || 'string', col.title);
  });
  data.addRows(rows);

  const config = {
    allowHtml: true,
    height: '480px',
    width: '100%',
    frozenColumns: 2,
  };

  if (specs.page) {
    config.page = 'enable';
  }
  if (specs.pageSize) {
    config.pageSize = specs.pageSize;
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

/**
 * loads and decorates the reform data
 * @param {Element} block The reform data block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  if (!config.economy && window.location.pathname.includes('/reforms/economy/')) {
    // eslint-disable-next-line prefer-destructuring
    config.economy = window.location.pathname.split('/')[3];
  }
  if (!config.indicator && window.location.pathname.includes('/reforms/topic/')) {
    // eslint-disable-next-line prefer-destructuring
    config.indicator = window.location.pathname.split('/')[3].replace('-', '_').toUpperCase();
  }
  block.textContent = '';
  buildLoadingScreen();

  const economies = await fetchEconomies();
  const indicators = await fetchIndicators();
  try {
    if (config.economy) {
      const economy = economies.find((e) => config.economy === e.EconomyUrlName
        .normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
      const data = await fetchAPI(`/year/2020/reform?$orderby=ReformSummary%20desc&economyCode=${economy.EconomyCode}`);
      const content = writeTableContent(data, economies, indicators);
      const table = document.createElement('div');
      table.classList.add('reform-data-table');
      drawTable(table, content.columns, content.rows);

      block.append(table);
    } else if (config.indicator) {
      const indicator = indicators.find((i) => i.IndicatorCode === config.indicator);
      const data = await fetchAPI(`/year/2020/reform?$orderby=ReformSummary%20desc&indicatorCode=${indicator.IndicatorCode}`);
      const content = writeTableContent(data, economies, indicators);
      const table = document.createElement('div');
      table.classList.add('reform-data-table');
      drawTable(table, content.columns, content.rows);

      block.append(table);
    } else { // no config
      const data = await fetchAPI('/year/2020/reform?$orderby=EconomyName');
      const content = writeTableContent(data, economies, indicators);
      const table = document.createElement('div');
      table.classList.add('reform-data-table');
      drawTable(table, content.columns, content.rows, {
        page: true,
        pageSize: 15,
      });

      block.append(table);
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Could not display reform data', error);
    block.insertAdjacentHTML('beforeend', '<p><strong>Reform data could not be displayed</strong></p>');
  }
  removeLoadingScreen();
}
