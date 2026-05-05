// ------------------------------------------------------------------------
// Scrawl-canvas boilerplate
// ------------------------------------------------------------------------
import {
  DOMID,
  FLAGS,
  MODIFIED_FILTER_CSS,
  getFilterWrapper,
  setScrawlHandle,
  setDomHandle,
} from './js-modules/utilities.js';

import * as scrawl from './js-libraries/scrawl.js';

setScrawlHandle(scrawl);

const mainCanvas = scrawl.findCanvas('main-canvas');
const builderStack = scrawl.findStack('filter-builder-stack');
const builderCanvas = scrawl.findCanvas('filter-builder-canvas');


// ------------------------------------------------------------------------
// Module imports
// ------------------------------------------------------------------------
import { initDomLayout } from './js-modules/dom-layout-ui.js';
import { initModalManagement } from './js-modules/modal-management.js';
import { initGraphManager } from './js-modules/graph-manager.js';
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
  ['by-id', DOMID.ASSETS_HOLD],

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
  ['by-id', DOMID.PREVIEW_SCALED_WARNING],
  ['select', DOMID.PREVIEW_SELECT, 0],
  ['by-id', DOMID.PROCESSING_LABEL],

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

  // Capture handles for the add action modal
  ['button', DOMID.ADD_ACTION_BUTTON, 'Add action'],
  ['button', DOMID.ADD_ACTION_CLOSE, 'Close'],
  ['by-id', DOMID.ADD_ACTION_MODAL],
  ['button', DOMID.ADD_ACTION_PROCESS, 'Process request'],
  ['by-id', DOMID.ADD_ACTION_RENAME],
  ['by-id', DOMID.ADD_ACTION_LIST],

  // Capture handles for the remove action modal
  ['button', DOMID.REMOVE_ACTION_BUTTON, 'Remove action'],
  ['button', DOMID.REMOVE_ACTION_CLOSE, 'Close'],
  ['by-id', DOMID.REMOVE_ACTION_MODAL],
  ['button', DOMID.REMOVE_ACTION_PROCESS, 'Process request'],
  ['by-id', DOMID.REMOVE_ACTION_LIST],
  ['by-id', DOMID.REMOVE_ACTION_SELECT],

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

setDomHandle(dom);


// ------------------------------------------------------------------------
// Start the page running
// ------------------------------------------------------------------------
initDomLayout();
initModalManagement();
initImageImport();

const { displayDefaultScreen, checkLiveView } = initImageDisplay();
const { actionWrapperLibrary } = initFormObjects();

initGraphManager();
initCanvasComponents();
initFormBuilder(actionWrapperLibrary);
initImageDownload();

const { checkIfFilterHasChanged } = initFilterBuilder();


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

const mainEl = document.querySelector('main');

const commence = () => {

  checkLiveView();
  checkIfFilterHasChanged();

  const list = mainEl.classList;
  const { filterChanged, dirtyFilter } = FLAGS;

  if (filterChanged && !list.contains(MODIFIED_FILTER_CSS)) list.add(MODIFIED_FILTER_CSS);
  if (!filterChanged && list.contains(MODIFIED_FILTER_CSS)) list.remove(MODIFIED_FILTER_CSS);

  if (dirtyFilter) {

    FLAGS.dirtyFilter = false;

    const filter = getFilterWrapper();
    filter.updateDisplayFilter();
  }
};

scrawl.makeRender({

  name: 'main-canvas-render',
  target: mainCanvas,
  commence,
});


// ------------------------------------------------------------------------
// Development 
// ------------------------------------------------------------------------
console.log(scrawl.library);
