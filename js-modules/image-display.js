// ------------------------------------------------------------------------
// Image display in the canvas
// ------------------------------------------------------------------------


// Imports
import { 
  DOMID,
  FLAGS,
  VIEW,
  BASIC_PREVIEW,
  ACCURATE_PREVIEW,
  getFilterWrapper,
  getScrawlHandle,
  getDomHandle,
} from './utilities.js';


// Local handles to SC and DOM
let scrawl, dom, canvas, name;


// Local vars
let currentlyDisplaying = '';

export const getDisplayedImageId = () => currentlyDisplaying;

let noImagesMessage, haveImagesMessage,
  basicView, accurateCell, accuratePicture, accurateView;

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

const recalculateDimensions = () => {

  const [canvasWidth, canvasHeight] = canvas.get('dimensions');

  const maxWidth = canvasWidth * maxMinimapCoverage;
  const maxHeight = canvasHeight * maxMinimapCoverage;

  minimapScale = Math.min(
    maxWidth / VIEW.assetWidth,
    maxHeight / VIEW.assetHeight,
  );

  minimapWidth = Math.round(VIEW.assetWidth * minimapScale);
  minimapHeight = Math.round(VIEW.assetHeight * minimapScale);

  minimapPivot.set({ dimensions: [minimapWidth, minimapHeight] });
  minimapCell.set({ dimensions: [minimapWidth, minimapHeight] });
};


// Minimap frame drag functionality
const exitMinimapFrameDrag = () => {

  const [x, y] = minimapFrame.get('position');

  const centerX = x / minimapScale;
  const centerY = y / minimapScale;

  VIEW.x = centerX - VIEW.width / 2;
  VIEW.y = centerY - VIEW.height / 2;

  VIEW.x = clamp(VIEW.x, 0, VIEW.assetWidth - VIEW.width);
  VIEW.y = clamp(VIEW.y, 0, VIEW.assetHeight - VIEW.height);

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

    VIEW.x = centerX - VIEW.width / 2;
    VIEW.y = centerY - VIEW.height / 2;

    VIEW.x = clamp(VIEW.x, 0, VIEW.assetWidth - VIEW.width);
    VIEW.y = clamp(VIEW.y, 0, VIEW.assetHeight - VIEW.height);

    applyView();

    minimapNavX.value = `${parseFloat((x / mw) * 100)}`;
    minimapNavY.value = `${parseFloat((y / mh) * 100)}`;
  }
  else minimapFrameDragZone('exit');
};

const createMinimapFrameDragZone = () => {

  if (!minimapFrameDragZone) {

    minimapFrameDragZone = scrawl.makeDragZone({

      zone: canvas,
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

  const destW = (VIEW.assetWidth < currentDisplayWidth) ? VIEW.assetWidth : '100%';
  const destH = (VIEW.assetHeight < currentDisplayHeight) ? VIEW.assetHeight : '100%';

  return [destW, destH];
};

const applyLiveViewDimensions = () => {

  const [destW, destH] = calculateLiveViewDimensions();

  basicView.set({ dimensions: [destW, destH] });
  accurateView.set({ dimensions: [destW, destH] });
};

// Numeric (pixel) destination dimensions for the liveView Picture on the canvas
const calculateLiveViewDestinationPixels = () => {

  const destW = (VIEW.assetWidth < currentDisplayWidth) ? VIEW.assetWidth : currentDisplayWidth;
  const destH = (VIEW.assetHeight < currentDisplayHeight) ? VIEW.assetHeight : currentDisplayHeight;

  return [destW, destH];
};

const calculateViewSize = () => {

  const s = VIEW.currentScale || 1;
  const [destW, destH] = calculateLiveViewDestinationPixels();

  let vw = destW / s;
  let vh = destH / s;

  vw = clamp(vw, 1, VIEW.assetWidth);
  vh = clamp(vh, 1, VIEW.assetHeight);

  return [vw, vh];
};

const centerView = () => {

  const [w, h] = calculateViewSize();
  VIEW.width = w;
  VIEW.height = h;

  VIEW.x = (VIEW.assetWidth - w) / 2;
  VIEW.y = (VIEW.assetHeight - h) / 2;
};

const applyView = () => {

  // Canvas
  basicView.set({
    copyStart: [VIEW.x, VIEW.y],
    copyDimensions: [VIEW.width, VIEW.height],
  });

  accurateView.set({
    copyStart: [VIEW.x, VIEW.y],
    copyDimensions: [VIEW.width, VIEW.height],
  });

  // Minimap frame should only show when the view is cropping the image
  const [destWpx, destHpx] = calculateLiveViewDestinationPixels();
  
  const shouldShowFrame = 
    VIEW.assetWidth > destWpx || 
    VIEW.assetHeight > destHpx ||
    (VIEW.currentScale || 1) > 1;

  minimapFrame.set({ visibility: shouldShowFrame });

  if (!shouldShowFrame) {

    if (minimapFrameDragZone) {

      minimapFrameDragZone(true);
      minimapFrameDragZone = null;
    }
    return;
  }

  // Minimap frame geometry
  minimapFrameWidth = VIEW.width * minimapScale;
  minimapFrameHeight = VIEW.height * minimapScale;

  minimapFrame.set({
    dimensions: [minimapFrameWidth, minimapFrameHeight],
    startX: (VIEW.x + VIEW.width / 2) * minimapScale,
    startY: (VIEW.y + VIEW.height / 2) * minimapScale,
  });

  if (!minimapFrameDragZone) createMinimapFrameDragZone();

  // basic preview needs to re-render each time its frame moves
  // accurate preview needs to re-render only when the filter changes
  if (FLAGS.isBasicPreview) FLAGS.dirtyFilter = true;
};

// Export function to display an image
let assetCounter = 0;

export const prepareImageForDisplay = (selectedKey, state, oldState) => {

  if (selectedKey === currentlyDisplaying) return;

  // Prevent possibility of double-triggering
  currentlyDisplaying = selectedKey;

  // Dispose of previous asset if required
  if (oldState) {

    basicView.set({ asset: '' });
    accuratePicture.set({ asset: '' });
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

  VIEW.assetWidth = width;
  VIEW.assetHeight = height;

  accurateCell.set({ dimensions: [width, height] });

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

    const [importedName] = scrawl.importImageBitmap({
      name: newAssetName,
      src: bitmap,
    });

    state.largeAssetName = importedName;
    state.largeAsset = scrawl.findAsset(importedName);
    state.largeBitmap = bitmap;

    basicView.set({ asset: importedName });

    accuratePicture.set({ asset: importedName });
    accurateCell.clear();
    accurateCell.compile();

    FLAGS.dirtyFilter = true;

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

    const [importedName] = scrawl.importImageBitmap({
      name: `${newAssetName}-minimap`,
      src: bitmap,
    });

    state.minimapAssetName = importedName;
    state.minimapAsset = scrawl.findAsset(importedName);
    state.minimapBitmap = bitmap;

    minimapPicture.set({ asset: importedName });
  });
};


// Display cycle liveView updating (will run in the commence hook)
const checkLiveView = () => {

  // Check for changes to the canvas dimensions 
  // - Cannot do a resize event listener - splitter bar can change canvas dimensions
  const [w, h] = canvas.get('dimensions');

  if (w !== currentDisplayWidth || h !== currentDisplayHeight) {

    currentDisplayWidth = w;
    currentDisplayHeight = h;

    // Preserve center
    const centerX = VIEW.x + VIEW.width / 2;
    const centerY = VIEW.y + VIEW.height / 2;

    recalculateDimensions();

    applyLiveViewDimensions();

    // Recalculate view size
    const [width, height] = calculateViewSize();
    VIEW.width = width;
    VIEW.height = height;

    // Restore center
    VIEW.x = centerX - width / 2;
    VIEW.y = centerY - height / 2;

    // Clamp
    VIEW.x = clamp(VIEW.x, 0, VIEW.assetWidth - width);
    VIEW.y = clamp(VIEW.y, 0, VIEW.assetHeight - height);

    applyView();
  }

  // Update the minimap here object every display cycle
  minimapCell.updateHere();
};


// Export function to display default canvas
export const displayDefaultScreen = (imagesAvailable = false) => {

  currentlyDisplaying = '';

  basicView.set({ visibility: false });
  accurateView.set({ visibility: false });
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

  noImagesMessage.set({ visibility: false });
  haveImagesMessage.set({ visibility: false });

  const isBasicPreview = FLAGS.isBasicPreview;

  basicView.set({ visibility: (isBasicPreview) ? true : false });
  accurateView.set({ visibility: (isBasicPreview) ? false : true });

  minimapCell.set({ shown: true });
};

// Export for initialization 
export const initImageDisplay = () => {

  scrawl = getScrawlHandle();
  dom = getDomHandle();
  canvas = scrawl.findCanvas('main-canvas');
  name = (n) => `${canvas.name}-${n}`;


  // DOM handles
  minimapShowHide = dom[DOMID.MINIMAP_SHOW];
  minimapCenter = dom[DOMID.MINIMAP_CENTER];
  minimapX = dom[DOMID.MINIMAP_X];
  minimapY = dom[DOMID.MINIMAP_Y];
  minimapNavX = dom[DOMID.NAVIGATION_X];
  minimapNavY = dom[DOMID.NAVIGATION_Y];
  minimapNavCenter = dom[DOMID.NAVIGATION_CENTER];


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

  scrawl.makeBlock({

    name: name('checkerboard-background'),
    group: canvas.get('baseName'),
    dimensions: ['100%', '100%'],
    fillStyle: name('checkerboard-background-cell'),
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


  // Basic and accurate previews
  FLAGS.isBasicPreview = true;

  scrawl.addNativeListener('change', (e) => {

    if (e && e.target) {

      e.preventDefault();
      e.stopPropagation();

      // The selector gives us 'basic' and 'accurate', but `FLAGS.isBasicPreview` is boolean with true == 'basic'
      const currentValue = FLAGS.isBasicPreview ? 'basic' : 'accurate',
        value = e.target.value;

      if (currentValue !== value) {

        const newValue = value === 'basic';

        if (newValue) {

          basicView.set({ visibility: true });
          accurateView.set({ visibility: false });
        }
        else {

          basicView.set({ visibility: false });
          accurateView.set({ visibility: true });

          accurateCell.clear();
          accurateCell.compile();
        }

        FLAGS.isBasicPreview = newValue;

        applyView();

        const currentFilter = getFilterWrapper();

        if (currentFilter) {

          currentFilter.updateDisplayFilter();

          if (!newValue) {

            accurateCell.clear();
            accurateCell.compile();
          }
        }
      }
    }
  }, dom[DOMID.PREVIEW_SELECT]);


  // Setup for image preview = 'basic'
  basicView = scrawl.makePicture({

    name: BASIC_PREVIEW,
    dimensions: ['100%', '100%'],

    start: ['center', 'center'],
    handle: ['center', 'center'],

    copyStart: [1, 1],
    copyDimensions: [1, 1],

    filters: [],
    memoizeFilterOutput: true,

    imageSmoothingEnabled: false,
    visibility: true,
  });


  // Setup for image preview = 'accurate'
  accurateCell = canvas.buildCell({

    name: `${ACCURATE_PREVIEW}-cell`,
    dimensions: [1, 1],

    cleared: false,
    compiled: false,
    shown: false,
  });

  accuratePicture = scrawl.makePicture({

    name: ACCURATE_PREVIEW,
    group: accurateCell,
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    filters: [],
  });

  accurateView = scrawl.makePicture({

    name: `${ACCURATE_PREVIEW}-filtered-picture`,
    asset: accurateCell,

    start: ['center', 'center'],
    handle: ['center', 'center'],
    dimensions: ['100%', '100%'],

    copyDimensions: [1, 1],
    copyStart: [0, 0],

    imageSmoothingEnabled: false,
    visibility: false,
  });


  // Setup scaling functionality
  scrawl.addNativeListener(['input', 'change'], (e) => {

    // Only respond to the scale input itself
    const el = e?.target;
    if (!el || el.id !== DOMID.PREVIEW_SCALE) return;

    VIEW.currentScale = parseFloat(el.value) || 1;

    const [w, h] = calculateViewSize();
    VIEW.width = w;
    VIEW.height = h;

    VIEW.x = (VIEW.assetWidth - w) / 2;
    VIEW.y = (VIEW.assetHeight - h) / 2;

    VIEW.x = clamp(VIEW.x, 0, VIEW.assetWidth - w);
    VIEW.y = clamp(VIEW.y, 0, VIEW.assetHeight - h);

    applyView();

    minimapNavX.value = '50';
    minimapNavY.value = '50';

  }, DOMID.SCALE_CONTROLS_CSS);


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
    origin: DOMID.MINIMAP_CONTROLS_CSS,

    target: minimapPivot,

    useNativeListener: true,
    preventDefault: true,

    updates: {
      [DOMID.MINIMAP_X]: ['startX', '%'],
      [DOMID.MINIMAP_Y]: ['startY', '%'],
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

    VIEW.x = centerX - VIEW.width / 2;
    VIEW.y = centerY - VIEW.height / 2;

    VIEW.x = clamp(VIEW.x, 0, VIEW.assetWidth - VIEW.width);
    VIEW.y = clamp(VIEW.y, 0, VIEW.assetHeight - VIEW.height);

    applyView();

  }, DOMID.NAVIGATION_CONTROLS_CSS);

  scrawl.addNativeListener('click', () => {

    const [mw, mh] = minimapCell.get('dimensions');

    const x = mw / 2;
    const y = mh / 2;

    const centerX = x / minimapScale;
    const centerY = y / minimapScale;

    VIEW.x = centerX - VIEW.width / 2;
    VIEW.y = centerY - VIEW.height / 2;

    VIEW.x = clamp(VIEW.x, 0, VIEW.assetWidth - VIEW.width);
    VIEW.y = clamp(VIEW.y, 0, VIEW.assetHeight - VIEW.height);

    applyView();

    minimapNavX.value = '50';
    minimapNavY.value = '50';

  }, minimapNavCenter);

  // Init return
  return {
    displayDefaultScreen,
    checkLiveView,
  };
};
