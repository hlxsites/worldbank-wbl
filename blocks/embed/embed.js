function calculateHeight() {
  const header = document.querySelector('header');
  const main = document.querySelectorAll('main > div');
  const heights = [header.offsetHeight, ...[...main].map((el) => el.offsetHeight)];
  const height = heights.reduce((a, b) => a + b);
  const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
  return vh - height;
}

function buildDataviz(url, height = 750) {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.setAttribute('height', height > 750 ? height : 750);
  return iframe;
}

function buildFlourish(url, height = 750) {
  const iframe = document.createElement('iframe');
  iframe.src = url;
  iframe.setAttribute('height', height > 750 ? height : 750);
  return iframe;
}

/**
 * loads and decorates the embed
 * @param {Element} block The embed block element
 */
export default async function decorate(block) {
  const a = block.querySelector('a');
  if (!a) {
    block.remove();
  } else {
    const url = new URL(a.href);
    block.innerHTML = '';
    const height = calculateHeight();
    if (url.host.includes('dataviz.worldbank')) {
      const embed = buildDataviz(url, height);
      block.append(embed);
    } else if (url.host.includes('flo.uri.sh')) {
      const embed = buildFlourish(url, height);
      block.append(embed);
    }
  }
}
