// ------------------------------------------------------------------------
// Scrawl-canvas boilerplate
// ------------------------------------------------------------------------
import * as scrawl from './js-libraries/scrawl.js';
const mainCanvas = scrawl.findCanvas('main-canvas');

const builderStack = scrawl.findStack('filter-builder-stack');
const builderCanvas = scrawl.findCanvas('builder-canvas');


// ------------------------------------------------------------------------
// Module imports
// ------------------------------------------------------------------------
import { initSplitter } from './js-modules/dom-layout-ui.js';
import { initModalManagement } from './js-modules/modal-management.js';
import { initImageImport } from './js-modules/image-import.js';
import { initImageDisplay } from './js-modules/image-display.js';


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
// ------------------------------------------------------------------------

scrawl.makeLabel({
  name: 'temp-label',
  group: builderCanvas.get('baseGroup'),
  text: 'Filter builder area',
  start: ['center', 'center'],
  handle: ['center', 'center'],
  fontString: '2rem Arial, sans-serif',
})

console.log(scrawl.library);

import { getFilterSchemas } from './js-modules/filter-schemas.js';
console.log(getFilterSchemas());
