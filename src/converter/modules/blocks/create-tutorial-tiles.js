import yaml from 'js-yaml';
import { toBlock, replaceElement } from '../utils/dom-utils.js';

export default function createTutorialTiles(document, meta) {
  const ullistElements = Array.from(
    document.querySelectorAll('main > div > ul'),
  );
  const fullMetadata = yaml.load(meta);
  if (fullMetadata.type === 'Documentation') {
    if (ullistElements.length) {
      ullistElements.forEach((ullistElement) => {
        const h2 = ullistElement.previousElementSibling;
        if (
          h2.tagName === 'H2' &&
          (h2.id === 'tiles-tutorials' || h2.id === 'tutorials')
        ) {
          const ul = document.createElement('ul');
          ul.innerHTML = ullistElement.innerHTML;
          const cells = [[ul]];
          const block = toBlock('tutorial-tiles', cells, document);

          replaceElement(ullistElement, block);
        }
      });
    }
  }
}
