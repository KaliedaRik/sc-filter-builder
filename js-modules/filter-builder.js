// ------------------------------------------------------------------------
// Filter builder
// ------------------------------------------------------------------------

// Imports
import {
  generateFileDate,
  DOMID,
  PACKET_DIVIDER,
  FILTER_IDENTIFIER,
  ASSET_IDENTIFIER,
  MODIFIED_FILTER_CSS,
  FLAGS,
  getFilterWrapper,
  getScrawlHandle,
  getDomHandle,
} from './utilities.js';

import {
  starterFilters,
  filterGroups,
  filterImages,
} from './starter-filters.js';

import { wrap } from './form-objects.js';

import {
  getFormSchemaFromAction,
  getFilterSchema,
  filterSchemaKeys,
} from './filter-schemas.js';


let currentFilterWrapper, currentFilterTitleElement,
  currentFilterInitialValues,
  imageAssetsHold, userFiltersArea,
  scrawl, canvas, dom, filterImport,
  currentActionSelectEl, removeActionSelectEl,
  currentActionRenameEl, removeActionRenameEl,
  removeActionProcessEl;

const ADD_AFTER_SOURCE = 'source',
  ADD_AFTER_SOURCE_ALPHA = 'source-alpha',
  ADD_AS_UNCONNECTED_SOURCE = 'none',
  ADD_USING_PREVIOUS = 'previous-out',
  ADD_ROUTE_SEPARATOR = '::';


// Filter modification
const checkIfFilterHasChanged = () => FLAGS.filterChanged = currentFilterInitialValues !== currentFilterWrapper.toString();


// Starter filter loading
const requestStarterFilter = (e) => {

  // Find button element
  const target = e.target.closest('button[data-packet]');

  if (target && target.dataset.packet) {

    const starter = target.dataset.packet,
      data = starterFilters[starter],
      packet = data.packet;

    if (packet) load(packet, data);
  }
};

const load = (packet, data) => {

  if (packet) {

    const packets = packet.split(PACKET_DIVIDER);

    packets.forEach(p => {

      if (p.includes(FILTER_IDENTIFIER)) {

        const newFilter = canvas.actionPacket(p);

        if (newFilter) {

          const newFilterWrapper = wrap(newFilter, data.formSchemaName),
            newFilterInitialValues = newFilterWrapper.toString();

          currentFilterWrapper.kill();
          currentFilterWrapper = newFilterWrapper;
          currentFilterInitialValues = newFilterInitialValues;

          currentFilterWrapper.updateDisplayFilter();

          currentFilterTitleElement.textContent = data.readableName;

          FLAGS.filterChanged = false;

          const mainEl = document.querySelector('main');
          mainEl.classList.remove(MODIFIED_FILTER_CSS);
        }
      }
      // Do nothing for asset metadata
      else if (p.includes(ASSET_IDENTIFIER)) {}
      else canvas.actionPacket(p);
    });

    FLAGS.dirtyFilter = true;
  }
};


const importedFilters = {};
let importedFilterCounter = 0;

const importFilter = async (file) => {

  if (!file) return;

  let packet = '';

  try {

    packet = await file.text();
  }
  catch (e) {

    console.warn(`Failed to read filter file: ${file.name}`);
    return;
  }

  const packets = packet.split(PACKET_DIVIDER),
    filteredPacket = packets.filter(p => p.includes(FILTER_IDENTIFIER)),
    otherPackets = packets.filter(p => !p.includes(FILTER_IDENTIFIER));

  if (filteredPacket.length !== 1) {

    console.warn(`Packet rejected - should only include one filter definition: ${file.name}`);
    return;
  }

  otherPackets.forEach(p => {

    if (p.includes(ASSET_IDENTIFIER)) {

      try {

        const assetData = JSON.parse(p);

        const {name, dataUrl} = assetData;

        const asset = scrawl.findAsset(name);

        // Only do work to create asset if it does not already exist in the SC library
        if (asset == null) {

          const img = new Image();
          img.id = name;
          img.onload = () => scrawl.importDomImage(`#${name}`);
          img.onerror = () => console.warn(`Failed to decode image asset ${name}`);

          imageAssetsHold.appendChild(img);
          img.src = dataUrl;
        }
      }
      catch (e) {

        console.warn(`failed to parse asset packet: ${e.message}`);
      }
    }
  });

  const selectedPacket = filteredPacket[0]

  let testFilter;

  try {

    testFilter = canvas.actionPacket(selectedPacket);

    if (!testFilter || Error.isError(testFilter)) {

      console.warn(`Failed to import filter file: ${file.name}`);
      return;
    }

    const formSchemaName = [];

    const id = `imported-filter-${importedFilterCounter}`;
    importedFilterCounter++;

    const title = testFilter.name || file.name;

    testFilter.actions.forEach(a => formSchemaName.push(getFormSchemaFromAction(a)));

    importedFilters[id] = {
      id,
      title,
      readableName: title,
      formSchemaName,
      fileName: file.name,
      packet,
      imageSource: null,
    };

    testFilter.kill?.();

    addImportedFilterButton(importedFilters[id]);
  }
  catch (e) {

    console.warn(`IMPORT ERROR: ${e.message}`);
    testFilter?.kill?.();
    return;
  }
};

const addImportedFilterButton = (item) => {

  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('data-filter-id', item.id);
  button.textContent = item.title;

  userFiltersArea.appendChild(button);

  scrawl.addNativeListener('click', requestImportedFilter, button);
};

const requestImportedFilter = (e) => {

  const id = e?.currentTarget?.getAttribute('data-filter-id');

  if (!id || !importedFilters[id]) return;

  const data = importedFilters[id],
    packet = data.packet;

  load(packet, data);
};

const downloadFilter = (wrapper) => {

  let filterName = wrapper.name;

  filterName = window.prompt(
    'Rename filter',
    `${filterName}_${generateFileDate()}`
  );

  if (filterName) {

    filterName = filterName.replace(/[ <>:"/\\|?*\x00-\x1F]/g, '-').trim();

    if (filterName.length < 5) console.warn('Filter filename needs to be at least 5 characters long');
    else if (filterName.length > 80) console.warn('Filter filename is too long');
    else {

      const fileName = `${filterName}.sc-packet.txt`,
        packets = [],
        actions = [];

      let gradientCount = 0;

      wrapper.actions.forEach(actionWrapper => {

        const actionObject = actionWrapper.action,
          actionName = actionObject.action;

        switch(actionName) {

          case 'map-to-gradient' : {

            const currentGradient = scrawl.findStyles(actionWrapper.action.gradient),
              action = structuredClone(actionObject);
            
            let gradientName = `${filterName}_gradient-${gradientCount}`;

            gradientCount++;

            const tempGradient = currentGradient.clone({ name: gradientName }),
              gradientPacket = tempGradient.saveAsPacket();

            // Just in case there was a naming clash in the SC library
            gradientName = tempGradient.name;

            tempGradient.kill();
            packets.push(gradientPacket);
            action.gradient = gradientName;
            actions.push(action);

            break;
          }

          case 'process-image': {

            const action = structuredClone(actionObject);
            const imported = actionWrapper.importedImageAsset;

            if (!imported || !imported.dataUrl) {
              console.warn(`Process-image action "${actionWrapper.id}" has no embedded image data`);
              actions.push(action);
              break;
            }

            packets.push(JSON.stringify({
              type: 'SC_IMAGE_ASSET',
              version: 1,
              name: imported.name,
              originalFileName: imported.originalFileName,
              mimeType: imported.mimeType,
              dataUrl: imported.dataUrl,
            }));

            actions.push(action);
            break;
          }

          default:
            actions.push(structuredClone(actionObject));
        }
      });

      const tempFilter = scrawl.makeFilter({
        name: filterName,
        actions,
      });

      const tempFilterPacket = tempFilter.saveAsPacket();

      tempFilter.kill();

      packets.push(tempFilterPacket);

      const finalPacket = packets.join(PACKET_DIVIDER);

      const blob = new Blob([finalPacket], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.style.display = 'none';

      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  } 
};


// Filter action add and remove modals
const buildAddFilterActionModal = () => {

  const parent = dom[DOMID.ADD_ACTION_LIST];

  const availableActionsWrapper = document.createElement('div');
  availableActionsWrapper.id = 'available-actions-wrapper';

  const availableTitle = document.createElement('h3');
  availableTitle.textContent = 'Available actions';
  availableActionsWrapper.appendChild(availableTitle);

  const availableFieldset = document.createElement('fieldset');
  availableFieldset.classList.add('available-actions-fieldset');

  filterSchemaKeys.forEach((key, index) => {

    const schema = getFilterSchema(key),
      imageUrl = filterImages[key];

    const card = document.createElement('label');
    card.classList.add('filter-action-card');
    card.htmlFor = key;

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('filter-action-image');

    const imageEl = document.createElement('img');
    imageEl.alt = "";
    imageEl.src = imageUrl;

    imageWrapper.appendChild(imageEl);
    card.appendChild(imageWrapper);

    const descriptionWrapper = document.createElement('div');
    descriptionWrapper.classList.add('filter-action-description');

    const title = document.createElement('h4');
    title.textContent = schema.label;

    const description = document.createElement('p');
    description.textContent = schema.description;

    descriptionWrapper.appendChild(title);
    descriptionWrapper.appendChild(description);
    card.appendChild(descriptionWrapper);

    const radioInputWrapper = document.createElement('div');
    radioInputWrapper.classList.add('filter-action-radio');

    const input = document.createElement('input');
    input.type = 'radio';
    input.id = key;
    input.name = 'availableActions';
    input.value = key;

    radioInputWrapper.appendChild(input);
    card.appendChild(radioInputWrapper);

    availableFieldset.appendChild(card);
  });

  availableActionsWrapper.appendChild(availableFieldset);

  const currentActionsWrapper = document.createElement('div');
  currentActionsWrapper.id = 'current-actions-wrapper';

  const currentTitle = document.createElement('h3');
  currentTitle.textContent = 'Place after';
  currentActionsWrapper.appendChild(currentTitle);

  const currentFieldset = document.createElement('fieldset');

  const selectorWrapper = document.createElement('div');
  selectorWrapper.id = 'current-selector-wrapper';

  const selectLabel = document.createElement('label');
  selectLabel.textContent = 'Action';
  selectLabel.htmlFor = 'currentAction';
  selectorWrapper.appendChild(selectLabel);

  const select = document.createElement('select');
  select.id = 'currentAction';
  select.name = 'currentAction';
  select.value = '';

  currentActionSelectEl = select;
  selectorWrapper.appendChild(select);
  currentFieldset.appendChild(selectorWrapper);

  const hr = document.createElement('hr');
  currentFieldset.appendChild(hr);
 
  const renameFilterWrapper = document.createElement('div');
  renameFilterWrapper.id = 'current-rename-wrapper';

  const renameFilterLabel = document.createElement('label');
  renameFilterLabel.textContent = 'Rename to';
  renameFilterLabel.htmlFor = 'add-action-rename-filter';
  renameFilterWrapper.appendChild(renameFilterLabel);

  const renameFilter = document.createElement('input');
  renameFilter.id = 'add-action-rename-filter';
  renameFilter.type = 'text',
  renameFilter.value = '',

  currentActionRenameEl = renameFilter;
  renameFilterWrapper.appendChild(renameFilter);

  currentFieldset.appendChild(renameFilterWrapper);

  currentActionsWrapper.appendChild(currentFieldset);

  parent.appendChild(availableActionsWrapper);
  parent.appendChild(currentActionsWrapper);
};

// The addActionSelect part of the add action modal is dynamic
// - We need to list all of the current actions within it
export const buildAddActionSelect = () => {

  const wrapper = getFilterWrapper();

  const makeOption = (text, value) => {

    const opt = document.createElement('option');
    opt.textContent = text;
    opt.value = value;
    return opt;
  };

  const fragment = document.createDocumentFragment();

  fragment.append(
    makeOption('[source]', ADD_AFTER_SOURCE),
    makeOption('[source-alpha]', ADD_AFTER_SOURCE_ALPHA),
    makeOption('[none] (for process-image only)', ADD_AS_UNCONNECTED_SOURCE),
  );

  const actions = wrapper.actions;

  actions.forEach(item => {

    const id = item.id,
      shortId = id.substring(0, 8),
      label = item.formSchema.label;

    fragment.append(
      makeOption(`${label} (${shortId}) [use previous out]`, id),
      makeOption(`${label} (${shortId}) [use source]`, `${id}${ADD_ROUTE_SEPARATOR}${ADD_AFTER_SOURCE}`),
      makeOption(`${label} (${shortId}) [use source-alpha]`, `${id}${ADD_ROUTE_SEPARATOR}${ADD_AFTER_SOURCE_ALPHA}`),
    );
  });

  currentActionSelectEl.replaceChildren(fragment);

  currentActionRenameEl.value = bumpFilterVersion(currentFilterTitleElement.textContent);
};


// Handling the add action modal perform add button
const bumpFilterVersion = (name) => {

  const re = /\s*\[v(\d+)\]\s*$/;

  if (re.test(name)) return name.replace(re, (match, n) => ` [v${parseInt(n, 10) + 1}]`);

  return `From ${name} [v1]`;
};

const getActionIndex = (wrapper, id) => {

  if (!id) return 0;

  const index = wrapper.actions.findIndex(item => item.id === id);

  if (index < 0) return -1;

  return index + 1;
};

const configureInsertedActionLines = (action, request, currentActions) => {

  if (request.selectedAction === 'image') return;

  if (request.lineInMode === ADD_AFTER_SOURCE_ALPHA) {

    action.lineIn = SOURCE_ALPHA;
    return;
  }

  if (request.lineInMode === ADD_AFTER_SOURCE) {

    action.lineIn = request.index === 0 ? '' : SOURCE;
    return;
  }

  if (request.lineInMode === ADD_USING_PREVIOUS && request.index > 0) {

    const previous = currentActions[request.index - 1],
      previousOut = previous.lineOut || '';

    action.lineIn = previousOut;
    action.lineOut = previousOut;
  }
};

export const actionAddActionSelect = () => {

  const request = {
    selectedAction: null,
    insertAfterId: null,
    insertIndex: 0,
    lineInMode: null,
  };

  const selectedAction = dom[DOMID.ADD_ACTION_LIST].querySelector('input[name="availableActions"]:checked')?.value;

  if (!selectedAction) {

    console.warn('No filter action selected');
    return;
  }

  request.selectedAction = selectedAction;

  const insertAfter = currentActionSelectEl.value;

  if (insertAfter === ADD_AS_UNCONNECTED_SOURCE) {

    if (selectedAction !== 'image') {

      console.warn(`${selectedAction} cannot be inserted after [none]`);
      return;
    }
  }
  else if (selectedAction === 'image') {

    console.warn('image action can only be inserted after [none]');
    return;
  }
  else if (insertAfter === ADD_AFTER_SOURCE_ALPHA) request.lineInMode = ADD_AFTER_SOURCE_ALPHA;
  else if (insertAfter === ADD_AFTER_SOURCE) request.lineInMode = '';
  else {

    const [id, lineIn] = insertAfter.split(ADD_ROUTE_SEPARATOR);

    request.insertAfterId = id

    if (lineIn === ADD_AFTER_SOURCE_ALPHA) request.lineInMode = ADD_AFTER_SOURCE_ALPHA;
    else if (lineIn === ADD_AFTER_SOURCE) request.lineInMode = ADD_AFTER_SOURCE;
    else request.lineInMode = ADD_USING_PREVIOUS;
  }

  const idx = getActionIndex(currentFilterWrapper, request.insertAfterId);

  if (idx < 0) {

    console.warn(`Cannot find action with id ${request.insertAfterId}`);
    return;
  }
  request.index = idx;

  let newName = currentActionRenameEl.value;
  if (!newName) newName = 'Work in progress filter';

  const currentActions = structuredClone(currentFilterWrapper.filter.actions),
    currentSchemaNames = structuredClone(currentFilterWrapper.formSchemaName),
    selectedActionSchema = getFilterSchema(selectedAction),
    selectedActionObject = JSON.parse(selectedActionSchema.actionString);

  configureInsertedActionLines(selectedActionObject, request, currentActions);

  currentActions.splice(request.index, 0, selectedActionObject);
  currentSchemaNames.splice(request.index, 0, selectedAction);

  const tempFilter = scrawl.makeFilter({
    name: newName,
    actions: currentActions,
  });

  const starter = {
    title: newName,
    readableName: newName,
    formSchemaName: currentSchemaNames,
    packet: tempFilter.saveAsPacket(),
    imageSource: null,
  };

  tempFilter.kill();

  load(starter.packet, starter);

  // Always rebuild the current actions selector as the final action
  // - We don't close the modal in case user wants to add another filter action
  buildAddActionSelect();
};

export const closeAddActionSelect = () => currentActionSelectEl.replaceChildren();

export const buildRemoveActionSelect = () => {

  const wrapper = getFilterWrapper();

  const makeOption = (text, value) => {

    const opt = document.createElement('option');
    opt.textContent = text;
    opt.value = value;
    return opt;
  };

  const fragment = document.createDocumentFragment(),
    actions = wrapper.actions;

  if (actions.length) {

    removeActionSelectEl.removeAttribute('disabled');
    removeActionProcessEl.removeAttribute('disabled');

    actions.forEach(item => {

      const id = item.id,
        shortId = id.substring(0, 8),
        label = item.formSchema.label;

      fragment.append(makeOption(`${label} (${shortId})`, id));
    });

    removeActionSelectEl.replaceChildren(fragment);
  }
  else {

    removeActionSelectEl.replaceChildren();
    removeActionSelectEl.setAttribute('disabled', '');
    removeActionProcessEl.setAttribute('disabled', '');
  }

  removeActionRenameEl.value = bumpFilterVersion(currentFilterTitleElement.textContent);
};

const repairLinesAfterRemoval = (actions, removedAction, removeIndex) => {

  if (!removedAction) return;

  const removedOut = removedAction.lineOut || '';

  if (!removedOut) return;

  const previous = actions[removeIndex - 1];

  let replacement = '';

  if (previous) replacement = previous.lineOut || '';
  else if (removedAction.lineIn === SOURCE_ALPHA) replacement = SOURCE_ALPHA;
  else if (removedAction.lineIn === SOURCE) replacement = SOURCE;
  else replacement = '';

  actions.forEach((action, index) => {

    if (index < removeIndex) return;

    if (action.lineIn === removedOut) action.lineIn = replacement;
    if (action.lineMix === removedOut) action.lineMix = replacement;
  });
};

export const actionRemoveActionSelect = () => {

  const removeId = removeActionSelectEl.value;

  if (!removeId) {

    console.warn('No filter action selected for removal');
    return;
  }

  const removeIndex = currentFilterWrapper.actions.findIndex(item => item.id === removeId);

  if (removeIndex < 0) {

    console.warn(`Cannot find action with id ${removeId}`);
    return;
  }

  let newName = removeActionRenameEl.value;
  if (!newName) newName = 'Work in progress filter';

  const currentActions = structuredClone(currentFilterWrapper.filter.actions),
    currentSchemaNames = structuredClone(currentFilterWrapper.formSchemaName),
    removedAction = currentActions[removeIndex];

  currentActions.splice(removeIndex, 1);
  currentSchemaNames.splice(removeIndex, 1);

  repairLinesAfterRemoval(currentActions, removedAction, removeIndex);

  const tempFilter = scrawl.makeFilter({
    name: newName,
    actions: currentActions,
  });

  const starter = {
    title: newName,
    readableName: newName,
    formSchemaName: currentSchemaNames,
    packet: tempFilter.saveAsPacket(),
    imageSource: null,
  };

  tempFilter.kill();

  load(starter.packet, starter);

  buildRemoveActionSelect();
};

export const closeRemoveActionSelect = () => removeActionSelectEl.replaceChildren();


// Init function
export const initFilterBuilder = () => {

  scrawl = getScrawlHandle();
  dom = getDomHandle();
  canvas = scrawl.findCanvas('filter-builder-canvas');
  filterImport = dom[DOMID.FILTER_IMPORT];
  userFiltersArea = dom[DOMID.FILTER_USERS];
  imageAssetsHold = dom[DOMID.ASSETS_HOLD];


  const frag = document.createDocumentFragment(),
    starterFiltersArea = dom[DOMID.FILTER_STARTERS];

  filterGroups.forEach(grp => {

    const details = document.createElement('details'),
      summary = document.createElement('summary');

    summary.textContent = grp.title;
    details.appendChild(summary);

    const grid = document.createElement('div');
    grid.classList.add('filter-button-grid');

    grp.filters.forEach(key => {

      const obj = starterFilters[key];

      const btn = document.createElement('button');
      btn.setAttribute('data-packet', key);
      btn.type = 'button';

      const img = document.createElement('img');
      img.src = obj.imageSource;

      const label = document.createElement('p');
      label.textContent = obj.title;

      btn.appendChild(img);
      btn.appendChild(label);
      grid.appendChild(btn);

      scrawl.addNativeListener('click', requestStarterFilter, btn);
    });

    if (grp.openOnLoad) details.setAttribute('open', '');

    details.appendChild(grid);
    frag.appendChild(details);
  });

  starterFiltersArea.replaceChildren(frag);


  // We always start with the desaturate (grayscale) filter on page load
  const starter = starterFilters['SC-starter-filter_desaturate'],
    filter = canvas.actionPacket(starter.packet);

  currentFilterWrapper = wrap(filter, starter.formSchemaName);
  currentFilterInitialValues = currentFilterWrapper.toString();

  currentFilterWrapper.updateDisplayFilter();

  currentFilterTitleElement = dom[DOMID.FILTER_CURRENT];
  currentFilterTitleElement.textContent = starter.readableName;


  // Import and Download filter buttons
  scrawl.addNativeListener('change', async (e) => {

    e.preventDefault();
    e.stopPropagation();

    for (const file of filterImport.files) {

      await importFilter(file);
    }

    console.log('importedFilters', importedFilters);

  }, filterImport);

  scrawl.addNativeListener('click', () => downloadFilter(currentFilterWrapper), dom[DOMID.FILTER_DOWNLOAD]);


  // Build out the permanent parts of addFilterAction modal
  buildAddFilterActionModal();

  removeActionSelectEl = dom[DOMID.REMOVE_ACTION_SELECT];
  removeActionRenameEl = dom[DOMID.REMOVE_ACTION_RENAME];
  removeActionProcessEl = dom[DOMID.REMOVE_ACTION_PROCESS];

  // Return object
  return { checkIfFilterHasChanged };
};
