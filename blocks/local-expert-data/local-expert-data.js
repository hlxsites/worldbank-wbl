/* eslint-disable no-undef */
import {
  buildLoadingScreen,
  removeLoadingScreen,
  fetchAPI,
  fetchEconomies,
  readBlockConfig,
} from '../../scripts/scripts.js';

function buildUrl(url) {
  if (!url.startsWith('http')) {
    // eslint-disable-next-line no-param-reassign
    url = `https://${url}`;
  }
  return new URL(url).href;
}

function buildList(data) {
  const list = document.createElement('div');
  list.classList.add('block', 'list');
  data.forEach((d) => {
    const row = document.createElement('div');
    row.classList.add('list-row');
    row.innerHTML = `${d.DisplayName ? `<h3>${d.DisplayName}</h3>` : ''}
      ${d.OrganizationName ? `<p><strong>${d.OrganizationName}</strong></p>` : ''}
      ${d.OrganizationWebsite ? `<p><a href="${buildUrl(d.OrganizationWebsite)}" target="_blank">${d.OrganizationWebsite}</a></p>` : ''}
      ${d.Email ? `<p><a href="mailto:${d.Email}">${d.Email}</a></p>` : ''}
      ${d.StreetAddress ? `<p>${d.StreetAddress}</p>` : ''}
      ${d.PhoneNumber ? `<p><span class="detail">Tel:</span> ${d.PhoneNumber}</p>` : ''}
      ${d.FaxNumber ? `<p><span class="detail">Fax:</span> ${d.FaxNumber}</p>` : ''}`;
    list.append(row);
  });
  return list;
}

/**
 * loads and decorates the indicator data
 * @param {Element} block The indicator data block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  if (!config.economy || config.economy.toLowerCase() === 'from url') {
    // eslint-disable-next-line prefer-destructuring
    config.economy = window.location.pathname.split('/')[2];
  }
  block.textContent = '';
  buildLoadingScreen();

  const economies = await fetchEconomies();
  const thisEconomy = economies.find((e) => config.economy === e.EconomyUrlName
    .normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
  try {
    const data = await fetchAPI(`/economy/${thisEconomy.EconomyCode}/contributors?$orderby=LastName`);
    const list = buildList(data);

    block.append(list);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('Could not display local expert data', error);
    block.insertAdjacentHTML('beforeend', '<p><strong>Local expert data could not be displayed</strong></p>');
  }
  removeLoadingScreen();
}
