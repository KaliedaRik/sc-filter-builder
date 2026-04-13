// ------------------------------------------------------------------------
// Image processing and download management
// ------------------------------------------------------------------------


// Imports
import { imageState } from './image-import.js';


// Modal level variables
let scrawlHandle = null,
  domHandles = null,
  downloadCell = null,
  downloadsList = null,
  getFilter = null;

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
const processImages = () => {

  console.log('exportSupport', exportSupport);
  console.log('exportCandidates', exportCandidates);
  console.log('exportCompressionStates', exportCompressionStates);
  console.log('imageState', imageState);

  const list = [];

  const filterWrapper = getFilter();

  console.log('filterWrapper', filterWrapper);

  while (downloadsList.firstChild) {
    downloadsList.removeChild(downloadsList.firstChild);
  }

  if (exportCandidates.length) {

    preProcess(list, filterWrapper.name);
  }
  else {

    const li = document.createElement('li');
    li.textContent = 'Please select which image formats should be included in the download';

    downloadsList.appendChild(li);
  }

  console.log('list', list);
};

const preProcess = (list, filterName) => {

  for (const [key, value] of Object.entries(imageState)) {
    
    console.log(key, value);

    const item = {};
    item.file = value.file;
    item.width = value.width;
    item.height = value.height;
    item.outputName = `${value.file.name}__${filterName}`;
    item.listings = {};

    exportCandidates.forEach(format => {

      const li = document.createElement('li');
      li.textContent = `${item.outputName}.${format}`;

      item.listings[format] = li;

      downloadsList.appendChild(li);
    });

    list.push(item);
  }
};


// Export for initialization
export const initImageDownload = (scrawl = null, dom = null, filterGetter = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initImageDownload function');
  if (!dom) throw new Error('DOM mappings not passed to initImageDownload function');
  if (!filterGetter) throw new Error('getFilterWrapper function not passed to initImageDownload function');


  // Make scrawl available to module functions
  scrawlHandle = scrawl;
  domHandles = dom;
  getFilter = filterGetter;


  // Create the working canvas
  const canvas = scrawl.findCanvas('main-canvas');

  downloadCell = canvas.buildCell({

    name: `${canvas.name}-import-cell`,
    dimensions: [1, 1],
    cleared: false,
    compiled: false,
    shown: false,
  })


  // Feature detection and modal setup
  const downloadsModal = dom['downloads-modal'];
  downloadsList = dom['processed-images-list'];

  const detectCanvasExportSupport = (type) => {

    return new Promise(resolve => {

      // No need to use Scrawl-canvas here, throwaway canvases are fine
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
  };

  initExportSupport();


  // Wire up the download button
  const downloadButton = dom['process-and-download-action'];

  scrawl.addNativeListener('click', processImages, downloadButton);


  // Return object
  return {};
};
