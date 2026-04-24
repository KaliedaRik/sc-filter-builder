// ------------------------------------------------------------------------
// Splitter bar management
// ------------------------------------------------------------------------
import { DOMID, FLAGS, getScrawlHandle, getDomHandle } from './utilities.js';

let scrawl, dom;

export const initDomLayout = () => {

  scrawl = getScrawlHandle();
  dom = getDomHandle();

  // Initialize the splitter bar
  const splitterBar = dom[DOMID.SPLITTER];

  if (!splitterBar) throw new Error('Splitter element not found in DOM mappings (initSplitter function)');

  let draggingSplitterBar = false,
    dragConfig = null;

  const docEl = document.documentElement;

  let imageWorkRatio = parseFloat(getComputedStyle(docEl).getPropertyValue('--image-work-height')) / 100;

  scrawl.addNativeListener('pointerdown', () => {

    draggingSplitterBar = true;
    document.body.style.cursor = 'row-resize';

    const computed = getComputedStyle(docEl);

    dragConfig = {
      minImageWorkRatio: parseFloat(computed.getPropertyValue('--minimum-image-work-ratio')),
      minFilterWorkRatio: parseFloat(computed.getPropertyValue('--minimum-filter-work-ratio')),
      splitterHeight: parseFloat(computed.getPropertyValue('--splitter-height')),
    };

  }, splitterBar);

  scrawl.addNativeListener('pointerup', () => {

    draggingSplitterBar = false;
    document.body.style.cursor = '';

  }, window);

  scrawl.addNativeListener('pointermove', (e) => {

    if (!draggingSplitterBar) return;

    const vh = window.innerHeight,
      minImageWork = vh * dragConfig.minImageWorkRatio,
      minFilterWork = vh * dragConfig.minFilterWorkRatio,
      maxImageWork = vh - minFilterWork - dragConfig.splitterHeight;

    let imageWorkHeight = e.clientY;

    if (imageWorkHeight < minImageWork) imageWorkHeight = minImageWork;
    if (imageWorkHeight > maxImageWork) imageWorkHeight = maxImageWork;

    imageWorkRatio = imageWorkHeight / vh;
    docEl.style.setProperty('--image-work-height', `${imageWorkHeight}px`);

  }, window);

  scrawl.addNativeListener('resize', () => {

    const vh = window.innerHeight,
      newImageWorkHeight = vh * imageWorkRatio;

    docEl.style.setProperty('--image-work-height', `${newImageWorkHeight}px`);

  }, window);

  // Return object
  return {};
};
