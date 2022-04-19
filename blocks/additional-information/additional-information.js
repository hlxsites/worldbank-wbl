import {
  toClassName,
} from '../../scripts/scripts.js';

function setupExperts(el) {
  const title = el.querySelector('h3');
  const pics = el.querySelectorAll('picture');
  const links = el.querySelectorAll('a');
  const wrapper = document.createElement('div');
  wrapper.classList.add('experts-wrapper');
  pics.forEach((item, i) => {
    const row = document.createElement('div');
    pics[i].classList.add('expert-img');
    const picWrap = links[i].cloneNode(true);
    picWrap.innerHTML = pics[i].outerHTML;
    picWrap.classList.add('expert-img-wrapper');
    const info = document.createElement('div');
    info.classList.add('expert-info');
    info.append(links[i].parentNode, links[i].parentElement.parentElement.nextElementSibling);
    row.append(picWrap, info);
    wrapper.append(row);
  });
  el.innerHTML = wrapper.outerHTML;
  el.prepend(title);
  const btn = links[links.length - 1];
  btn.classList.add('btn', 'experts-btn');
  el.append(btn);
}

function setupStayConnected(el) {
  const imgs = el.querySelectorAll('img');
  imgs.forEach((img) => {
    img.outerHTML = `<span>${img.outerHTML}</span>`;
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  console.log('hi from', block);
  const sectionNames = ['title', ...[...block.querySelectorAll('h3')].map(((h3) => toClassName(h3.textContent)))];
  [...block.children].forEach((section, i) => {
    console.log('section:', section);
    section.classList.add(sectionNames[i]);
  });
  // setup experts section
  const experts = block.querySelector('.experts').firstChild;
  setupExperts(experts);
  // setup stay connected
  const connect = block.querySelector('.stay-connected').firstChild;
  setupStayConnected(connect);
}
