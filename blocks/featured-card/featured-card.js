function decorateCard(el) {
  const card = document.createElement('div');
  card.classList.add('card');
  const img = el.querySelector('picture');
  img.classList.add('card-img');
  const a = el.querySelector('h2 a, h3 a');
  if (a) {
    const imgWrap = a.cloneNode(true);
    imgWrap.innerHTML = '';
    imgWrap.classList.add('card-img-wrapper');
    imgWrap.append(img);
    card.append(imgWrap);
  } else {
    card.append(img);
  }
  const empty = el.querySelectorAll(':empty');
  empty.forEach((e) => e.remove());
  const body = document.createElement('div');
  body.classList.add('card-body');
  [...el.children].forEach((child) => {
    if (!child.querySelector('picture')) { body.append(child); }
  });
  const prevDetail = body.querySelector('p:first-child + h2, p:first-child + h3');
  const postDetail = body.querySelector('h2 + p em, h3 + p em');
  if (prevDetail) {
    const p = body.querySelector('p:first-child');
    const em = p.querySelector('em');
    if (p.textContent === em.textContent) {
      p.classList.add('detail', 'card-detail');
    }
  }
  if (postDetail) {
    const p = body.querySelector('h2 + p, h3 + p');
    const em = p.querySelector('em');
    if (p.textContent === em.textContent) {
      p.classList.add('detail', 'card-detail');
    }
  }
  card.append(body);
  return card;
}

/**
 * loads and decorates the featured card
 * @param {Element} block The featured card block element
 */
export default async function decorate(block) {
  const card = decorateCard(block.firstChild.firstChild);
  block.innerHTML = '';
  block.append(card);
}
