// ------------------------------------------------------------------------
// Filter builder
// ------------------------------------------------------------------------

// Imports
import { starterFilters, filterGroups } from './starter-filters.js';
import { wrap } from './form-objects.js';
import { reconciliation } from './filter-schemas.js';
import { generateFileDate, PACKET_DIVIDER, FILTER_IDENTIFIER } from './utilities.js';

let currentFilterWrapper = null,
  currentFilterInitialValues = null,
  currentFilterTitleElement = null,
  userFiltersArea = null,
  scrawlHandle = null,
  canvasHandle = null;

const mainEl = document.querySelector('main'),
  filterHasChangedClass = 'filter-has-been-modified';


// Filter modification
let filterHasChanged = false;

const checkIfFilterHasChanged = () => {

  if (currentFilterInitialValues !== currentFilterWrapper.toString()) {

    mainEl.classList.add(filterHasChangedClass);
    filterHasChanged = true;
  }
  else {

    mainEl.classList.remove(filterHasChangedClass);
    filterHasChanged = false;
  }

};


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

        const newFilter = canvasHandle.actionPacket(p);

        if (newFilter) {

          const newFilterWrapper = wrap(newFilter, data.formSchemaName),
            newFilterInitialValues = newFilterWrapper.toString();

          currentFilterWrapper.kill();
          currentFilterWrapper = newFilterWrapper;
          currentFilterInitialValues = newFilterInitialValues;

          currentFilterWrapper.updateDisplayFilter();

          currentFilterTitleElement.textContent = data.readableName;

          filterHasChanged = false;
          mainEl.classList.remove(filterHasChangedClass);
        }
      }
      else canvasHandle.actionPacket(p);
    });
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
    filteredPacket = packets.filter(p => p.includes(FILTER_IDENTIFIER));

  if (filteredPacket.length !== 1) {

    console.warn(`Packet rejected - should only include one filter definition: ${file.name}`);
    return;
  }

  const selectedPacket = filteredPacket[0]

  let testFilter;

  try {

    testFilter = canvasHandle.actionPacket(selectedPacket);

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

  scrawlHandle.addNativeListener('click', requestImportedFilter, button);
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

            const currentGradient = scrawlHandle.findStyles(actionWrapper.action.gradient),
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

          default:
            actions.push(structuredClone(actionObject));
        }
      });

      const tempFilter = scrawlHandle.makeFilter({
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


// Init function
export const initFilterBuilder = (scrawl = null, dom = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initFilterBuilder function');
  if (!dom) throw new Error('DOM mappings not passed to initFilterBuilder function');


  const canvas = scrawl.findCanvas('filter-builder-canvas');

  const filterImport = dom['import-filter'];


  canvasHandle = canvas;
  scrawlHandle = scrawl;
  userFiltersArea = dom['user-filters-area'];


  const frag = new DocumentFragment(),
    starterFiltersArea = dom['starter-filters-area'];

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

  currentFilterTitleElement = dom['current-filter-name'];
  currentFilterTitleElement.textContent = starter.readableName;


  // Import and Download filter buttons
  scrawl.addNativeListener('change', async (e) => {

    e.preventDefault();

    for (const file of filterImport.files) {

      await importFilter(file);
    }

    console.log('importedFilters', importedFilters);

  }, filterImport);

  scrawl.addNativeListener('click', downloadFilter, dom['download-filter-button']);


  // Return object
  return {
    checkIfFilterHasChanged,
  };
};
