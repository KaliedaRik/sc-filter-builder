
// ------------------------------------------------------------------------
// Image display in the canvas
// ------------------------------------------------------------------------


// Local handles to SC and DOM
let scrawlHandle = null,
  canvasHandle = null;

// Scrawl-canvas boilerplate
let name = null;


// Local vars
let currentlyDisplaying = '';

export const getDisplayedImageId = () => currentlyDisplaying;

let checkerboard = null,
  noImagesMessage = null,
  haveImagesMessage = null,
  liveView = null;

// Canvas dimensions
let currentDisplayWidth = 1,
  currentDisplayHeight = 1;

// Minimap vars and handles
let minimapWidth = 200,
  minimapHeight = 200,
  minimapScale = 1,
  minimapFrameWidth = 50,
  minimapFrameHeight = 50,
  minimapPivot = null,
  minimapCell = null,
  minimapFrame = null,
  minimapPicture = null,
  minimapShowHide = null,
  minimapCenter = null,
  minimapX = null,
  minimapY = null,
  minimapNavX = null,
  minimapNavY = null,
  minimapNavCenter = null,
  minimapFrameDragZone = null;

const maxMinimapCoverage = 0.4;

const view = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  assetWidth: 1,
  assetHeight: 1,
  currentScale: 1,
};


const displayFilterFlag = {
  flag: true,
  // reset: () => displayFilterFlag.flag = false,
  // get: () => displayFilterFlag.flag,
};


const getImageDisplayViews = () => {
  return {...view};
};

const recalculateDimensions = () => {

  const [canvasWidth, canvasHeight] = canvasHandle.get('dimensions');

  const maxWidth = canvasWidth * maxMinimapCoverage;
  const maxHeight = canvasHeight * maxMinimapCoverage;

  minimapScale = Math.min(
    maxWidth / view.assetWidth,
    maxHeight / view.assetHeight,
  );

  minimapWidth = Math.round(view.assetWidth * minimapScale);
  minimapHeight = Math.round(view.assetHeight * minimapScale);

  minimapPivot.set({ dimensions: [minimapWidth, minimapHeight] });
  minimapCell.set({ dimensions: [minimapWidth, minimapHeight] });
};


// Minimap frame drag functionality
const exitMinimapFrameDrag = () => {

  const [x, y] = minimapFrame.get('position');

  const centerX = x / minimapScale;
  const centerY = y / minimapScale;

  view.x = centerX - view.width / 2;
  view.y = centerY - view.height / 2;

  view.x = clamp(view.x, 0, view.assetWidth - view.width);
  view.y = clamp(view.y, 0, view.assetHeight - view.height);

  applyView();

  const [w, h] = minimapCell.get('dimensions');
  const [fx, fy] = minimapFrame.get('position');

  minimapNavX.value = `${parseFloat((fx / w) * 100)}`;
  minimapNavY.value = `${parseFloat((fy / h) * 100)}`;
};

const checkMinimapFrameDrag = () => {

  const [x, y] = minimapFrame.get('position');

  const [mw, mh] = minimapCell.get('dimensions');
  const halfW = minimapFrameWidth / 2;
  const halfH = minimapFrameHeight / 2;

  const inside =
    x - halfW >= 0 &&
    y - halfH >= 0 &&
    x + halfW <= mw &&
    y + halfH <= mh;

  if (inside) {

    const centerX = x / minimapScale;
    const centerY = y / minimapScale;

    view.x = centerX - view.width / 2;
    view.y = centerY - view.height / 2;

    view.x = clamp(view.x, 0, view.assetWidth - view.width);
    view.y = clamp(view.y, 0, view.assetHeight - view.height);

    applyView();

    minimapNavX.value = `${parseFloat((x / mw) * 100)}`;
    minimapNavY.value = `${parseFloat((y / mh) * 100)}`;
  }
  else minimapFrameDragZone('exit');
};

const createMinimapFrameDragZone = () => {

  if (!minimapFrameDragZone) {

    minimapFrameDragZone = scrawlHandle.makeDragZone({

      zone: canvasHandle,
      collisionGroup: name('minimap-frame-group'),
      coordinateSource: minimapCell,
      endOn: ['up', 'leave'],
      updateWhileMoving: checkMinimapFrameDrag,
      updateOnPrematureExit: exitMinimapFrameDrag,
      preventTouchDefaultWhenDragging: true,
      exposeCurrentArtefact: true,
      processingOrder: 0,
    });
  }
};


// Calculate view size based on canvas aspect ratio
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

// Calculate liveView (destination) dimensions in CANVAS space
const calculateLiveViewDimensions = () => {

  const destW = (view.assetWidth < currentDisplayWidth) ? view.assetWidth : '100%';
  const destH = (view.assetHeight < currentDisplayHeight) ? view.assetHeight : '100%';

  return [destW, destH];
};

const applyLiveViewDimensions = () => {

  const [destW, destH] = calculateLiveViewDimensions();

  liveView.set({ dimensions: [destW, destH] });
};

// Numeric (pixel) destination dimensions for the liveView Picture on the canvas
const calculateLiveViewDestinationPixels = () => {

  const destW = (view.assetWidth < currentDisplayWidth) ? view.assetWidth : currentDisplayWidth;
  const destH = (view.assetHeight < currentDisplayHeight) ? view.assetHeight : currentDisplayHeight;

  return [destW, destH];
};

const calculateViewSize = () => {

  const s = view.currentScale || 1;
  const [destW, destH] = calculateLiveViewDestinationPixels();

  let vw = destW / s;
  let vh = destH / s;

  vw = clamp(vw, 1, view.assetWidth);
  vh = clamp(vh, 1, view.assetHeight);

  return [vw, vh];
};

const centerView = () => {

  const [w, h] = calculateViewSize();
  view.width = w;
  view.height = h;

  view.x = (view.assetWidth - w) / 2;
  view.y = (view.assetHeight - h) / 2;
};

const applyView = () => {

  // Canvas
  liveView.set({
    copyStart: [view.x, view.y],
    copyDimensions: [view.width, view.height],
  });

  // Minimap frame should only show when the view is cropping the image
  const [destWpx, destHpx] = calculateLiveViewDestinationPixels();
  
  const shouldShowFrame = 
    view.assetWidth > destWpx || 
    view.assetHeight > destHpx ||
    (view.currentScale || 1) > 1;

  minimapFrame.set({ visibility: shouldShowFrame });

  if (!shouldShowFrame) {

    if (minimapFrameDragZone) {

      minimapFrameDragZone(true);
      minimapFrameDragZone = null;
    }
    return;
  }

  // Minimap frame geometry
  minimapFrameWidth = view.width * minimapScale;
  minimapFrameHeight = view.height * minimapScale;

  minimapFrame.set({
    dimensions: [minimapFrameWidth, minimapFrameHeight],
    startX: (view.x + view.width / 2) * minimapScale,
    startY: (view.y + view.height / 2) * minimapScale,
  });

  if (!minimapFrameDragZone) createMinimapFrameDragZone();

  displayFilterFlag.flag = true;
};

// Export function to display an image
let assetCounter = 0;

export const prepareImageForDisplay = (selectedKey, state, oldState) => {

  if (selectedKey === currentlyDisplaying) return;

  // Prevent possibility of double-triggering
  currentlyDisplaying = selectedKey;

  // Dispose of previous asset if required
  if (oldState) {

    liveView.set({ asset: '' });
    minimapPicture.set({ asset: ''});

    if (oldState.largeAsset) {

      oldState.largeAsset.kill();
      delete oldState.largeAssetName;
      delete oldState.largeAsset;

      if (oldState.largeBitmap) {

        oldState.largeBitmap.close();
        delete oldState.largeBitmap;
      }
    }

    if (oldState.minimapAsset) {

      oldState.minimapAsset.kill();
      delete oldState.minimapAssetName;
      delete oldState.minimapAsset;

      if (oldState.minimapBitmap) {

        oldState.minimapBitmap.close();
        delete oldState.minimapBitmap;
      }
    }
  }

  const newAssetName = name(`dynamic-asset-${assetCounter}`);
  assetCounter++;

  const {width, height, file} = state;

  view.assetWidth = width;
  view.assetHeight = height;

  applyLiveViewDimensions();
  centerView();

  // Large asset
  createImageBitmap(file)
  .then(bitmap => {

    // Guard: user clicks on a different image button before this button's processes complete
    if (currentlyDisplaying !== selectedKey) {

      bitmap.close?.();
      return;
    }

    const [importedName] = scrawlHandle.importImageBitmap({
      name: newAssetName,
      src: bitmap,
    });

    state.largeAssetName = importedName;
    state.largeAsset = scrawlHandle.findAsset(importedName);
    state.largeBitmap = bitmap;

    liveView.set({ asset: importedName });

    applyView();
    removeDefaultScreen();
  });

  recalculateDimensions();

  // Small asset
  createImageBitmap(file, {
    resizeWidth: minimapWidth,
    resizeHeight: minimapHeight,
    resizeQuality: 'high',
  })
  .then(bitmap => {

    // Guard: user clicks on a different image button before this button's processes complete
    if (currentlyDisplaying !== selectedKey) {

      bitmap.close?.();
      return;
    }

    const [importedName] = scrawlHandle.importImageBitmap({
      name: `${newAssetName}-minimap`,
      src: bitmap,
    });

    state.minimapAssetName = importedName;
    state.minimapAsset = scrawlHandle.findAsset(importedName);
    state.minimapBitmap = bitmap;

    minimapPicture.set({ asset: importedName });
  });
};


// Display cycle liveView updating (will run in the commence hook)
const checkLiveView = () => {

  if (liveView.get('visibility')) {

    // Check for changes to the canvas dimensions 
    // - Cannot do a resize event listener - splitter bar can change canvas dimensions
    const [w, h] = canvasHandle.get('dimensions');

    if (w !== currentDisplayWidth || h !== currentDisplayHeight) {

      currentDisplayWidth = w;
      currentDisplayHeight = h;

      // Preserve center
      const centerX = view.x + view.width / 2;
      const centerY = view.y + view.height / 2;

      recalculateDimensions();

      applyLiveViewDimensions();

      // Recalculate view size
      const [width, height] = calculateViewSize();
      view.width = width;
      view.height = height;

      // Restore center
      view.x = centerX - width / 2;
      view.y = centerY - height / 2;

      // Clamp
      view.x = clamp(view.x, 0, view.assetWidth - width);
      view.y = clamp(view.y, 0, view.assetHeight - height);

      applyView();
    }
    minimapCell.updateHere();
  }
};


// Export function to display default canvas
export const displayDefaultScreen = (imagesAvailable = false) => {

  currentlyDisplaying = '';

  checkerboard.set({ visibility: true });
  liveView.set({ visibility: false });
  minimapCell.set({ shown: false });

  if (imagesAvailable) {
    noImagesMessage.set({ visibility: false });
    haveImagesMessage.set({ visibility: true });
  }
  else {
    noImagesMessage.set({ visibility: true });
    haveImagesMessage.set({ visibility: false });
  }
};

const removeDefaultScreen = () => {

  checkerboard.set({ visibility: false });
  noImagesMessage.set({ visibility: false });
  haveImagesMessage.set({ visibility: false });

  liveView.set({ visibility: true});
  minimapCell.set({ shown: true });
};

// Export for initialization 
export const initImageDisplay = (scrawl = null, dom = null, canvas = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initImageDisplay function');
  if (!dom) throw new Error('DOM mappings not passed to initImageDisplay function');
  if (!canvas) throw new Error('Canvas element not passed to initImageDisplay function');


  // Populate local handles
  scrawlHandle = scrawl;
  canvasHandle = canvas;

  name = (n) => `${canvas.name}-${n}`;

  // DOM handles
  minimapShowHide = dom['minimap-show-hide'];
  minimapCenter = dom['minimap-center'];
  minimapX = dom['minimap-horizontal'];
  minimapY = dom['minimap-vertical'];
  minimapNavX = dom['navigation-horizontal'];
  minimapNavY = dom['navigation-vertical'];
  minimapNavCenter = dom['navigation-center'];


  // Create the default screen checkerboard background
  const checkerboardCell = canvas.buildCell({

    name: name('checkerboard-background-cell'),
    dimensions: [32, 32],
    backgroundColor: '#999',
    cleared: false,
    compiled: false,
    shown: false,
  });

  scrawl.makeBlock({

    name: name('checkerboard-background-block-1'),
    group: name('checkerboard-background-cell'),
    dimensions: ['50%', '50%'],
    fillStyle: '#bbb',

  }).clone({

    name: name('checkerboard-background-block-2'),
    start: ['50%', '50%'],
  });

  checkerboardCell.clear();
  checkerboardCell.compile();

  checkerboard = scrawl.makeBlock({

    name: name('checkerboard-background'),
    group: canvas.get('baseName'),
    dimensions: ['100%', '100%'],
    fillStyle: name('checkerboard-background-cell'),
    visibility: false,
  });

  // Create the default screen messages
  noImagesMessage = scrawl.makeLabel({

    name: name('no-images-message'),
    fontString: '2rem Arial, sans-serif',
    start: ['center', 'center'],
    handle: ['center', 'center'],
    text: 'Please import some images to process',
    fillStyle: 'black',
    strokeStyle: 'white',
    lineWidth: 6,
    method: 'drawThenFill',
    visibility: false,
  });

  haveImagesMessage = noImagesMessage.clone({

    name: name('have-images-message'),
    text: 'Please select an image to display it',
  });


  // Create Picture entity
  // - displays a filtered portion of the current image's ImageBitmap object
  liveView = scrawl.makePicture({

    name: 'live-view',
    dimensions: ['100%', '100%'],

    start: ['center', 'center'],
    handle: ['center', 'center'],

    copyStart: [1, 1],
    copyDimensions: [1, 1],

    // We'll be building and applying the filter dynamically
    filters: [],
    memoizeFilterOutput: true,

    imageSmoothingEnabled: false,
    visibility: false,
  });

  scrawl.addNativeListener(['input', 'change'], (e) => {

    // Only respond to the scale input itself
    const el = e?.target;
    if (!el || el.id !== 'image-scale') return;

    view.currentScale = parseFloat(el.value) || 1;

    const [w, h] = calculateViewSize();
    view.width = w;
    view.height = h;

    view.x = (view.assetWidth - w) / 2;
    view.y = (view.assetHeight - h) / 2;

    view.x = clamp(view.x, 0, view.assetWidth - w);
    view.y = clamp(view.y, 0, view.assetHeight - h);

    applyView();

    minimapNavX.value = '50';
    minimapNavY.value = '50';

  }, '.scale-controls');

  // Create the infrastructure for the minimap
  scrawl.makeGroup({

    name: name('minimap-pivot-group'),
    host: canvas.getBase(),
  });

  minimapPivot = scrawl.makeBlock({

    name: name('minimap-pivot'),
    group: name('minimap-pivot-group'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: [minimapWidth, minimapHeight],
    method: 'none',
    shadowOffsetX: 3,
    shadowOffsetY: 3,
    shadowBlur: 2,
    shadowColor: 'rgb(0 0 0)',
  });

  minimapCell = canvas.buildCell({

    name: name('minimap-cell'),
    dimensions: [minimapWidth, minimapHeight],
    handle: ['center', 'center'],
    pivot: name('minimap-pivot'),
    lockTo: 'pivot',
    backgroundColor: 'rgb(255 255 255)',
    compileOrder: 1,
  });

  minimapPicture = scrawl.makePicture({

    name: name('minimap-cell-picture'),
    group: name('minimap-cell'),
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    strokeStyle: 'rgb(255 255 255)',
    lineWidth: 2,
    method: 'fillThenDraw',
    globalAlpha: 0.8,
  });

  // Event listeners
  scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: name('minimap-pivot-group'),
    coordinateSource: canvas.getBase(),
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
    processingOrder: 1,

    updateWhileMoving: () => { 

      const [x, y] = minimapPivot.get('position');
      const [w, h] = canvas.get('dimensions');

      minimapX.value = `${parseFloat((x / w) * 100)}`;
      minimapY.value = `${parseFloat((y / h) * 100)}`;
    },
  });

  scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.minimap-controls',

    target: minimapPivot,

    useNativeListener: true,
    preventDefault: true,

    updates: {
      ['minimap-horizontal']: ['startX', '%'],
      ['minimap-vertical']: ['startY', '%'],
    },
  });

  scrawl.addNativeListener('click', () => {

    const isShowing = minimapCell.get('shown');

    if (isShowing) {

      minimapCell.set({ shown: false });
      minimapShowHide.textContent = 'Show minimap';
    }
    else {

      minimapCell.set({ shown: true });
      minimapShowHide.textContent = 'Hide minimap';
    }
  }, minimapShowHide);

  scrawl.addNativeListener('click', () => {
    minimapPivot.set({ start: ['center', 'center'] });
    minimapX.value = '50';
    minimapY.value = '50';
  }, minimapCenter);

  // Create the infrastructure for the minimap navigation frame
  scrawl.makeGroup({

    name: name('minimap-frame-group'),
    host: minimapCell,
  });

  minimapFrame = scrawl.makeBlock({

    name: name('minimap-frame'),
    group: name('minimap-frame-group'),
    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: [50, 50],
    strokeStyle: 'rgb(255 100 100)',
    lineWidth: 2,
    shadowColor: 'rgb(0 0 0)',
    shadowOffsetX: 2,
    shadowOffsetY: 2,
    shadowBlur: 0,
    method: 'draw',
  });

  createMinimapFrameDragZone();

  scrawl.addNativeListener(['input', 'change'], () => {

    // If the frame is hidden, navigation controls should do nothing
    if (!minimapFrame.get('visibility')) return;

    const nx = parseFloat(minimapNavX.value) / 100;
    const ny = parseFloat(minimapNavY.value) / 100;

    const [mw, mh] = minimapCell.get('dimensions');

    let x = nx * mw;
    let y = ny * mh;

    const halfW = minimapFrameWidth / 2;
    const halfH = minimapFrameHeight / 2;

    x = clamp(x, halfW, mw - halfW);
    y = clamp(y, halfH, mh - halfH);

    const centerX = x / minimapScale;
    const centerY = y / minimapScale;

    view.x = centerX - view.width / 2;
    view.y = centerY - view.height / 2;

    view.x = clamp(view.x, 0, view.assetWidth - view.width);
    view.y = clamp(view.y, 0, view.assetHeight - view.height);

    applyView();

  }, '.navigation-controls');

  scrawl.addNativeListener('click', () => {

    const [mw, mh] = minimapCell.get('dimensions');

    const x = mw / 2;
    const y = mh / 2;

    const centerX = x / minimapScale;
    const centerY = y / minimapScale;

    view.x = centerX - view.width / 2;
    view.y = centerY - view.height / 2;

    view.x = clamp(view.x, 0, view.assetWidth - view.width);
    view.y = clamp(view.y, 0, view.assetHeight - view.height);

    applyView();

    minimapNavX.value = '50';
    minimapNavY.value = '50';

  }, minimapNavCenter);

  // Init return
  return {
    displayDefaultScreen,
    checkLiveView,
    getImageDisplayViews,
    displayFilterFlag,
  };
};
