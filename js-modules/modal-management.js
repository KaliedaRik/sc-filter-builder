// ------------------------------------------------------------------------
// Modal management
// ------------------------------------------------------------------------
import { DOMID, getScrawlHandle, getDomHandle } from './utilities.js';

import {
  buildImageModalList,
  actionImageModalList,
  closeImageModalList,
} from './image-import.js';

import {
  buildAddActionSelect,
  actionAddActionSelect,
  closeAddActionSelect,
  buildRemoveActionSelect,
  actionRemoveActionSelect,
  closeRemoveActionSelect,
} from './filter-builder.js';


let currentModal, scrawl, dom;


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
export const initModalManagement = () => {

  scrawl = getScrawlHandle();
  dom = getDomHandle();


  // Setup: instructions modal
  const instructionsModal = dom[DOMID.INSTRUCTIONS_MODAL],
    instructionsButton = dom[DOMID.INSTRUCTIONS_BUTTON],
    instructionsCloseButton = dom[DOMID.INSTRUCTIONS_CLOSE];

  scrawl.addNativeListener('click', () => openModal(instructionsModal), instructionsButton);
  scrawl.addNativeListener('click', closeModal, instructionsCloseButton);
  scrawl.addNativeListener('close', closeModal, instructionsModal);

  // Setup: image-batch modal
  const imageBatchModal = dom[DOMID.BATCH_MODAL],
    imageBatchButton = dom[DOMID.BATCH_BUTTON],
    imageBatchCloseButton = dom[DOMID.BATCH_CLOSE],
    imageBatchModalRemoveAction = dom[DOMID.BATCH_REMOVE];

  scrawl.addNativeListener('click', () => openModal(imageBatchModal, buildImageModalList), imageBatchButton);
  scrawl.addNativeListener('click', () => closeModal(closeImageModalList), imageBatchCloseButton);
  scrawl.addNativeListener('close', () => closeModal(closeImageModalList), imageBatchModal);
  scrawl.addNativeListener('click', actionImageModalList, imageBatchModalRemoveAction);

  // Setup: downloads modal
  const downloadsModal = dom[DOMID.DOWNLOAD_MODAL],
    downloadsButton = dom[DOMID.DOWNLOAD_BUTTON],
    downloadsCloseButton = dom[DOMID.DOWNLOAD_CLOSE],
    downloadsList = dom[DOMID.DOWNLOAD_LIST];

  const closeDownloadsModal = () => {
    while (downloadsList.firstChild) {
      downloadsList.removeChild(downloadsList.firstChild);
    }
  };

  scrawl.addNativeListener('click', () => openModal(downloadsModal), downloadsButton);
  scrawl.addNativeListener('click', () => closeModal(closeDownloadsModal), downloadsCloseButton);
  scrawl.addNativeListener('close', () => closeModal(closeDownloadsModal), downloadsModal);

  // Setup: changeFilters modal
  const changeFiltersModal = dom[DOMID.CHANGE_MODAL],
    changeFiltersButton = dom[DOMID.CHANGE_BUTTON],
    changeFiltersCloseButton = dom[DOMID.CHANGE_CLOSE];

  scrawl.addNativeListener('click', () => openModal(changeFiltersModal), changeFiltersButton);
  scrawl.addNativeListener('click', closeModal, changeFiltersCloseButton);
  scrawl.addNativeListener('close', closeModal, changeFiltersModal);

  // Setup: addAction modal
  const addActionModal = dom[DOMID.ADD_ACTION_MODAL],
    addActionButton = dom[DOMID.ADD_ACTION_BUTTON],
    addActionCloseButton = dom[DOMID.ADD_ACTION_CLOSE],
    addActionProcess = dom[DOMID.ADD_ACTION_PROCESS];

  scrawl.addNativeListener('click', () => openModal(addActionModal, buildAddActionSelect), addActionButton);
  scrawl.addNativeListener('click', () => closeModal(closeAddActionSelect), addActionCloseButton);
  scrawl.addNativeListener('close', () => closeModal(closeAddActionSelect), addActionModal);
  scrawl.addNativeListener('click', actionAddActionSelect, addActionProcess);

  // Setup: removeAction modal
  const removeActionModal = dom[DOMID.REMOVE_ACTION_MODAL],
    removeActionButton = dom[DOMID.REMOVE_ACTION_BUTTON],
    removeActionCloseButton = dom[DOMID.REMOVE_ACTION_CLOSE],
    removeActionProcess = dom[DOMID.REMOVE_ACTION_PROCESS];

  scrawl.addNativeListener('click', () => openModal(removeActionModal, buildRemoveActionSelect), removeActionButton);
  scrawl.addNativeListener('click', () => closeModal(closeRemoveActionSelect), removeActionCloseButton);
  scrawl.addNativeListener('close', () => closeModal(closeRemoveActionSelect), removeActionModal);
  scrawl.addNativeListener('click', actionRemoveActionSelect, removeActionProcess);

  return {};
};
