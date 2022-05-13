import {
  buildIcon,
  buildLoadingScreen,
  removeLoadingScreen,
  fetchAPI,
  fetchEconomies,
  fetchIndicators,
  loadScript,
  readBlockConfig,
} from '../../scripts/scripts.js';

function buildTable(data) {
  const table = document.createElement('table');
  const tbody = document.createElement('tbody');
  data.forEach((d) => {
    const tr = document.createElement('tr');
    d.forEach((col) => {
      const td = document.createElement('td');
      td.textContent = col;
      tr.append(td);
    });
    tbody.append(tr);
  });
  table.append(tbody);
  return table;
}

function buildTd(data, type) {
  const td = document.createElement(type);
  td.textContent = data;
  return td;
}

function buildTr(data, type = 'td') {
  const tr = document.createElement('tr');
  data.forEach((d) => {
    const td = buildTd(d, type);
    tr.append(td);
  });
  return tr;
}

async function downloadExcel(e) {
  const target = e.target.closest('a');
  target.style.cursor = 'wait';
  const msg = document.createElement('span');
  msg.textContent = 'Downloading...';
  msg.classList.add('economy-data-overview-btn-downloading');
  target.append(msg);
  const code = target.getAttribute('data-economy');
  const year = target.getAttribute('data-year');

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headTr = buildTr(['Topic', 'Group', 'Year', 'Question', 'Answer', 'Score', 'Law'], 'th');
  thead.append(headTr);
  table.append(thead);
  const tbody = document.createElement('tbody');
  table.append(tbody);

  const indicators = await fetchIndicators();
  // eslint-disable-next-line no-restricted-syntax
  for (const i of indicators) {
    const indicatorCode = i.IndicatorCode.toLowerCase();
    if (indicatorCode !== 'wbl_all') {
      // eslint-disable-next-line no-await-in-loop
      const [data] = await fetchAPI(`/economy/${code}/indicator/${indicatorCode}/year/current/indicatordatapointvalues/multilevel`);
      data.IndicatorDataPointList.forEach((d) => {
        const answer = d.IndicatorDataPointValues.find((v) => v.IndicatorDataPointValueTypeName === 'Answer');
        const score = d.IndicatorDataPointValues.find((v) => v.IndicatorDataPointValueTypeName === 'Score');
        const law = d.IndicatorDataPointValues.find((v) => v.IndicatorDataPointValueTypeName === 'Law 1');
        const row = buildTr([
          i.IndicatorPublishedName, // topic
          data.IndicatorDataPointName, // group
          year, // year
          d.IndicatorDataPointName, // question
          answer?.Value || '', // answer
          score?.Value || '', // score
          law?.Value || '', // law
        ]);
        tbody.append(row);
      });
    }
  }

  // eslint-disable-next-line no-undef
  const workbook = XLSX.utils.table_to_book(table);
  // eslint-disable-next-line no-undef
  XLSX.writeFile(workbook, `${code} Snapshot.xlsx`);
  target.style.cursor = 'default';
  msg.textContent = 'Downloaded!';
}

function buildDownloadBtn(type, economy, year = new Date().getFullYear()) {
  const btn = document.createElement('a');
  btn.classList.add('btn', 'economy-data-overview-btn');
  btn.id = `${type}Btn`;
  const icon = buildIcon('download-gold');
  if (type === 'snapshot') {
    btn.innerHTML = `<span>Download Snapshot ${icon.outerHTML}</span>`;
    const nameSegments = economy.NormalizedName.replace(/\./g, '').split(' ').map((w, i) => (i !== 0 ? w.toLowerCase() : w));
    btn.href = `https://wbl.worldbank.org/content/dam/documents/wbl/${year}/snapshots/${nameSegments.join('-')}.pdf`;
    btn.setAttribute('target', '_blank');
  } else {
    btn.innerHTML = `<span>Download Excel ${icon.outerHTML}</span>`;
    btn.setAttribute('data-economy', economy.EconomyCode);
    btn.setAttribute('data-year', new Date().getFullYear());
    btn.addEventListener('click', (e) => {
      loadScript(
        'https://cdn.sheetjs.com/xlsx-0.18.6/package/dist/xlsx.full.min.js',
        downloadExcel(e),
      );
    });
  }
  return btn;
}

function drawPieChart(el, value) {
  // eslint-disable-next-line no-undef
  const data = google.visualization.arrayToDataTable([
    ['Index', 'Value'],
    ['WBL Index', value],
    ['', (100 - value)],
  ]);

  const options = {
    legend: 'none',
    enableInteractivity: false,
    height: 125,
    width: 125,
    backgroundColor: {
      fill: 'transparent',
      stroke: 'transparent',
    },
    chartArea: {
      width: '100%',
      height: '100%',
    },
    pieHole: 0.66,
    pieSliceBorderColor: 'transparent',
    pieSliceText: 'none',
    slices: [{ color: '#FDB714' }, { color: '#FDECCB' }],
    tooltip: { trigger: 'none' },
  };

  // eslint-disable-next-line no-undef
  const chart = new google.visualization.PieChart(el);
  chart.draw(data, options);
  // chart title
  const title = document.createElement('h3');
  title.classList.add('economy-data-overview-index-title');
  title.textContent = 'WBL Index';
  el.prepend(title);
  // chart caption
  const caption = document.createElement('figcaption');
  caption.classList.add('economy-data-overview-index-caption');
  caption.textContent = value;
  el.querySelector('div').append(caption);
}

function drawColumnChart(el, values) {
  const title = document.createElement('h2');
  title.textContent = 'Economy Scores Snapshot';
  const subtitle = document.createElement('h3');
  subtitle.textContent = 'WBL Indicator Scores';
  el.prepend(title, subtitle);

  const chart = document.createElement('div');
  chart.classList.add('economy-data-snapshot-chart');
  values.forEach((v) => {
    // column
    const col = document.createElement('div');
    col.classList.add('economy-data-snapshot-chart-col');
    col.setAttribute('title', v.indicator);
    // bar and score
    const bar = document.createElement('div');
    bar.classList.add('economy-data-snapshot-chart-bar');
    const barCol = document.createElement('div');
    barCol.style.height = `${(v.score * 368) / 100}px`;
    const score = document.createElement('p');
    score.classList.add('economy-data-snapshot-chart-score');
    score.textContent = v.score;
    barCol.append(score);
    bar.append(barCol);
    // label
    const label = document.createElement('div');
    label.classList.add('economy-data-snapshot-chart-label');
    const icon = buildIcon(v.code);
    icon.setAttribute('title', v.indicator);
    label.innerHTML = `${icon.outerHTML}<p>${v.indicator}</p>`;
    col.append(bar, label);
    chart.append(col);
  });
  el.append(chart);
}

/**
 * loads and decorates the indicator data
 * @param {Element} block The indicator data block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  if (!config.economy || config.economy.toLowerCase() === 'from url') {
    // eslint-disable-next-line prefer-destructuring
    config.economy = window.location.pathname.split('/')[3];
  }
  if (!config.year || config.year.toLowerCase() === 'from url') {
    // eslint-disable-next-line prefer-destructuring
    config.year = window.location.pathname.split('/')[4];
  }
  block.textContent = '';
  buildLoadingScreen();

  const economies = await fetchEconomies();
  const thisEconomy = economies.find((e) => config.economy === e.EconomyUrlName
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  console.log('ECONOMY economy:', thisEconomy);
  thisEconomy.NormalizedName = thisEconomy.Name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  document.querySelector('h1').textContent = thisEconomy.Name;
  let indexes = {};
  // OVERVIEW SECTION
  const overview = document.createElement('section');
  overview.classList.add('economy-data-overview');
  block.append(overview);
  try {
    // table
    const { EconomyCode: code } = thisEconomy;
    const { Economy: economy } = await fetchAPI(`/economy/${code}/year/current/details`);
    const economyDetails = economy.EconomyDetails.map((d) => [d.EconomyDetailTypeName, d.Value]);
    const table = buildTable(economyDetails);
    table.classList.add('economy-data-overview-table');

    overview.append(table);
    // download btns
    const btnWrapper = document.createElement('div');
    btnWrapper.classList.add('economy-data-overview-btn-wrapper');
    const snapshotBtn = buildDownloadBtn('snapshot', thisEconomy, config.year);
    const downloadBtn = buildDownloadBtn('download', thisEconomy);
    btnWrapper.append(snapshotBtn, downloadBtn);

    overview.append(btnWrapper);
    // pie chart
    const pie = document.createElement('figure');
    pie.classList.add('economy-data-overview-index-chart');
    const [{ EconomyIndexes }] = await fetchAPI(`/economies/indicator/all/year/current/indexes?$filter=EconomyCode eq '${code}'`);
    indexes = EconomyIndexes;
    const wbl = indexes.find((i) => i.IndicatorCode === 'WBL_ALL');
    indexes.splice(indexes.indexOf(wbl), 1); // remove wbl index for future data charts
    drawPieChart(pie, parseFloat(wbl.Value, 10));

    overview.append(pie);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Could not display economy data', error);
    overview.insertAdjacentHTML('beforeend', '<p><strong>Economy data could not be displayed</strong></p>');
  }

  // SNAPSHOT SECTION
  const snapshot = document.createElement('section');
  snapshot.classList.add('economy-data-snapshot');
  block.append(snapshot);
  try {
    // column chart
    const indicators = await fetchIndicators();
    const scores = [];
    indexes.forEach((x) => {
      const indicator = indicators.find((i) => i.IndicatorCode === x.IndicatorCode);
      scores.push({
        code: x.IndicatorCode.toLowerCase(),
        indicator: indicator.IndicatorPublishedName,
        score: parseInt(x.Value, 10),
      });
    });
    const chart = document.createElement('figure');
    chart.classList.add('economy-data-snapshot-figure');
    drawColumnChart(chart, scores);

    snapshot.append(chart);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Could not display economy snapshot data', error);
    snapshot.insertAdjacentHTML('beforeend', '<p><strong>Economy snapshot could not be displayed</strong></p>');
  }
  removeLoadingScreen();
}
