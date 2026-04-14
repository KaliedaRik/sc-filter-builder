// ------------------------------------------------------------------------
// Filter builder
// ------------------------------------------------------------------------

// Imports
import { starterFilters, filterGroups } from './starter-filters.js';
import { wrap } from './form-objects.js';
import { generateFileDate } from './utilities.js';

let currentFilterWrapper = null,
  currentFilterInitialValues = null,
  currentFilterTitleElement = null,
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

  if (target && target.dataset.packet) loadStarterFilter(target.dataset.packet);
};

const loadStarterFilter = (starter) => {

  const data = starterFilters[starter],
    packet = data.packet;

  if (packet) {

    const packets = packet.split('§§');

    packets.forEach(p => {

      if (p.includes('"Filter","filter"')) {

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

const importFilter = () => {

  console.log('importFilter invoked');
};

const downloadFilter = () => {

  console.log('downloadFilter invoked');
};


// Init function
export const initFilterBuilder = (scrawl = null, dom = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initFilterBuilder function');
  if (!dom) throw new Error('DOM mappings not passed to initFilterBuilder function');


  const canvas = scrawl.findCanvas('filter-builder-canvas');

  canvasHandle = canvas;

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
  scrawl.addNativeListener('click', importFilter, dom['import-filter-button']);
  scrawl.addNativeListener('click', downloadFilter, dom['download-filter-button']);


  // Return object
  return {
    checkIfFilterHasChanged,
  };
};
