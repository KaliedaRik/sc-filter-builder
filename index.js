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
import { initCanvasComponents } from './js-modules/canvas-ui-components.js';
import { initFormBuilder } from './js-modules/form-builder.js';
import { initFormObjects } from './js-modules/form-objects.js';


// ------------------------------------------------------------------------
// DOM element capture
// ------------------------------------------------------------------------
const dom = scrawl.initializeDomInputs([

  // Capture handle to key parts of page
  ['by-id', 'splitter'],
  ['by-id', 'filter-controls-panel'],
  ['by-id', 'filter-builder-area-hold'],

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

initImageImport(scrawl, dom);

const {
  displayDefaultScreen,
  checkLiveView,
  getImageDisplayViews,
  displayFilterFlag,
} = initImageDisplay(scrawl, dom);

const {
  getCurrentWrappedFilter,
  actionWrapperLibrary,
} = initFormObjects(scrawl, getImageDisplayViews);

initCanvasComponents(scrawl, getCurrentWrappedFilter);

initFormBuilder(scrawl, dom, getCurrentWrappedFilter, actionWrapperLibrary);

const {
  checkIfFilterHasChanged,
} = initFilterBuilder(scrawl, dom);


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

const commenceFunction = () => {

  checkLiveView();

  if (displayFilterFlag.flag) {

    displayFilterFlag.flag = false;

    const filter = getCurrentWrappedFilter();
    filter.updateDisplayFilter();
  }

  checkIfFilterHasChanged();
};

scrawl.makeRender({

  name: 'main-canvas-render',
  target: mainCanvas,
  commence: commenceFunction,
});


// ------------------------------------------------------------------------
// Development 
// ------------------------------------------------------------------------
checkIfFilterHasChanged();

console.log(scrawl.library);
