import {
  buildIcon,
} from '../../scripts/scripts.js';

function scrollToStart(block) {
  if (block.scrollLeft !== 0) {
    block.scrollLeft = 0;
    const leftNav = block.querySelector('.carousel-nav-left');
    leftNav.classList.add('carousel-nav-disabled');
    const rightNav = block.querySelector('.carousel-nav-right');
    rightNav.classList.remove('carousel-nav-disabled');
  }
}

function checkScrollPosition(el) {
  if (el.scrollLeft === 0) return 'start';
  if (el.scrollWidth - el.scrollLeft === el.offsetWidth) return 'end';
  return null;
}

function buildNav(dir) {
  const btn = document.createElement('aside');
  btn.classList.add('carousel-nav', `carousel-nav-${dir}`);
  if (dir === 'left') btn.classList.add('carousel-nav-disabled'); // start at beginning, can't scroll left
  const arrow = buildIcon(`angle-${dir}-blue`);
  btn.append(arrow);
  btn.addEventListener('click', (e) => {
    const target = e.target.closest('.carousel-nav');
    if (![...target.classList].includes('carousel-nav-disabled')) {
      const carousel = e.target.closest('.carousel');
      carousel.querySelectorAll('.carousel-nav').forEach((nav) => nav.classList.remove('carousel-nav-disabled'));
      if (dir === 'left') {
        carousel.scrollLeft -= carousel.offsetWidth;
      } else {
        carousel.scrollLeft += carousel.offsetWidth;
      }
      setTimeout(() => {
        const position = checkScrollPosition(carousel);
        if ((position === 'start' && dir === 'left')
          || (position === 'end' && dir === 'right')) {
          btn.classList.add('carousel-nav-disabled');
        } else {
          btn.classList.remove('carousel-nav-disabled');
        }
      }, 750);
    }
  });
  return btn;
}

/**
 * loads and decorates the carousel block
 * @param {Element} block The carousel block element
 */
export default async function decorate(block) {
  const slides = [...block.children];
  slides.forEach((slide) => {
    slide.classList.add('carousel-slide');
    [...slide.firstChild.children].forEach((child) => {
      if ((slide.textContent === child.textContent) && child.nodeName === 'PICTURE') { // img only
        slide.classList.add('carousel-slide-img');
      } else if (child.querySelector('picture')) { // card-like
        slide.classList.add('carousel-slide-card');
        child.outerHTML = child.outerHTML.replace('<p>', '').replace('</p>', '');
      } else if (child.querySelector('picture + h2 > a, picture + h3 > a')) {
        const linkedHeading = child.querySelector('picture + h2 > a, picture + h3 > a');
        const picture = slide.querySelector('picture');
        const wrappedPicture = linkedHeading.cloneNode(true);
        wrappedPicture.innerHTML = picture.outerHTML;
        picture.replaceWith(wrappedPicture);
      }
    });
  });

  // setup for multiple slides
  if (slides.length > 1) {
    const leftBtn = buildNav('left');
    const rightBtn = buildNav('right');
    block.prepend(leftBtn, rightBtn);
    window.addEventListener('resize', () => {
      scrollToStart(block);
    });
  }
}
