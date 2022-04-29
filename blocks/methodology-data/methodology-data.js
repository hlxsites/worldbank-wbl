import {
  buildIcon,
  fetchIndicators,
  toggleMenu,
  closeAllMenus,
  buildLoadingScreen,
  removeLoadingScreen,
} from '../../scripts/scripts.js';

async function fetchMethdologyData() {
  if (!window.methodologyData) {
    try {
      const resp = await fetch('/methodology-data.json');
      const json = await resp.json();
      const data = {};
      json.data.forEach((j) => {
        if (!data[j.indicator]) {
          data[j.indicator] = {};
        }
        const type = `${j.type.toLowerCase()}s`;
        if (type === 'questions') {
          if (data[j.indicator][type]) { // prop exists
            data[j.indicator][type].push({
              q: j.question, a: j.info,
            });
          } else { // prop does not exist
            data[j.indicator][type] = [
              { q: j.question, a: j.info },
            ];
          }
        } else if (type === 'assumptions') {
          if (data[j.indicator][type]) { // prop exists
            data[j.indicator][type].push(j.info);
          } else { // prop does not exist
            data[j.indicator][type] = [j.info];
          }
        }
      });
      window.methodologyData = data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Could not fetch methodology data', err);
    }
  }
  return window.methodologyData;
}

function formatRows(questions) {
  const rows = [...questions.map((q) => {
    const criteria = q.a.split('\n').map((c) => `<li>${c}</li>`).join('');
    return [q.q, `<ul>${criteria}</ul>`];
  })];
  return rows;
}

function drawTable(el, cols, rows) {
  el.innerHTML = '';
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

  // eslint-disable-next-line no-undef
  const table = new google.visualization.Table(el);
  table.draw(data, config);
}

function updateAssumptions(assumptions) {
  const ul = document.querySelector('.methodology-data-assumptions');
  assumptions.forEach((a) => {
    const li = document.createElement('li');
    li.setAttribute('data-methodology', true);
    li.textContent = a;
    ul.append(li);
  });
}

async function updateMethodology(e) {
  closeAllMenus();
  const target = e.target?.textContent;
  const btn = document.getElementById('dropdown-btn-methodology');
  const methodology = await fetchMethdologyData();
  const method = methodology[target];
  btn.querySelector('span').textContent = target;
  const extraAssumptions = document.querySelectorAll('li[data-methodology]');
  if (extraAssumptions) extraAssumptions.forEach((ea) => ea.remove());
  if (method.assumptions) {
    updateAssumptions(method.assumptions);
  }
  const table = document.querySelector('.methodology-data-table');
  const columns = ['Question', 'Scoring Information'];
  const rows = formatRows(method.questions);
  drawTable(table, columns, rows);
}

function buildOption(option) {
  const o = document.createElement('a');
  o.textContent = option.IndicatorPublishedName;
  o.setAttribute('data-value', option.IndicatorCode);
  o.addEventListener('click', updateMethodology);
  const li = document.createElement('li');
  li.classList.add('dropdown-option');
  li.append(o);
  return li;
}

function buildDropdown(options) {
  // build wrapper
  const dropdown = document.createElement('div');
  dropdown.classList.add('dropdown-toggle', 'block');
  // build button
  const btn = document.createElement('a');
  btn.classList.add('dropdown-btn');
  btn.id = 'dropdown-btn-methodology';
  btn.setAttribute('aria-expanded', false);
  btn.setAttribute('role', 'button');
  btn.setAttribute('aria-label', 'Select an Indicator');
  btn.innerHTML = `<span>${options[0].IndicatorPublishedName}</span>
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

/**
 * loads and decorates the methodology data
 * @param {Element} block The methodology data block element
 */
export default async function decorate(block) {
  const ul = block.querySelector('ul');
  ul.classList.add('methodology-data-assumptions');
  buildLoadingScreen();

  try {
    // build dropdown
    const title = document.createElement('h2');
    title.textContent = 'Select an Indicator';
    const wrapper = document.createElement('div');
    wrapper.classList.add('dropdown-wrapper');
    let indicators = await fetchIndicators();
    indicators = indicators.filter((i) => i.IndicatorCode !== 'WBL_ALL');
    const defaultIndicator = indicators[0];
    const indicatorDropdown = buildDropdown(indicators);
    wrapper.append(title, indicatorDropdown);
    // update assumptions
    const methodology = await fetchMethdologyData();
    const defaultIndicatorMethod = methodology[defaultIndicator.IndicatorPublishedName];
    if (defaultIndicatorMethod.assumptions) {
      updateAssumptions(defaultIndicatorMethod.assumptions);
    }
    // display methodology data
    const table = document.createElement('div');
    table.classList.add('methodology-data-table');
    const columns = ['Question', 'Scoring Information'];
    const rows = formatRows(defaultIndicatorMethod.questions);
    drawTable(table, columns, rows);

    block.prepend(wrapper);
    block.append(table);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Could not display methodology data', error);
    block.insertAdjacentHTML('beforeend', '<p><strong>Methodology data could not be displayed</strong></p>');
  }
  removeLoadingScreen();
}
