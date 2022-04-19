function buildCard(el) {
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
  const body = document.createElement('div');
  body.classList.add('card-body');
  [...el.children].forEach((child) => {
    if (!child.querySelector('picture')) { body.append(child); }
  });
  card.append(body);
  return card;
}

/**
 * loads and decorates the featured card
 * @param {Element} block The featured card block element
 */
export default async function decorate(block) {
  const card = buildCard(block.firstChild.firstChild);
  block.innerHTML = '';
  block.append(card);
}
