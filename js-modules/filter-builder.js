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
  currentFilterInitialValues = null;

const requestStarterFilter = () => {
  
};

const loadStarterFilter = () => {

};

export const initFilterBuilder = (scrawl = null, dom = null, canvas = null, liveView = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initFilterBuilder function');
  if (!dom) throw new Error('DOM mappings not passed to initFilterBuilder function');
  if (!canvas) throw new Error('Canvas not passed to initFilterBuilder function');
  if (!liveView) throw new Error('Picture entity "liveView" not passed to initFilterBuilder function');

  picture = liveView;

  // We always start with a grayscale filter on page load
  currentFilter = canvas.actionPacket(starterFilters.grayscale.packet);
  console.log(currentFilter);

  currentFilterActions = [...currentFilter.actions];
  console.log(currentFilterActions);

  currentFilterInitialValues = JSON.stringify(currentFilterActions);
  console.log(currentFilterInitialValues);

  picture.clearFilters();
  picture.addFilters(currentFilter);

  return {};
};
