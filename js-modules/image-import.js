// ------------------------------------------------------------------------
// Image import management
// ------------------------------------------------------------------------
import {
  DOMID,
  ACCEPTED_IMAGE_TYPES,
  MAX_AREA,
  MAX_DIMENSION,
  getScrawlHandle,
  getDomHandle,
} from './utilities.js';

import { 
  prepareImageForDisplay,
  getDisplayedImageId,
  displayDefaultScreen,
} from './image-display.js';


// General
let counter = 0,
  scrawl, dom, canvas,
  importCell = null,
  imageImportsHold = null;


// Key information: the thumbnail dimensions - 80px square - get set in CSS. If we change those CSS values, they need to change in this file too
const THUMBNAIL_DIMENSIONS = 80;


export const imageState = {};


const ingester = [];
let ingesterIsRunning = false;

// We ingest using a single reusable canvas Cell.
// + This means we have to minimise asynch dangers
const ingest = () => {

  if (!ingester.length) {

    ingesterIsRunning = false;

    if (!getDisplayedImageId()) {

      displayDefaultScreen(Object.keys(imageState).length > 0);

      const panel = dom[DOMID.IMAGE_DETAILS];
      panel.setAttribute('open', '');
    }
    return;
  }

  const [stateId, bitmap] = ingester.shift();

  importCell.clear();
  importCell.engine.drawImage(bitmap, 0, 0, THUMBNAIL_DIMENSIONS, THUMBNAIL_DIMENSIONS);

  importCell.element.toBlob(blob => {

    if (!blob) {

      ingest();
      return;
    }

    const thumbnailUrl = URL.createObjectURL(blob),
      thumbnailImg = new Image(THUMBNAIL_DIMENSIONS, THUMBNAIL_DIMENSIONS);

    thumbnailImg.onload = () => {

      const btn = document.createElement('button');
      btn.setAttribute('data-target', stateId);

      imageState[stateId].clickListener = scrawl.addNativeListener('click', () => {

        const oldStateId = getDisplayedImageId();
        prepareImageForDisplay(stateId, imageState[stateId], imageState[oldStateId])

      }, btn);

      // Capture handle to button and URL
      imageState[stateId].thumbnailUrl = thumbnailUrl;
      imageState[stateId].thumbnailButton = btn;

      btn.appendChild(thumbnailImg);
      imageImportsHold.appendChild(btn);

      ingest();
    };
    thumbnailImg.src = thumbnailUrl;
  });
};

const triggerIngest = () => {

  if (!ingesterIsRunning && ingester.length) {

    ingesterIsRunning = true;
    ingest();
  }
};

const importImageFile = (file) => {

  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    console.warn(`Failed to import file ${file.name} as its type is not supported by this tool`);
    return;
  }

  const sizingImg = new Image();
  const sizingUrl = URL.createObjectURL(file);

  sizingImg.onload = () => {

    URL.revokeObjectURL(sizingUrl);

    const { naturalWidth: w, naturalHeight: h } = sizingImg;

    if (w <= MAX_DIMENSION && h <= MAX_DIMENSION && (w * h) <= MAX_AREA) {

      const stateId = `import-${counter}`;
      counter++;

      imageState[stateId] = {
        id: stateId,
        file,
        width: w,
        height: h,
      };

      createImageBitmap(file, {
        resizeWidth: THUMBNAIL_DIMENSIONS,
        resizeHeight: THUMBNAIL_DIMENSIONS,
        resizeQuality: 'high',
      })
      .then(bitmap => {

        ingester.push([stateId, bitmap]);
      
        triggerIngest();
      })
      .catch(err => console.warn(err.message));
    }
    else console.warn(`Failed to import file ${file.name} as it is too large for this tool to process`);

    sizingImg.onload = null;
    sizingImg.onerror = null;
  };

  sizingImg.onerror = () => {

    URL.revokeObjectURL(sizingUrl);
    console.warn(`Failed to import file ${file.name} because the browser could not decode it`);

    sizingImg.onload = null;
    sizingImg.onerror = null;
  };

  sizingImg.src = sizingUrl;
};


// Image modal management
const imageRemovalCandidates = [];

const updateCandidatesArray = (e) => {

  if (e && e.target) {

    const target = e.target,
      name = target.name;

    if (name) {

      if (imageRemovalCandidates.includes(name)) {

        const newRemovalCandidates = imageRemovalCandidates.filter(item => item !== name);
        imageRemovalCandidates.length = 0;
        imageRemovalCandidates.push(...newRemovalCandidates);
        target.parentNode.classList.remove('removal-candidate');
      }
      else {

        imageRemovalCandidates.push(name);
        target.parentNode.classList.add('removal-candidate');
      }
    }
  }
};

let checkboxListeners = null;

// Exports for image modal management
export const buildImageModalList = () => {

  imageRemovalCandidates.length = 0;

  const target = dom[DOMID.BATCH_LIST];
  const currentImages = Object.keys(imageState);
  const root = new DocumentFragment();

  currentImages.forEach(imageId => {

    const data = imageState[imageId];

    const checkbox = document.createElement('input');
    checkbox.classList.add('removal-checkbox');
    checkbox.type = 'checkbox';
    checkbox.name = imageId;

    const fileName = document.createElement('div');
    fileName.classList.add('removal-filename');
    fileName.textContent = data.file.name;

    const img = new Image(THUMBNAIL_DIMENSIONS, THUMBNAIL_DIMENSIONS);
    img.src = data.thumbnailUrl;
    img.classList.add('removal-thumbnail');

    const row = document.createElement('div');
    row.classList.add('removal-row');

    row.append(img, fileName, checkbox)
    root.append(row);
  });

  target.replaceChildren(root);

  // DOM manipulation requires time to settle
  setTimeout(() => {

    checkboxListeners = scrawl.addNativeListener(
      'click',
      (e) => updateCandidatesArray(e),
      '.removal-checkbox',
    );
  }, 200);
};

export const actionImageModalList = () => {

  imageRemovalCandidates.forEach(img => {

    const data = imageState[img];

    // Remove button from images panel
    data.clickListener();
    data.thumbnailButton.remove();

    // Clean up URL
    URL.revokeObjectURL(data.thumbnailUrl);

    // Cleanup state
    delete imageState[img];
  });

  // Close the modal
  const modal = dom[DOMID.BATCH_MODAL];
  modal.close();

  if (imageRemovalCandidates.includes(getDisplayedImageId())) {

    displayDefaultScreen(!!Object.keys(imageState).length);

    // display the image panel, if closed
    const panel = dom[DOMID.IMAGE_DETAILS];
    panel.setAttribute('open', '');
  }

  imageRemovalCandidates.length = 0;
};

export const closeImageModalList = () => {

  if (checkboxListeners) {

    checkboxListeners();
    checkboxListeners = null;
  }

  const target = dom[DOMID.BATCH_LIST];

  target.replaceChildren();
};


// Export for initialization
export const initImageImport = () => {

  scrawl = getScrawlHandle();
  dom = getDomHandle();
  canvas = scrawl.findCanvas('main-canvas');


  // Capture DOM elements
  const imageImportButton = dom[DOMID.IMAGE_IMPORT_BUTTON],
    imageImport = dom[DOMID.IMAGE_IMPORT];

  imageImportsHold = dom[DOMID.IMAGE_IMPORT_HOLD];


  // Accessibility
  scrawl.addNativeListener('focus', () => imageImportButton.classList.add('is-focussed'), imageImport);
  scrawl.addNativeListener('blur', () => imageImportButton.classList.remove('is-focussed'), imageImport);


  // UX: import images into the tool using mouse drag-and-drop functionality
  // - Handles multiple dragged files; the last file processed is the one that becomes active
  scrawl.addNativeListener(['dragenter', 'dragover', 'dragleave'], (e) => {

    e.preventDefault();
    e.stopPropagation();

  }, document.body);

  scrawl.addNativeListener('drop', (e) => {

    e.preventDefault();
    e.stopPropagation();

    const dt = e.dataTransfer;

    if (dt) [...dt.files].forEach(importImageFile);

  }, document.body);


  // UX: Load background images into the canvas using the browser's file selector
  // - Handles multiple selected files; the last file processed is the one that becomes active
  scrawl.addNativeListener('change', (e) => {

    e.preventDefault();
    e.stopPropagation();

    [...imageImport.files].forEach(importImageFile);

  }, imageImport);

  importCell = canvas.buildCell({

    name: `${canvas.name}-import-cell`,
    dimensions: [THUMBNAIL_DIMENSIONS, THUMBNAIL_DIMENSIONS],
    cleared: false,
    compiled: false,
    shown: false,
  });

  return {};
};
