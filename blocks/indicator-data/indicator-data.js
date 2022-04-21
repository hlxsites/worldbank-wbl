/* eslint-disable no-undef */
import {
  fetchAPI,
  fetchIndicators,
  // loadCharts,
  readBlockConfig,
} from '../../scripts/scripts.js';

function drawTable(el, cols, rows) {
  el.classList.remove('data-loading');
  const data = new google.visualization.DataTable();
  cols.forEach((col) => {
    data.addColumn(typeof col, col);
  });
  data.addRows(rows);

  const table = new google.visualization.Table(el);
  table.draw(data, {
    allowHtml: true,
    frozenColumns: 2,
    width: '100%',
    height: '480px',
  });

  const results = document.createElement('p');
  results.classList.add('detail', 'indicator-data-results');
  results.textContent = `Showing 1 - ${rows.length} of ${rows.length} results`;
  el.prepend(results);
}

/**
 * loads and decorates the indicator data
 * @param {Element} block The indicator data block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';
  block.classList.add('data-loading');

  // fetch table data
  const indicators = await fetchIndicators();
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
      ...economy.DataPointValues.map((v) => v.Value),
    ];
    rows.push(row);
  });

  // draw table
  drawTable(block, columns, rows);
}
