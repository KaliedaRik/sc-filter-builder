// ------------------------------------------------------------------------
// Image display in the canvas
// ------------------------------------------------------------------------


// Local handles to SC and DOM
let scrawlHandle = null,
  domHandle = null,
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
  minimapPivot = null,
  minimapCell = null,
  minimapFrame = null,
  minimapPicture = null,
  minimapFrameWidth = 50,
  minimapFrameHeight = 50,
  minimapShowHide = null,
  minimapCenter = null,
  minimapX = null,
  minimapY = null,
  minimapNavX = null,
  minimapNavY = null,
  minimapNavCenter = null;

const maxMinimapCoverage = 0.4;

// liveView vars
let assetWidth = 1,
  assetHeight = 1,
  assetStartX = 0,
  assetStartY = 0;

const recalculateDimensions = () => {

  const [canvasWidth, canvasHeight] = canvasHandle.get('dimensions');

  const maxWidth = canvasWidth * maxMinimapCoverage;
  const maxHeight = canvasHeight * maxMinimapCoverage;

  minimapScale = Math.min(
    maxWidth / assetWidth,
    maxHeight / assetHeight,
  );

  minimapWidth = Math.round(assetWidth * minimapScale);
  minimapHeight = Math.round(assetHeight * minimapScale);

  minimapPivot.set({ dimensions: [minimapWidth, minimapHeight] });
  minimapCell.set({ dimensions: [minimapWidth, minimapHeight] });
};


// Export function to display an image
let assetCounter = 0;

export const prepareImageForDisplay = (selectedKey, state, oldState) => {

  if (selectedKey === currentlyDisplaying) return;

  // Prevent possibility of double-triggering (may not need `oldDisplaying` now we're getting oldState directly)
  const oldDisplaying = currentlyDisplaying;
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

  assetWidth = width;
  assetHeight = height;

  // Large asset
  createImageBitmap(file)
  .then(bitmap => {

    // Guarding against user clicking on a different image button before this button's processes complete
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

    removeDefaultScreen();
  });

  recalculateDimensions();

  createImageBitmap(file, {
    resizeWidth: minimapWidth,
    resizeHeight: minimapHeight,
    resizeQuality: 'high',
  })
  .then(bitmap => {

    // Guarding against user clicking on a different image button before this button's processes complete
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

      recalculateDimensions();

      currentDisplayWidth = w;
      currentDisplayHeight = h;

      liveView.set({
        dimensions: [currentDisplayWidth, currentDisplayHeight],
        copyDimensions: [currentDisplayWidth, currentDisplayHeight],
      });

      minimapFrame.set({ dimensions: [minimapFrameWidth, minimapFrameHeight] });

      minimapPivot.set({ start: ['center', 'center'] });
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
  domHandle = dom;
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


  // Create the Picture entity which will display a filtered portion of the current image's ImageBitmap object
  liveView = scrawl.makePicture({

    name: name('live-view'),
    dimensions: ['100%', '100%'],

    copyStart: [1, 1],
    copyDimensions: [1, 1],

    // We'll be building and applying the filter dynamically
    filters: [],

    visibility: false,
  });

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
  });

  minimapCell = canvas.buildCell({

    name: name('minimap-cell'),
    dimensions: [minimapWidth, minimapHeight],
    handle: ['center', 'center'],
    pivot: name('minimap-pivot'),
    lockTo: 'pivot',
    backgroundColor: 'white',
    compileOrder: 1,
  });

  minimapPicture = scrawl.makePicture({

    name: name('minimap-cell-picture'),
    group: name('minimap-cell'),
    dimensions: ['100%', '100%'],
    copyDimensions: ['100%', '100%'],
    lineWidth: 4,
    method: 'fillThenDraw',
    globalAlpha: 0.5,
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
      minimapX: ['startX', '%'],
      minimapY: ['startY', '%'],
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
    strokeStyle: 'red',
    lineWidth: 2,
    method: 'draw',
  });

  const minimapFrameDragZone = scrawl.makeDragZone({

    zone: canvas,
    collisionGroup: name('minimap-frame-group'),
    coordinateSource: minimapCell,
    endOn: ['up', 'leave'],
    updateWhileMoving: () => {

      const [x, y] = minimapFrame.get('position');
      const [w, h] = minimapCell.get('dimensions');

      minimapNavX.value = `${parseFloat((x / w) * 100)}`;
      minimapNavY.value = `${parseFloat((y / h) * 100)}`;
    },
    preventTouchDefaultWhenDragging: true,
    exposeCurrentArtefact: true,
    processingOrder: 0,
  });

  scrawl.makeUpdater({

    event: ['input', 'change'],
    origin: '.navigation-controls',

    target: minimapFrame,

    useNativeListener: true,
    preventDefault: true,

    updates: {
      minimapNavX: ['startX', '%'],
      minimapNavY: ['startY', '%'],
    },
  });

  scrawl.addNativeListener('click', () => {
    minimapFrame.set({ start: ['center', 'center'] });
    minimapNavX.value = '50';
    minimapNavY.value = '50';
  }, minimapNavCenter);




  return {
    displayDefaultScreen,
    checkLiveView,
  };
};
