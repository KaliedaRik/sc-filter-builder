// ------------------------------------------------------------------------
// Splitter bar management
// ------------------------------------------------------------------------
export const initSplitter = (scrawl = null, dom = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initSplitter function');
  if (!dom) throw new Error('DOM mappings not passed to initSplitter function');

  const splitterBar = dom['splitter'];

  if (!splitterBar) throw new Error('Splitter element not found in DOM mappings (initSplitter function)');

  let draggingSplitterBar = false,
    dragConfig = null;

  const docEl = document.documentElement;

  let canvasRatio = parseFloat(getComputedStyle(docEl).getPropertyValue('--canvas-height')) / 100;

  scrawl.addNativeListener('pointerdown', () => {

    draggingSplitterBar = true;
    document.body.style.cursor = 'row-resize';

    const computed = getComputedStyle(docEl);

    dragConfig = {
      minCanvasRatio: parseFloat(computed.getPropertyValue('--minimum-canvas-ratio')),
      minBuilderRatio: parseFloat(computed.getPropertyValue('--minimum-builder-ratio')),
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
      minCanvas = vh * dragConfig.minCanvasRatio,
      minBuilder = vh * dragConfig.minBuilderRatio,
      maxCanvas = vh - minBuilder - dragConfig.splitterHeight;

    let canvasHeight = e.clientY;

    if (canvasHeight < minCanvas) canvasHeight = minCanvas;
    if (canvasHeight > maxCanvas) canvasHeight = maxCanvas;

    canvasRatio = canvasHeight / vh;
    docEl.style.setProperty('--canvas-height', `${canvasHeight}px`);

  }, window);

  scrawl.addNativeListener('resize', () => {

    const vh = window.innerHeight,
      newCanvasHeight = vh * canvasRatio;

    docEl.style.setProperty('--canvas-height', `${newCanvasHeight}px`);

  }, window);

  return {};
};
