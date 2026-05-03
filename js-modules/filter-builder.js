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
  reconciliation,
  getFilterSchema,
  filterSchemaKeys,
} from './filter-schemas.js';


let currentFilterWrapper, currentFilterTitleElement,
  currentFilterInitialValues,
  imageAssetsHold, userFiltersArea,
  scrawl, canvas, dom, filterImport,
  currentActionSelectEl, removeActionSelectEl,
  removeActionProcessEl;


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

    testFilter.actions.forEach(a => formSchemaName.push(reconciliation[a.action]));

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

const downloadFilter = () => {

  let filterName = window.prompt(
    'Rename filter',
  `${currentFilterWrapper.name}_${generateFileDate()}`
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

      currentFilterWrapper.actions.forEach(actionWrapper => {

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
  currentActionsWrapper.appendChild(currentFieldset);

  parent.appendChild(availableActionsWrapper);
  parent.appendChild(currentActionsWrapper);
};

export const buildAddActionSelect = () => {

  const wrapper = getFilterWrapper();

  console.log('buildAddActionSelect invoked', wrapper);

  const makeOption = (text, value) => {

    const opt = document.createElement('option');
    opt.textContent = text;
    opt.value = value;
    return opt;
  };

  const fragment = document.createDocumentFragment();

  fragment.append(
    makeOption('[source]', ''),
    makeOption('[source-alpha]', 'source-alpha'),
    makeOption('[none] (for process-image only)', 'none'),
  );

  const actions = wrapper.actions;

  actions.forEach(item => {

    const id = item.id,
      shortId = id.substring(0, 8),
      label = item.formSchema.label;

    fragment.append(makeOption(`${label} (${shortId})`, id));
  });

  currentActionSelectEl.replaceChildren(fragment);
};

export const actionAddActionSelect = () => {

  const wrapper = getFilterWrapper();

  console.log('actionAddActionSelect invoked', wrapper);

  // We need to do work here to insert the new action, then recalculate graph etc. 
  // - The simplest approach will be to insert the action
  // - Remember to modify lineIn/lineOut (though we may not be able to reach perfection here)
  // - We can pretend we're downloading the current adjusted filter
  // - But we don't actually download it
  // - Instead we take the generated packet and "upload" and "select" it as the current filter
  // - In this way we preserve any amendments user already made to other filter actions
  // - And we get to use existing functionality to rebuild control forms and the graph

  // Reading the currentActionSelectEl value is easy enough
  // - But how do we discover which available filter action has been selected (bunch of radiobutton inputs linked by `input.name = 'availableActions'`)

  // Always rebuild the current actions selector as the final action
  // - We don't close the modal in case user wants to add another filter action
  buildAddActionSelect();
};

export const closeAddActionSelect = () => currentActionSelectEl.replaceChildren();

export const buildRemoveActionSelect = () => {

  const wrapper = getFilterWrapper();

  console.log('buildRemoveActionSelect invoked', wrapper);

  const makeOption = (text, value) => {

    const opt = document.createElement('option');
    opt.textContent = text;
    opt.value = value;
    return opt;
  };

  const fragment = document.createDocumentFragment(),
    actions = wrapper.actions;

  // We will need a check in case the actions array is empty
  // - Can't remove an action if there's no action to remove
  // - Disable both the (empty) selector and the Process button
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

    removeActionSelectEl.setAttribute('disabled', '');
    removeActionProcessEl.setAttribute('disabled', '');
  }
};

export const actionRemoveActionSelect = () => {

  const wrapper = getFilterWrapper();

  console.log('actionRemoveActionSelect invoked', wrapper);

  // Will follow the same sequence as for actionAddActionSelect
  // - Except here we're deleting an action from the filter

  // Always rebuild the current actions selector as the final action
  // - We don't close the modal in case user wants to remove another filter action
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

  scrawl.addNativeListener('click', downloadFilter, dom[DOMID.FILTER_DOWNLOAD]);


  // Build out the permanent parts of addFilterAction modal
  buildAddFilterActionModal();

  removeActionSelectEl = dom[DOMID.REMOVE_ACTION_SELECT];
  removeActionProcessEl = dom[DOMID.REMOVE_ACTION_PROCESS];

  // Return object
  return { checkIfFilterHasChanged };
};
