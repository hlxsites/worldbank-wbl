/* eslint-disable no-undef */
import {
  fetchAPI,
  fetchEconomies,
  readBlockConfig,
} from '../../scripts/scripts.js';

function writeTableContent(data, region = '') {
  const columns = [
    { title: 'Economy' },
    { title: 'Region' },
    { title: 'Indicator' },
    { title: 'Report Year', type: 'number' },
    { title: 'Type of Reform', type: 'boolean' },
    { title: 'Reform Description' },
  ];
  const rows = [];
  data.forEach((d) => {
    const summary = d.ReformSummary;
    const year = summary.split(')')[0].replace(/\D/g, '');
    const row = [
      d.EconomyName, // economy
      region, // region
      d.IndicatorName, // indicator
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
    // height: '480px',
    width: '100%',
    frozenColumns: 2,
    // sort: 'disable',
  };

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
  block.textContent = '';
  block.classList.add('data-loading');

  const economies = await fetchEconomies();
  if (config.economy) {
    const economy = economies.find((ec) => config.economy === ec.Name);
    const data = await fetchAPI(`/year/2020/reform?$orderby=ReformSummary%20desc&economyCode=${economy.EconomyCode}`);
    const content = writeTableContent(data, economy.RegionName);
    const table = document.createElement('div');
    table.classList.add('reform-data-table');
    drawTable(table, content.columns, content.rows);
    block.classList.remove('data-loading');
    block.append(table);
  }
}
