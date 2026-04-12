// ------------------------------------------------------------------------
// Image import management
// ------------------------------------------------------------------------


// Imports
import { 
  prepareImageForDisplay,
  getDisplayedImageId,
  displayDefaultScreen,
} from './image-display.js';


// General
let counter = 0;

const imageState = {};

let importCell = null,
  imageImportsHold = null,
  scrawlHandle = null,
  domHandles = null;

// Key information: the thumbnail dimensions - 80px square - get set in CSS. If we change those CSS values, they need to change in this file too
const thumbnailDimensions = 80;

const ingester = [];
let ingesterIsRunning = false;

// We ingest using a single reusable canvas Cell.
// + This means we have to minimise asynch dangers
const ingest = () => {

  if (!ingester.length) {

    ingesterIsRunning = false;

    if (!getDisplayedImageId()) {

      displayDefaultScreen(Object.keys(imageState).length > 0);

      const panel = domHandles['image-details-panel'];
      panel.setAttribute('open', '');
    }
    return;
  }

  const [stateId, bitmap] = ingester.shift();

  importCell.clear();
  importCell.engine.drawImage(bitmap, 0, 0, thumbnailDimensions, thumbnailDimensions);

  importCell.element.toBlob(blob => {

    if (!blob) {

      ingest();
      return;
    }

    const thumbnailUrl = URL.createObjectURL(blob),
      thumbnailImg = new Image(thumbnailDimensions, thumbnailDimensions);

    thumbnailImg.onload = () => {

      const btn = document.createElement('button');
      btn.setAttribute('data-target', stateId);

      imageState[stateId].clickListener = scrawlHandle.addNativeListener('click', () => {

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

  if (!file.type.startsWith('image/')) return;

  const stateId = `import-${counter}`;
  counter++;

  imageState[stateId] = {
    id: stateId,
    // `file.name` and `file.type` values are defined in the file object
    file: file,
  }

  // Get the image's dimensions via a temporary <img> element
  const sizingImg = new Image();
  const sizingUrl = URL.createObjectURL(file);

  sizingImg.onload = () => {

    URL.revokeObjectURL(sizingUrl);

    const { naturalWidth: w, naturalHeight: h } = sizingImg;

    imageState[stateId].width = w;
    imageState[stateId].height = h;

    createImageBitmap(file, {
        resizeWidth: thumbnailDimensions,
        resizeHeight: thumbnailDimensions,
        resizeQuality: 'high',
    })
    .then(bitmap => {

      ingester.push([stateId, bitmap]);
      triggerIngest();
    })
    .catch(err => console.log(err.message));
  }

  // Start the import process
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

        const newRmovalCandidates = imageRemovalCandidates.filter(item => item !== name);
        imageRemovalCandidates.length = 0;
        imageRemovalCandidates.push(...newRmovalCandidates);
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

  const target = domHandles['image-batch-modal-images-list'];
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

    const img = new Image(thumbnailDimensions, thumbnailDimensions);
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

    checkboxListeners = scrawlHandle.addNativeListener(
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
  const modal = domHandles['image-batch-modal'];
  modal.close();

  if (imageRemovalCandidates.includes(getDisplayedImageId())) {

    displayDefaultScreen(!!Object.keys(imageState).length);

    // display the image panel, if closed
    const panel = domHandles['image-details-panel'];
    panel.setAttribute('open', '');
  }

  imageRemovalCandidates.length = 0;
};

export const closeImageModalList = () => {

  if (checkboxListeners) {

    checkboxListeners();
    checkboxListeners = null;
  }

  const target = domHandles['image-batch-modal-images-list'];

  target.replaceChildren();
};


// Export for initialization
export const initImageImport = (scrawl = null, dom = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initImageImport function');
  if (!dom) throw new Error('DOM mappings not passed to initImageImport function');

  const canvas = scrawl.findCanvas('main-canvas');

  // Make scrawl available to module functions
  scrawlHandle = scrawl;
  domHandles = dom;

  // Capture DOM elements
  const imageImportButton = dom['image-import-button'],
    imageImport = dom['image-import'];

  imageImportsHold = dom['image-imports-hold'];


  // Accessibility
  scrawl.addNativeListener('focus', () => imageImportButton.classList.add('is-focussed'), imageImport);
  scrawl.addNativeListener('blur', () => imageImportButton.classList.remove('is-focussed'), imageImport);


  // UX: import images into the tool using mouse drag-and-drop functionality
  // - Handles multiple dragged files; the last file processed is the one that becomes active
  scrawl.addNativeListener(['dragenter', 'dragover', 'dragleave'], (e) => {

    e.preventDefault();
    e.stopPropagation();

  }, canvas.domElement);

  scrawl.addNativeListener('drop', (e) => {

    e.preventDefault();
    e.stopPropagation();

    const dt = e.dataTransfer;

    if (dt) [...dt.files].forEach(importImageFile);

  }, canvas.domElement);


  // UX: Load background images into the canvas using the browser's file selector
  // - Handles multiple selected files; the last file processed is the one that becomes active
  scrawl.addNativeListener('change', (e) => {

    e.preventDefault();
    e.stopPropagation();

    [...imageImport.files].forEach(importImageFile);

  }, imageImport);

  importCell = canvas.buildCell({

    name: `${canvas.name}-import-cell`,
    dimensions: [thumbnailDimensions, thumbnailDimensions],
    cleared: false,
    compiled: false,
    shown: false,
  });

  return {};
};
