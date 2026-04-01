// ------------------------------------------------------------------------
// Filter builder
// ------------------------------------------------------------------------

// Imports
import { starterFilters } from './starter-filters.js';
import { wrap } from './form-builder.js';

let currentFilterWrapper = null,
  currentFilterInitialValues = null,
  currentFilterTitleElement = null,
  canvasHandle = null;

const requestStarterFilter = (e) => {

  // Perform a pre-check
  // - If user has modified the current filter, give them an opportunity to save/download
  if (currentFilterInitialValues !== currentFilterWrapper.toString()) {

    console.log('Old filter has been modified. Give user a chance to save/download it');
  }

  // Find button element
  const target = e.target.closest('button[data-packet]');

  if (target && target.dataset.packet) loadStarterFilter(target.dataset.packet);
};

const loadStarterFilter = (starter) => {

  const data = starterFilters[starter],
    packet = data.packet;

  if (packet) {

    const newFilter = canvasHandle.actionPacket(packet),
      newFilterWrapper = wrap(newFilter, data.formSchemaName),
      newFilterInitialValues = newFilterWrapper.toString();

    if (currentFilterInitialValues !== newFilterInitialValues) {

      currentFilterWrapper.kill();
      currentFilterWrapper = newFilterWrapper;
      currentFilterInitialValues = newFilterInitialValues;

      currentFilterWrapper.updateDisplayFilter();

      currentFilterTitleElement.textContent = data.readableName;
    }
    else newFilter.kill();
  }
};


// Init function
export const initFilterBuilder = (scrawl = null, dom = null, canvas = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initFilterBuilder function');
  if (!dom) throw new Error('DOM mappings not passed to initFilterBuilder function');
  if (!canvas) throw new Error('Canvas not passed to initFilterBuilder function');

  canvasHandle = canvas;

  // Build out the related modal, populating with starter-filter data
  const starterKeys = Object.keys(starterFilters),
    frag = new DocumentFragment(),
    starterGrid = dom['starters-grid'];

  starterKeys.forEach(key => {

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
    frag.appendChild(btn);

    scrawl.addNativeListener('click', requestStarterFilter, btn);
  });

  starterGrid.replaceChildren(frag);


  // We always start with a grayscale filter on page load
  const starter = starterFilters['SC-starter-filter_grayscale'],
    filter = canvas.actionPacket(starter.packet);

  currentFilterWrapper = wrap(filter, starter.formSchemaName);
  currentFilterInitialValues = currentFilterWrapper.toString();

  currentFilterWrapper.updateDisplayFilter();


  currentFilterTitleElement = dom['current-filter-name'];
  currentFilterTitleElement.textContent = starter.readableName;

  return {};
};
