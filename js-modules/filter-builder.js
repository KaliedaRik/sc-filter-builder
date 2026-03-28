// ------------------------------------------------------------------------
// Filter builder
// ------------------------------------------------------------------------

// Imports
import { getActionSchema, getFilterSchemas } from './filter-schemas.js';
import { starterFilters } from './starter-filters.js';

console.log('Schemas', getFilterSchemas());
console.log('Starters', starterFilters);

let picture = null;

let currentFilter = null,
  currentFilterActions = null,
  currentFilterInitialValues = null,
  canvasHandle = null;

const requestStarterFilter = (e) => {

  // Perform a pre-check
  // - If user has modified the current filter, give them an opportunity to save/download
  if (currentFilterInitialValues !== JSON.stringify(currentFilterActions)) {

    console.log('Old filter has been modified. Give user a chance to save/download it');
  }

  // Find button element
  let target = e.target;

  if (target) {

    if (target.tagName !== 'BUTTON') target = target.parentElement;
    if (target && target.dataset.packet) loadStarterFilter(target.dataset.packet);
  }
};

const loadStarterFilter = (starter) => {

  console.log('User wants to change filter to', starter);

  currentFilter = canvasHandle.actionPacket(starter);
  currentFilterActions = [...currentFilter.actions];
  currentFilterInitialValues = JSON.stringify(currentFilterActions);

  picture.clearFilters();
  picture.addFilters(currentFilter);
};

export const initFilterBuilder = (scrawl = null, dom = null, canvas = null, liveView = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initFilterBuilder function');
  if (!dom) throw new Error('DOM mappings not passed to initFilterBuilder function');
  if (!canvas) throw new Error('Canvas not passed to initFilterBuilder function');
  if (!liveView) throw new Error('Picture entity "liveView" not passed to initFilterBuilder function');

  picture = liveView;
  canvasHandle = canvas;

  // We always start with a grayscale filter on page load
  currentFilter = canvas.actionPacket(starterFilters.grayscale.packet);
  currentFilterActions = [...currentFilter.actions];
  currentFilterInitialValues = JSON.stringify(currentFilterActions);

  picture.clearFilters();
  picture.addFilters(currentFilter);


  // Build out the related modal, populating with starter-filter data
  const starterKeys = Object.keys(starterFilters),
    frag = new DocumentFragment(),
    starterGrid = dom['starters-grid'];

  starterKeys.forEach(key => {

    const obj = starterFilters[key];

    const btn = document.createElement('button');
    btn.setAttribute('data-packet', obj.packet);
    btn.classList.add('starter-button');
    btn.type = 'button';

    const img = document.createElement('img');
    img.src = obj.imageSource;

    const label = document.createElement('p');
    label.textContent = obj.title;

    btn.appendChild(img);
    btn.appendChild(label);
    frag.appendChild(btn);
  });

  starterGrid.replaceChildren(frag);

  // DOM manipulation requires time to settle
  setTimeout(() => {

    scrawl.addNativeListener(
      'click',
      (e) => requestStarterFilter(e),
      '.starter-button',
    );
  }, 200);

  return {};
};
