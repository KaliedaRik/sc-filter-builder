// ------------------------------------------------------------------------
// Utility functions
// ------------------------------------------------------------------------


const _random = Math.random,
  _floor = Math.floor;


// __generateUniqueString__ is a simple random String generator
// - https://gist.github.com/SimonHoiberg/ad2710c8626c5a74cddd8f6385795cc0
export const generateUniqueString = () => performance.now().toString(36) + _random().toString(36).substr(2);


// __generateUuid__ is a simple (crude) uuid generator
// - http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
const s4 = () => _floor((1 + _random()) * 0x10000).toString(16).substring(1);
export const generateUuid = () => `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
export const generateShortId = () => `${s4()}${s4()}`;


// Padded date-time string
const pad = (n) => String(n).padStart(2, '0');
export const generateFileDate = () => {

  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
};

export const PACKET_DIVIDER = '§§';
export const FILTER_IDENTIFIER = '"Filter","filter"';
export const ASSET_IDENTIFIER = '"type":"SC_IMAGE_ASSET"';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const MAX_AREA = 16_000_000;
export const MAX_DIMENSION = 4096;
  
// Mapping HTML element ids to JS element handles
export const DOMID = {

  // Capture handle to key parts of page
  SPLITTER: 'splitter',
  CONTROLS_PANEL: 'filter-controls-panel',
  BUILDER_HOLD: 'filter-builder-area-hold',
  ASSETS_HOLD: 'image-assets-hold',

  // Capture handles for the instructions modal
  INSTRUCTIONS_BUTTON: 'instructions-modal-button',
  INSTRUCTIONS_CLOSE: 'instructions-modal-close',
  INSTRUCTIONS_MODAL: 'instructions-modal',

  // Capture handles for the image-batch modal
  BATCH_BUTTON: 'image-batch-modal-button',
  BATCH_CLOSE: 'image-batch-modal-close',
  BATCH_MODAL: 'image-batch-modal',
  BATCH_REMOVE: 'image-batch-modal-remove-action',
  BATCH_LIST: 'image-batch-modal-images-list',

  // Capture handles to the image-panel-related HTML elements
  IMAGE_IMPORT: 'image-import',
  IMAGE_IMPORT_BUTTON: 'image-import-button',
  IMAGE_IMPORT_HOLD: 'image-imports-hold',
  IMAGE_DETAILS: 'image-details-panel',

  // Capture handles to the right hand panel
  FILTER_DOWNLOAD: 'download-filter-button',
  FILTER_BUTTON: 'import-filter-button',
  FILTER_IMPORT: 'import-filter',
  PREVIEW_WARNING: 'preview-warning',
  PREVIEW_WARNING_CSS: 'warning-is-active',
  PREVIEW_SELECT: 'preview-select',

  // Capture handles for the downloads modal
  DOWNLOAD_BUTTON: 'downloads-modal-button',
  DOWNLOAD_CLOSE: 'downloads-modal-close',
  DOWNLOAD_MODAL: 'downloads-modal',
  DOWNLOAD_PROCESS: 'process-and-download-action',
  DOWNLOAD_LIST: 'processed-images-list',

  // Capture handles for the change-filter functionality
  CHANGE_BUTTON: 'change-filter-modal-button',
  CHANGE_CLOSE: 'change-filter-modal-close',
  CHANGE_MODAL: 'change-filter-modal',
  MODIFIED_WARNING: 'change-filter-warning-message',
  PACKET_IMPORT: 'load-filter-action',
  FILTER_STARTERS: 'starter-filters-area',
  FILTER_CURRENT: 'current-filter-name',
  FILTER_USERS: 'user-filters-area',

  // Capture handles to the minimap HTML elements
  MINIMAP_X: 'minimap-horizontal',
  MINIMAP_Y: 'minimap-vertical',
  MINIMAP_SHOW: 'minimap-show-hide',
  MINIMAP_CENTER: 'minimap-center',
  NAVIGATION_X: 'navigation-horizontal',
  NAVIGATION_Y: 'navigation-vertical',
  NAVIGATION_CENTER: 'navigation-center',
  PREVIEW_SCALE: 'image-scale',

  // CSS classes used for control identification
  SCALE_CONTROLS_CSS: '.scale-controls',
  NAVIGATION_CONTROLS_CSS: '.navigation-controls',
  MINIMAP_CONTROLS_CSS: '.minimap-controls',
};

export const MODIFIED_FILTER_CSS = 'filter-has-been-modified';

export const FLAGS = {
  dirtyFilter: true,
  filterChanged: false,
  isBasicPreview: true,
};

export const VIEW = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  assetWidth: 1,
  assetHeight: 1,
  currentScale: 1,
};

let scrawlHandle = null;
export const setScrawlHandle = (handle) => scrawlHandle = handle;
export const getScrawlHandle = () => scrawlHandle;

let domHandle = null;
export const setDomHandle = (handle) => domHandle = handle;
export const getDomHandle = () => domHandle;

