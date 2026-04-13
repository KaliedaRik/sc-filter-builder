// ------------------------------------------------------------------------
// Modal management
// ------------------------------------------------------------------------


// Imports
import {
  buildImageModalList,
  actionImageModalList,
  closeImageModalList,
} from './image-import.js';

// General 
let currentModal;

const openModal = (modal, fn = null) => {

  if (currentModal) closeModal();

  if (fn) fn();

  // Needs to be in a timeout because the keypress itself will launch a modal close event
  setTimeout(() => {

    if (!currentModal) {

      modal.showModal();
      currentModal = modal;
    }
  }, 100);
};

const closeModal = (fn = null) => {

  const m = currentModal;
  currentModal = null;

  if (m) m.close();

  if (fn && typeof fn === 'function') fn();
};


// Export for initialization 
export const initModalManagement = (scrawl = null, dom = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initModalManagement function');
  if (!dom) throw new Error('DOM mappings not passed to initModalManagement function');

  // Setup: instructions modal
  const instructionsModal = dom['instructions-modal'],
    instructionsButton = dom['instructions-modal-button'],
    instructionsCloseButton = dom['instructions-modal-close'];

  scrawl.addNativeListener('click', () => openModal(instructionsModal), instructionsButton);
  scrawl.addNativeListener('click', closeModal, instructionsCloseButton);
  scrawl.addNativeListener('close', closeModal, instructionsModal);

  // Setup: image-batch modal
  const imageBatchModal = dom['image-batch-modal'],
    imageBatchButton = dom['image-batch-modal-button'],
    imageBatchCloseButton = dom['image-batch-modal-close'],
    imageBatchModalRemoveAction = dom['image-batch-modal-remove-action'];

  scrawl.addNativeListener('click', () => openModal(imageBatchModal, buildImageModalList), imageBatchButton);
  scrawl.addNativeListener('click', () => closeModal(closeImageModalList), imageBatchCloseButton);
  scrawl.addNativeListener('close', () => closeModal(closeImageModalList), imageBatchModal);
  scrawl.addNativeListener('click', actionImageModalList, imageBatchModalRemoveAction);

  // Setup: downloads modal
  const downloadsModal = dom['downloads-modal'],
    downloadsButton = dom['downloads-modal-button'],
    downloadsCloseButton = dom['downloads-modal-close'],
    downloadsList = dom['processed-images-list'];

  const closeDownloadsModal = () => {
    while (downloadsList.firstChild) {
      downloadsList.removeChild(downloadsList.firstChild);
    }
  };

  scrawl.addNativeListener('click', () => openModal(downloadsModal), downloadsButton);
  scrawl.addNativeListener('click', () => closeModal(closeDownloadsModal), downloadsCloseButton);
  scrawl.addNativeListener('close', () => closeModal(closeDownloadsModal), downloadsModal);

  // Setup: changeFilters modal
  const changeFiltersModal = dom['change-filter-modal'],
    changeFiltersButton = dom['change-filter-modal-button'],
    changeFiltersCloseButton = dom['change-filter-modal-close'];

  scrawl.addNativeListener('click', () => openModal(changeFiltersModal), changeFiltersButton);
  scrawl.addNativeListener('click', closeModal, changeFiltersCloseButton);
  scrawl.addNativeListener('close', closeModal, changeFiltersModal);

  return {};
};
