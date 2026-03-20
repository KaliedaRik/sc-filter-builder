// ------------------------------------------------------------------------
// Scrawl-canvas boilerplate
// ------------------------------------------------------------------------
import * as scrawl from './js-libraries/scrawl.js';
const name = (n) => `canvas-${n}`;
const canvas = scrawl.findCanvas('my-canvas');


// ------------------------------------------------------------------------
// Module imports
// ------------------------------------------------------------------------
import { initSplitter } from './js-modules/dom-layout-ui.js';
import { initImageImport } from './js-modules/image-import.js';
import { initModalManagement } from './js-modules/modal-management.js';


// ------------------------------------------------------------------------
// Scrawl-canvas check - is it working?
// ------------------------------------------------------------------------
scrawl.makeLabel({

  name: name('temp-label'),
  start: ['center', 'center'],
  handle: ['center', 'center'],
  text: 'Hello World',
  fontString: '60px Arial, sans-serif',
});


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
]);


// ------------------------------------------------------------------------
// Start the page running
// ------------------------------------------------------------------------
initSplitter(scrawl, dom);
initModalManagement(scrawl, dom);
initImageImport(scrawl, dom, canvas);


// ------------------------------------------------------------------------
// Scrawl-canvas animation
// ------------------------------------------------------------------------
scrawl.makeRender({

  name: name('render'),
  target: canvas,
});


// ------------------------------------------------------------------------
// Development
// ------------------------------------------------------------------------

console.log(scrawl.library);
