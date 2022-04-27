import {
  createOptimizedPicture,
  lookupPages,
} from '../../scripts/scripts.js';

function buildCard(data) {
  const card = document.createElement('div');
  card.classList.add('card');
  card.innerHTML = `${data.image ? `<a class="card-img-wrapper" href="${data.path}">${createOptimizedPicture(data.image).outerHTML}</a>` : ''}
  <div class="card-body">
    ${data.title ? `<h3><a href="${data.path}">${data.title}</a></h3>` : ''}
    ${data.description ? `<p>${data.description}</p>` : ''}
    <p><a href="${data.path}">Read More</a></p>
  </div>`;
  return card;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const paths = [...block.querySelectorAll('a[href]')].map((a) => {
    const { pathname } = new URL(a.href);
    return pathname;
  });
  const pages = await lookupPages(paths);
  if (pages.length) {
    block.innerHTML = '';
    pages.forEach((page) => {
      if (page.path) {
        const card = buildCard(page);
        block.append(card);
      }
    });
  } else {
    block.remove();
  }
}
