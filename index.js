// ------------------------------------------------------------------------
// Scrawl-canvas boilerplate
// ------------------------------------------------------------------------
import * as scrawl from './js-libraries/scrawl.js';

import { DOMID } from './js-modules/utilities.js';

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
import { initImageDownload } from './js-modules/image-download.js';


// ------------------------------------------------------------------------
// DOM element capture
// ------------------------------------------------------------------------
const dom = scrawl.initializeDomInputs([

  // Capture handle to key parts of page
  ['by-id', DOMID.SPLITTER],
  ['by-id', DOMID.CONTROLS_PANEL],
  ['by-id', DOMID.BUILDER_HOLD],

  // Capture handles for the instructions modal
  ['button', DOMID.INSTRUCTIONS_BUTTON, 'Instructions'],
  ['button', DOMID.INSTRUCTIONS_CLOSE, 'Close'],
  ['by-id', DOMID.INSTRUCTIONS_MODAL],

  // Capture handles for the image-batch modal
  ['button', DOMID.BATCH_BUTTON, 'Remove images from batch'],
  ['button', DOMID.BATCH_CLOSE, 'Close'],
  ['by-id', DOMID.BATCH_MODAL],
  ['button', DOMID.BATCH_REMOVE, 'Remove selected images from batch'],
  ['by-id', DOMID.BATCH_LIST],

  // Capture handles to the image-panel-related HTML elements
  ['input', DOMID.IMAGE_IMPORT, ''],
  ['by-id', DOMID.IMAGE_IMPORT_BUTTON],
  ['by-id', DOMID.IMAGE_IMPORT_HOLD],
  ['by-id', DOMID.IMAGE_DETAILS],

  // Capture handles to the right hand panel
  ['button', DOMID.FILTER_DOWNLOAD, 'Download filter'],
  ['by-id', DOMID.FILTER_BUTTON],
  ['by-id', DOMID.FILTER_IMPORT],
  ['by-id', DOMID.PREVIEW_WARNING],

  // Capture handles for the downloads modal
  ['button', DOMID.DOWNLOAD_BUTTON, 'Downloads'],
  ['button', DOMID.DOWNLOAD_CLOSE, 'Close'],
  ['by-id', DOMID.DOWNLOAD_MODAL],
  ['button', DOMID.DOWNLOAD_PROCESS, 'Process and download images'],
  ['by-id', DOMID.DOWNLOAD_LIST],

  // Capture handles for the change-filter functionality
  ['button', DOMID.CHANGE_BUTTON, 'Change filter'],
  ['button', DOMID.CHANGE_CLOSE, 'Close'],
  ['by-id', DOMID.CHANGE_MODAL],
  ['by-id', DOMID.MODIFIED_WARNING],
  ['button', DOMID.PACKET_IMPORT, 'Import filter packet'],
  ['by-id', DOMID.FILTER_STARTERS],
  ['by-id', DOMID.FILTER_CURRENT],
  ['by-id', DOMID.FILTER_USERS],

  // Capture handles to the minimap HTML elements
  ['input', DOMID.MINIMAP_X, '50'],
  ['input', DOMID.MINIMAP_Y, '50'],
  ['button', DOMID.MINIMAP_SHOW, 'Hide minimap'],
  ['button', DOMID.MINIMAP_CENTER, 'Bring to center'],
  ['input', DOMID.NAVIGATION_X, '50'],
  ['input', DOMID.NAVIGATION_Y, '50'],
  ['button', DOMID.NAVIGATION_CENTER, 'Bring to center'],
  ['input', DOMID.PREVIEW_SCALE, '1'],
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
} = initFormObjects(scrawl, dom, getImageDisplayViews);

initCanvasComponents(scrawl, getCurrentWrappedFilter);

initFormBuilder(scrawl, dom, getCurrentWrappedFilter, actionWrapperLibrary);

initImageDownload(scrawl, dom, getCurrentWrappedFilter);

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
