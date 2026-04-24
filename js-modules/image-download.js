// ------------------------------------------------------------------------
// Image processing and download management
// ------------------------------------------------------------------------
import {
  generateFileDate,
  DOMID,
  getFilterWrapper,
  getScrawlHandle,
  getDomHandle,
} from './utilities.js';

import { downloadZip } from '../js-libraries/client-zip.js';
import { imageState } from './image-import.js';


// Modal level variables
let scrawl, dom, canvas, downloadCell, downloadsList, downloadButton;

const exportSupport = {
  png: false,
  jpeg: false,
  webp: false,
};


// User chooses which image formats they want downloaded
const acceptableFormats = ['png', 'jpeg', 'webp'],
  exportCompressionStates = {},
  exportCandidates = [];

const updateCandidatesArray = (e) => {

  if (e && e.target) {

    const target = e.target,
      name = target.name,
      checked = target.checked;

    if (name) {

      if (!checked) {

        if (exportCandidates.includes(name)) {

          const newExportCandidates = exportCandidates.filter(item => item !== name);
          exportCandidates.length = 0;
          exportCandidates.push(...newExportCandidates);
          target.parentNode.classList.remove('selected-download-format');
        }
      }

      else if (!exportCandidates.includes(name)) {

        exportCandidates.push(name);
        target.parentNode.classList.add('selected-download-format');
      }
    }
  }
};


// Process images
let downloadInProgress = false;

const processImages = async () => {

  if (downloadInProgress) {

    console.warn('Cannot process images. Download is already in progress');
    return;
  }

  downloadInProgress = true;
  downloadButton.setAttribute('disabled', '');

  const list = [],
    zipItems = [];

  const filterWrapper = getFilterWrapper();

  while (downloadsList.firstChild) {
    downloadsList.removeChild(downloadsList.firstChild);
  }

  try {

    if (exportCandidates.length) {

      if (Object.keys(imageState).length) {

        preProcess(list, filterWrapper.name);

        await process(list, filterWrapper.filter, zipItems);

        const blob = await downloadZip(zipItems).blob(),
          filename = `SCFB-batch_${filterWrapper.name}_${generateFileDate()}.zip`,
          url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        a.remove();

        setTimeout(() => URL.revokeObjectURL(url), 0);
      }
      else {

        const li = document.createElement('li');
        li.textContent = 'Please import some image files for processing';
        downloadsList.appendChild(li);
      }
    }
    else {

      const li = document.createElement('li');
      li.textContent = 'Please select which image formats should be included in the download';
      downloadsList.appendChild(li);
    }
  }
  catch (err) {

    console.log(err.message);
  }
  finally {

    downloadButton.removeAttribute('disabled');
    downloadInProgress = false;
  }
};

const AWAITING = 'waiting-to-process',
  PROCESSING = 'being-processed',
  DONE = 'processing-done',
  FAILED = 'processing-failed';

const preProcess = (list, filterName) => {

  Object.values(imageState).forEach(value => {

    const item = {};
    item.file = value.file;
    item.width = value.width;
    item.height = value.height;
    item.outputName = `${value.file.name}__${filterName}`;
    item.listings = {};

    exportCandidates.forEach(format => {

      const li = document.createElement('li');
      li.textContent = `${item.outputName}.${format}`;
      li.classList.add('image-file-listing');
      li.classList.add(AWAITING);

      item.listings[format] = li;

      downloadsList.appendChild(li);
    });

    list.push(item);
  });
};

const process = async (list, filter, zipItems) => {

  const results = [];

  for (const item of list) {

    const result = await processImage(item, filter, zipItems);
    results.push(result);
  }

  return results;
};

const canvasToBlob = (canvas, type, quality) => new Promise(resolve => canvas.toBlob(resolve, type, quality));

const processImage = async (item, filter, zipItems) => {

  const { element, engine } = downloadCell;
  const { file, width, height, listings } = item;

  const bitmap = await createImageBitmap(file);

  try {

    element.width = width;
    element.height = height;

    engine.clearRect(0, 0, width, height);
    engine.drawImage(bitmap, 0, 0, width, height);

    const imageData = engine.getImageData(0, 0, width, height);

    const modifiedImageData = scrawl.filterEngine.action({
      filters: [filter],
      image: imageData,
    });

    engine.putImageData(modifiedImageData, 0, 0);

    for (const format of exportCandidates) {

      listings[format].classList.remove(AWAITING);
      listings[format].classList.add(PROCESSING);

      const type = `image/${format}`;

      const compressionValue = exportCompressionStates[format]
        ? parseInt(exportCompressionStates[format].value, 10)
        : 100;

      const quality = compressionValue / 100;

      const blob = await canvasToBlob(element, type, quality);

      if (!blob) {

        listings[format].classList.remove(PROCESSING);
        listings[format].classList.add(FAILED);
        console.warn(`Failed to create blob for ${file.name} (${format})`);
      }
      else {

        listings[format].classList.remove(PROCESSING);
        listings[format].classList.add(DONE);
        
        const packet = {
          name: `${item.outputName}.${format}`,
          lastModified: new Date(),
          input: blob,
        };

        zipItems.push(packet);
      }
    }
    return true;
  }
  catch (e) {

    console.warn(e.message);
    return false;
  }
  finally {

    bitmap.close?.();
  }
};


// Export for initialization
export const initImageDownload = () => {

  scrawl = getScrawlHandle();
  dom = getDomHandle();
  canvas = scrawl.findCanvas('main-canvas');

  downloadCell = canvas.buildCell({
    name: `${canvas.name}-import-cell`,
    dimensions: [1, 1],
    cleared: false,
    compiled: false,
    shown: false,
  })


  // Feature detection and modal setup
  const downloadsModal = dom[DOMID.DOWNLOAD_MODAL];
  downloadsList = dom[DOMID.DOWNLOAD_LIST];
  downloadButton = dom[DOMID.DOWNLOAD_PROCESS];

  downloadButton.setAttribute('disabled', '');
  
  const detectCanvasExportSupport = (type) => {

    return new Promise(resolve => {

      const { element, engine } = downloadCell;

      if (!engine || typeof element.toBlob !== 'function') {

        resolve(false);
        return;
      }

      engine.fillStyle = '#000';
      engine.fillRect(0, 0, 1, 1);

      element.toBlob((blob) => {

        resolve(!!blob && blob.type === type);

      }, type);
    });
  };

  const initExportSupport = async () => {

    exportSupport.png = await detectCanvasExportSupport('image/png');
    exportSupport.jpeg = await detectCanvasExportSupport('image/jpeg');
    exportSupport.webp = await detectCanvasExportSupport('image/webp');

    acceptableFormats.forEach(type => {

      if (!exportSupport[type]) {

        const typeWrapper = downloadsModal.querySelector(`#image-formats-${type}`);
        typeWrapper.remove();
      }
      else {

        exportCompressionStates[type] = downloadsModal.querySelector(`#image-format-compression-${type}`);
      }
    });

    scrawl.addNativeListener('change', updateCandidatesArray, '.image-format-checkbox-input');

    downloadButton.removeAttribute('disabled');
  };

  initExportSupport();


  // Wire up the download button
  scrawl.addNativeListener('click', processImages, downloadButton);


  // Return object
  return {};
};
