function scrollToStart(block) {
  if (block.scrollLeft !== 0) {
    block.scrollLeft = 0;
    const leftNav = block.querySelector('.hero-nav-left');
    leftNav.classList.add('hero-nav-disabled');
    const rightNav = block.querySelector('.hero-nav-right');
    rightNav.classList.remove('hero-nav-disabled');
  }
}

function checkScrollPosition(el) {
  if (el.scrollLeft === 0) return 'start';
  if (el.scrollWidth - el.scrollLeft === el.offsetWidth) return 'end';
  return null;
}

function buildNav(dir) {
  const btn = document.createElement('aside');
  btn.classList.add('hero-nav', `hero-nav-${dir}`);
  if (dir === 'left') btn.classList.add('hero-nav-disabled'); // start at beginning, can't scroll left
  btn.innerHTML = `<img class="icon icon-angle-${dir}-white" src="/icons/angle-${dir}-white.svg" alt=""/>`;
  btn.addEventListener('click', (e) => {
    const target = e.target.closest('.hero-nav');
    if (![...target.classList].includes('hero-nav-disabled')) {
      const carousel = e.target.closest('.hero');
      carousel.querySelectorAll('.hero-nav').forEach((nav) => nav.classList.remove('hero-nav-disabled'));
      if (dir === 'left') {
        carousel.scrollLeft -= carousel.offsetWidth;
      } else {
        carousel.scrollLeft += carousel.offsetWidth;
      }
      setTimeout(() => {
        const position = checkScrollPosition(carousel);
        if ((position === 'start' && dir === 'left')
          || (position === 'end' && dir === 'right')) {
          btn.classList.add('hero-nav-disabled');
        } else {
          btn.classList.remove('hero-nav-disabled');
        }
      }, 750);
    }
  });
  return btn;
}

export default async function decorate(block) {
  const slides = [...block.children];
  slides.forEach((slide) => {
    const overlay = document.createElement('div');
    overlay.classList.add('hero-overlay');
    [...slide.firstChild.children].forEach((child) => {
      if (child.nodeName !== 'PICTURE' && !child.querySelector('picture')) {
        overlay.append(child);
        if (child.querySelector('a')) {
          const a = child.querySelector('a');
          if (a.textContent === child.textContent) {
            a.classList.add('btn', 'hero-btn');
            child.classList.add('hero-btn-wrapper');
          }
        }
      } else if (child.querySelector('picture')) {
        child.outerHTML = child.outerHTML.replace('<p>', '').replace('</p>', '');
        slide.firstChild.classList.add('hero-img');
      }
      slide.classList.add('hero-slide');
    });
    if (overlay.children) {
      slide.append(overlay);
    }
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
