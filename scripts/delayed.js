// eslint-disable-next-line import/no-cycle
import {
  makeLinksRelative,
  sampleRUM,
} from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
makeLinksRelative(document.querySelector('main'));

function updateExternalLinks() {
  document.querySelectorAll('main a').forEach((a) => {
    try {
      const { origin } = new URL(a.href, window.location.href);
      if (origin && origin !== window.location.origin) {
        a.setAttribute('rel', 'noopener');
        a.setAttribute('target', '_blank');
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid link: ${a.href}`);
    }
  });
}

updateExternalLinks();
