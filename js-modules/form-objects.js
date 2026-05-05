// ------------------------------------------------------------------------
// Form objects
// ------------------------------------------------------------------------
import {
  generateUuid,
  DOMID,
  VIEW,
  FLAGS,
  BASIC_PREVIEW,
  ACCURATE_PREVIEW,
  setFilterWrapper,
  getScrawlHandle,
  getDomHandle,
} from './utilities.js';

import { getFilterSchema } from './filter-schemas.js';
import { generateButtonHtml, generateFormHtml } from './form-builder.js';

import {
  buildGraphData,
  wireGraph,
} from './graph-manager.js';


// Module-scoped Handles and variables
// ------------------------------------------------------------------------
let basicFilter, accurateFilter, accurateCell, processingLabel, scrawl, dom,
  warningCss, scaledWarningCss, warn, scaledWarn;

// A little paint buffering
const nextPaint = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));


// FilterWrapper object
// - We only care about the last created filter wrapper
// ------------------------------------------------------------------------
const FilterWrapper = function (filter, formSchemaName = '') {

  // There can be only one filter (with one or more action objects)!
  setFilterWrapper(this);

  this.filter = filter;
  this.name = filter.name;
  this.formSchemaName = formSchemaName;
  this.actions = [];

  const actObjects = filter.actions;

  if (this.formSchemaName.length && actObjects.length === 1) {

    const id = generateUuid();

    // Starter filters come with convenience method forms
    const wrapper = new FilterActionWrapper({
      id,
      buttonId: `button_${id}`,
      formId: `form_${id}`,
      action: actObjects[0],
      formSchema: getFilterSchema(this.formSchemaName),
    });

    this.actions.push(wrapper);
  }
  else {

    // Other, more complex, filters - we show the action forms for each action
    actObjects.forEach((act, index) => {

      const id = generateUuid();

      const wrapper = new FilterActionWrapper({
        id,
        buttonId: `button_${id}`,
        formId: `form_${id}`,
        action: act,
        formSchema: getFilterSchema(this.formSchemaName[index]),
      });

      this.actions.push(wrapper);
    });
  }

  this.graphData = buildGraphData(this.actions);

  // Putting this in a setTimeout to give things time to settle
  setTimeout(() => wireGraph(this), 100);

  return this;
};


// FilterWrapper object - prototype
const F = FilterWrapper.prototype = Object.create(Object.prototype);

F.toString = function () {

  return `[${this.actions.map(act => act.toString()).join(',')}]`;
};

F.kill = function () {

  this.actions.forEach(act => act.kill());
  this.actions.length = 0;

  this.filter.kill();

  return true;
};

F.updateFilter = function () {

  if (this?.graphData?.errorFlag) this.filter.set({ actions: [] });
  else {

    const actions = this.actions.map(act => act.action);

    this.filter.set({ actions });
  }
};

F.updateDisplayFilter = async function () {

  processingLabel.classList.add('is-processing');
  processingLabel.setAttribute('aria-busy', 'true');

  await nextPaint();

  this.updateFilter();

  const actions = structuredClone(this.filter.get('actions'));

  if (FLAGS.isBasicPreview) {

    const view = structuredClone(VIEW);

    let warningFlag = false,
      scaledWarningFlag = false;

    actions.forEach(act => {

      switch (act.action) {

        case 'area-alpha':
          correctDisplayFilterAction_areaAlpha(act, view);
          scaledWarningFlag = true;
          break;

        case 'pixelate':
          correctDisplayFilterAction_pixelate(act, view);
          scaledWarningFlag = true;
          break;

        case 'tiles':
          correctDisplayFilterAction_tiles(act, view);
          scaledWarningFlag = true;
          break;

        case 'corrode':
        case 'emboss':
        case 'glitch':
        case 'offset':
        case 'newsprint':
        case 'random-noise':
        case 'reduce-palette':
        case 'swirl':
        case 'unsharp':
        case 'zoom-blur':
          warningFlag = true;
          break;

        case 'blur':
        case 'gaussian-blur':
        case 'edge-detect':
        case 'matrix':
        case 'sharpen':
          scaledWarningFlag = true;
          break;
      }
    });

    basicFilter.set({ actions });

    if (warn && scaledWarn) {

      if (warn.classList.contains(warningCss)) warn.classList.remove(warningCss);
      if (scaledWarn.classList.contains(scaledWarningCss)) scaledWarn.classList.remove(scaledWarningCss);

      if (warningFlag) warn.classList.add(warningCss);
      else if (scaledWarningFlag) scaledWarn.classList.add(scaledWarningCss);
    }
  }
  else {

    accurateFilter.set({ actions });

    accurateCell.clear();
    accurateCell.compile();

    if (warn && scaledWarn) {

      if (warn.classList.contains(warningCss)) warn.classList.remove(warningCss);
      if (scaledWarn.classList.contains(scaledWarningCss)) scaledWarn.classList.remove(scaledWarningCss);
    }
  }

  processingLabel.classList.remove('is-processing');
  processingLabel.removeAttribute('aria-busy');
};


// updateDisplayFilter correction functions
const correctDisplayFilterAction_areaAlpha = (action, view) => {

  const { x, y, currentScale } = view;
  const { tileWidth, tileHeight, gutterWidth, gutterHeight, offsetX, offsetY } = action;

  const updatedTileWidth = tileWidth * currentScale,
    updatedTileHeight = tileHeight * currentScale,
    updatedGutterWidth = gutterWidth * currentScale,
    updatedGutterHeight = gutterHeight * currentScale,
    totalWidth = tileWidth + gutterWidth,
    totalHeight = tileHeight + gutterHeight;

  let updatedOffsetX = totalWidth - (x % totalWidth) + offsetX,
    updatedOffsetY = totalHeight - (y % totalHeight) + offsetY;

  if (updatedOffsetX >= totalWidth) updatedOffsetX -= totalWidth;
  if (updatedOffsetX < 0) updatedOffsetX += totalWidth;
  if (updatedOffsetY >= totalHeight) updatedOffsetY -= totalHeight;
  if (updatedOffsetY < 0) updatedOffsetY += totalHeight;

  action.offsetX = updatedOffsetX * currentScale;
  action.offsetY = updatedOffsetY * currentScale;
  action.tileWidth = updatedTileWidth;
  action.tileHeight = updatedTileHeight;
  action.gutterWidth = updatedGutterWidth;
  action.gutterHeight = updatedGutterHeight;
};

const correctDisplayFilterAction_pixelate = (action, view) => {

  const { x, y, currentScale } = view;
  const { tileWidth, tileHeight, offsetX, offsetY } = action;

  const updatedWidth = tileWidth * currentScale,
    updatedHeight = tileHeight * currentScale;

  let updatedOffsetX = tileWidth - (x % tileWidth) + offsetX,
    updatedOffsetY = tileHeight - (y % tileHeight) + offsetY;

  if (updatedOffsetX >= tileWidth) updatedOffsetX -= tileWidth;
  if (updatedOffsetX < 0) updatedOffsetX += tileWidth;
  if (updatedOffsetY >= tileHeight) updatedOffsetY -= tileHeight;
  if (updatedOffsetY < 0) updatedOffsetY += tileHeight;


  action.tileWidth = updatedWidth;
  action.tileHeight = updatedHeight;
  action.offsetX = updatedOffsetX * currentScale;
  action.offsetY = updatedOffsetY * currentScale;
};

const correctDisplayFilterAction_tiles = (action, view) => {

  const { x, y, assetWidth, assetHeight, currentScale } = view;
  const { originX, originY, hexRadius, rectWidth, rectHeight } = action;

  let fX, fY;

  if (typeof originX === 'string') fX = parseFloat(originX) / 100;
  else fX = originX / assetWidth;

  if (typeof originY === 'string') fY = parseFloat(originY) / 100;
  else fY = originY / assetHeight;

  action.originX = ((assetWidth * fX) - x) * currentScale;
  action.originY = ((assetHeight * fY) - y) * currentScale;
  action.hexRadius = hexRadius * currentScale;
  action.rectWidth = rectWidth * currentScale;
  action.rectHeight = rectHeight * currentScale;
};


// FilterActionWrapper object
// ------------------------------------------------------------------------
const actionWrapperLibrary = {};

const FilterActionWrapper = function (items) {

  this.id = items.id;
  this.formId = items.formId;
  this.buttonId = items.buttonId;
  this.action = items.action;
  this.formSchema = items.formSchema;

  // Keep track of everything we need to invoke during cleanup
  this.killList = [];

  actionWrapperLibrary[items.id] = this;

  this.formElement = generateFormHtml(this);
  this.buttonElement = generateButtonHtml(this);

  return this;
};


// FilterActionWrapper object - prototype
const A = FilterActionWrapper.prototype = Object.create(Object.prototype);

A.toString = function () {return JSON.stringify(this.action)};

A.kill = function () {

  this.killList.forEach(item => {

    if (item.kill != null) item.kill();
    else if (typeof item === 'function') item();
  });

  this.formElement.remove();
  this.buttonElement.remove();

  delete actionWrapperLibrary[this.id];
};

// Set function
A.set = function (items) {

  let i, key, val;

  const keys = Object.keys(items),
    keysLen = keys.length;

  if (keysLen) {

    const action = this.action;

    for (i = 0; i < keysLen; i++) {

      key = keys[i];
      val = items[key];

      if (key && key !== 'id' && val != null) action[key] = val;
    }
  }
  return this;
};


// Exported wrapper function
// ------------------------------------------------------------------------
export const wrap = (filter, form) => new FilterWrapper(filter, form);


// Export for initialization 
// ------------------------------------------------------------------------
export const initFormObjects = () => {

  scrawl = getScrawlHandle();
  dom = getDomHandle();


  // Create the display filter and add it to basic picture
  const basicPicture = scrawl.findEntity(BASIC_PREVIEW);

  basicFilter = scrawl.makeFilter({
    name: 'basic-display-filter',
    actions: [],
  });

  basicPicture.addFilters(basicFilter);


  // Create the display filter and add it to accurate picture
  const accuratePreview = scrawl.findEntity(ACCURATE_PREVIEW);

  accurateFilter = scrawl.makeFilter({
    name: 'accurate-display-filter',
    actions: [],
  });

  accuratePreview.addFilters(accurateFilter);

  accurateCell = scrawl.findCell(`${ACCURATE_PREVIEW}-cell`);

  processingLabel = dom[DOMID.PROCESSING_LABEL];
  warningCss = DOMID.PREVIEW_WARNING_CSS;
  scaledWarningCss = DOMID.PREVIEW_SCALED_WARNING_CSS;
  warn = dom[DOMID.PREVIEW_WARNING];
  scaledWarn = dom[DOMID.PREVIEW_SCALED_WARNING];

  // Return object
  return {
    actionWrapperLibrary,
  };
};
