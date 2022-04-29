import {
  buildIcon,
  getMetadata,
  readBlockConfig,
} from '../../scripts/scripts.js';

function openPopup(e) {
  const target = e.target.closest('a');
  const href = target.getAttribute('data-href');
  const type = target.getAttribute('title');
  window.open(
    href,
    type,
    'popup,top=233,left=233,width=700,height=467',
  );
}

function buildButton(type) {
  const a = document.createElement('a');
  a.classList.add('social-btn', `social-btn-${type}`);
  a.setAttribute('title', `${type.charAt(0).toUpperCase()}${type.slice(1)}`);
  const url = encodeURIComponent(window.location.href);
  const title = encodeURIComponent(document.querySelector('h1').textContent);
  const desc = encodeURIComponent(getMetadata('description')) || '';

  if (type === 'email') { // EMAIL
    a.href = `mailto:?body=${url}&subject=${title}`;
  } else if (type === 'print') { // PRINT
    a.addEventListener('click', () => window.print());
  } else if (type === 'facebook') { // FACEBOOK
    a.setAttribute('data-href', `https://www.facebook.com/sharer/sharer.php?u=${url}`);
    a.addEventListener('click', openPopup);
  } else if (type === 'twitter') { // TWITTER
    a.setAttribute('data-href', `https://www.twitter.com/share?&url=${url}&text=${title}`);
    a.addEventListener('click', openPopup);
  } else if (type === 'linkedin') { // LINKEDIN
    a.setAttribute('data-href', `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${desc}`);
    a.addEventListener('click', openPopup);
  } else if (type === 'digg') {
    a.setAttribute('data-href', `https://www.digg.com/submit?&url=${url}`);
    a.addEventListener('click', openPopup);
  } else if (type === 'weibo') {
    a.setAttribute('data-href', `https://service.weibo.com/share/share.php?url=${url}&title=${title}`);
    a.addEventListener('click', openPopup);
  } else if (type === 'renren') {
    a.setAttribute('data-href', `http://widget.renren.com/dialog/share?resourceUrl=${url}&srcUrl=${url}&title=${title}&description=${desc}`);
    a.addEventListener('click', openPopup);
  } else if (type === 'plus') { // ADDITIONAL SOCIALS
    // eslint-disable-next-line no-use-before-define
    a.addEventListener('click', showMore);
  }
  a.append(buildIcon(type));
  return a;
}

function buildMenuItem(menu, type) {
  const btn = buildButton(type);
  btn.classList.add('social-btn-filled');
  if (type === 'renren') btn.setAttribute('title', '人人网');
  if (type === 'weibo') btn.setAttribute('title', '新浪微博');
  menu.append(btn);
}

function showMore(e) {
  const target = e.target.closest('a');
  const exists = document.querySelector('.social-btn-plus-menu');
  if (target && !exists) {
    // build more social menu
    const menu = document.createElement('div');
    menu.setAttribute('title', '');
    menu.classList.add('social-btn-plus-menu');
    const btns = ['digg', 'renren', 'weibo'];
    btns.forEach((btn) => buildMenuItem(menu, btn));
    target.append(menu);
  } else if (exists) {
    exists.remove();
  }
}

/**
 * loads and decorates the social
 * @param {Element} block The social block element
 */
export default async function decorate(block) {
  const config = readBlockConfig(block);
  block.textContent = '';

  // build columns
  const tools = document.createElement('div');
  tools.classList.add('social-tools');
  const media = document.createElement('div');
  media.classList.add('social-media');
  // build buttons
  Object.keys(config).forEach((key) => {
    const btn = buildButton(key);
    if (key === 'email' || key === 'print') {
      tools.append(btn);
    } else {
      media.append(btn);
    }
  });

  block.append(tools, media);
}
