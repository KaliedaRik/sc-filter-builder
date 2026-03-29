// ------------------------------------------------------------------------
// Scrawl-canvas boilerplate
// ------------------------------------------------------------------------
import * as scrawl from './js-libraries/scrawl.js';

const mainCanvas = scrawl.findCanvas('main-canvas');
const builderStack = scrawl.findStack('filter-builder-stack');
const builderCanvas = scrawl.findCanvas('filter-builder-canvas');


// ------------------------------------------------------------------------
// Module imports
// ------------------------------------------------------------------------
import { initSplitter } from './js-modules/dom-layout-ui.js';
import { initModalManagement } from './js-modules/modal-management.js';
import { initImageImport } from './js-modules/image-import.js';
import { initImageDisplay } from './js-modules/image-display.js';
import { initFilterBuilder } from './js-modules/filter-builder.js';
import { initFormBuilder } from './js-modules/form-builder.js';


// ------------------------------------------------------------------------
// DOM element capture
// ------------------------------------------------------------------------
const dom = scrawl.initializeDomInputs([

  // Capture handle to splitter
  ['by-id', 'splitter'],

  // Capture handles for the instructions modal
  ['button', 'instructions-modal-button', 'Instructions'],
  ['button', 'instructions-modal-close', 'Close'],
  ['by-id', 'instructions-modal'],

  // Capture handles for the image-batch modal
  ['button', 'image-batch-modal-button', 'Remove images from batch'],
  ['button', 'image-batch-modal-close', 'Close'],
  ['by-id', 'image-batch-modal'],
  ['button', 'image-batch-modal-remove-action', 'Remove selected images from batch'],
  ['by-id', 'image-batch-modal-images-list'],

  // Capture handles to the image-panel-related HTML elements
  ['input', 'image-import', ''],
  ['by-id', 'image-import-button'],
  ['by-id', 'image-imports-hold'],
  ['by-id', 'image-details-panel'],

  // Capture handles for the downloads modal
  ['button', 'downloads-modal-button', 'Downloads'],
  ['button', 'downloads-modal-close', 'Close'],
  ['by-id', 'downloads-modal'],
  ['button', 'process-and-download-action', 'Process and download images'],

  // Capture handles for the change-filter functionality
  ['button', 'change-filter-modal-button', 'Change filter'],
  ['button', 'change-filter-modal-close', 'Close'],
  ['by-id', 'change-filter-modal'],
  ['by-id', 'change-filter-warning-message'],
  ['button', 'load-filter-action', 'Import filter packet'],
  ['by-id', 'starters-grid'],
  ['by-id', 'current-filter-name'],

  // Capture handles to the minimap HTML elements
  ['input', 'minimap-horizontal', '50'],
  ['input', 'minimap-vertical', '50'],
  ['button', 'minimap-show-hide', 'Hide minimap'],
  ['button', 'minimap-center', 'Bring to center'],
  ['input', 'navigation-horizontal', '50'],
  ['input', 'navigation-vertical', '50'],
  ['button', 'navigation-center', 'Bring to center'],
  ['input', 'image-scale', '1'],
]);


// ------------------------------------------------------------------------
// Start the page running
// ------------------------------------------------------------------------
initSplitter(scrawl, dom);
initModalManagement(scrawl, dom);
initImageImport(scrawl, dom, mainCanvas);

const {
  displayDefaultScreen,
  liveView,
  checkLiveView,
} = initImageDisplay(scrawl, dom, mainCanvas);

initFilterBuilder(scrawl, dom, builderCanvas, liveView);
initFormBuilder(scrawl, dom);


// Show the default canvas display
displayDefaultScreen(false);


// ------------------------------------------------------------------------
// Scrawl-canvas animation
// ------------------------------------------------------------------------
scrawl.makeRender({

  name: 'builder-stack-render',
  target: builderStack,
});

scrawl.makeRender({

  name: 'builder-canvas-render',
  target: builderCanvas,
});

scrawl.makeRender({

  name: 'main-canvas-render',
  target: mainCanvas,
  commence: checkLiveView,
});


// ------------------------------------------------------------------------
// Development 
// - temporary artefacts used while developing functionality
// - affects both this repo and required changes in Scrawl-canvas repo
// ------------------------------------------------------------------------

scrawl.makeLabel({

  name: 'temp-label',
  group: builderCanvas.get('baseGroup'),
  text: 'Filter builder area',
  start: ['center', 'center'],
  handle: ['center', 'center'],
  fontString: '2rem Arial, sans-serif',
})

const el = scrawl.findElement('my-test-element');

el.set({
  start: ['center', 10],
  handle: ['center', 0],
  width: '40%',
  height: 'auto',
  css: {
    border: '1px dotted black',
    backgroundColor: 'rgb(255 255 0 / 0.5)',
    padding: '0.5rem 1rem',
  },
});

scrawl.makeWheel({

  name: 'temp-wheel-1',
  group: builderCanvas.get('baseGroup'),
  radius: 10,
  fillStyle: 'red',
  handle: ['center', 'center'],
  pivot: 'my-test-element',
  lockTo: 'pivot',

}).clone({

  name: 'temp-wheel-2',
  fillStyle: 'green',
  pivotCorner: 'topLeft',
  offsetY: 10,

}).clone({

  name: 'temp-wheel-3',
  fillStyle: 'blue',
  pivotCorner: 'topRight',

}).clone({

  name: 'temp-wheel-4',
  fillStyle: 'yellow',
  pivotCorner: 'bottomRight',
  offsetY: -10,

}).clone({

  name: 'temp-wheel-5',
  fillStyle: 'lightgreen',
  pivotCorner: 'bottomLeft',
});

const stackDragGroup = scrawl.makeGroup({ name: 'stack-drag-group' });
stackDragGroup.addArtefacts('my-test-element');

scrawl.makeDragZone({
  zone: builderStack,
  collisionGroup: stackDragGroup,
  endOn: ['up', 'leave'],
  preventTouchDefaultWhenDragging: true,
  processingOrder: 2,
});

console.log(scrawl.library);
