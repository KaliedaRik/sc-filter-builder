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

  if (fn) fn();
};


// Export for initialization 
export const initModalManagement = (scrawl = null, dom = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initImageImport function');
  if (!dom) throw new Error('DOM mappings not passed to initImageImport function');

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

  return {};
};
