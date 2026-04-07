// ------------------------------------------------------------------------
// Form objects
// ------------------------------------------------------------------------


// Imports
// ------------------------------------------------------------------------
import { getFilterSchema, getActionSchema, getFilterSchemas } from './filter-schemas.js';
import { generateButtonHtml, generateFormHtml } from './form-builder.js';
import { generateUuid } from './utilities.js';


// Module-scoped Handles and variables
// ------------------------------------------------------------------------
let currentFilter = null,
  displayFilter = null,
  getView = null;


// Used in other modules - exported via the init function
const getCurrentWrappedFilter = () => currentFilter;


// FilterWrapper object
// - We only care about the last created filter wrapper
// ------------------------------------------------------------------------
const FilterWrapper = function (filter, formSchemaName = '') {

  // There can be only one filter (with one or more action objects)!
  currentFilter = this;

  this.filter = filter;
  this.name = filter.name;
  this.formSchemaName = formSchemaName;
  this.undoArray = [];
  this.redoArray = [];
  this.actions = [];

  // Dirty flags
  this.dirtySort = true;

  const actObjects = filter.actions;

  if (this.formSchemaName.length && actObjects.length === 1) {

    const id = generateUuid();

    // Starter filters come with convenience method forms
    const wrapper = new FilterActionWrapper({
      id,
      formId: `form_${id}`,
      order: 0,
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
        formId: `form_${id}`,
        order: index,
        action: act,
        formSchema: getActionSchema(act.action),
      });

      this.actions.push(wrapper);
    });
  }

  this.undoArray.push(this.toString());

  return this;
};


// FilterWrapper object - prototype
const F = FilterWrapper.prototype = Object.create(Object.prototype);

F.toString = function () {

  return `[${this.actions.map(act => act.toString()).join(',')}]`;
};


// Undo-redo functionality
let lastRecordedAction = 0;
const recordedActionChoke = 200;

F.updateHistory = function () {

  const now = Date.now();

  if (lastRecordedAction + recordedActionChoke < now) {

    const undoArray = this.undoArray,
      lastUpdate = (undoArray.length) ? undoArray[undoArray.length - 1] : '',
      newUpdate = this.toString();

    if (lastUpdate !== newUpdate) {

      undoArray.push(newUpdate);
      lastRecordedAction = now;
    }
  }
};
F.undo = function () {};
F.redo = function () {};

F.sort = function () {

  if (this.dirtySort) {

    this.dirtySort = false;

    // Perform sort
  }
};

F.kill = function () {

  this.undoArray.length = 0;
  this.redoArray.length = 0;

  this.actions.forEach(act => act.kill());
  this.actions.length = 0;

  this.filter.kill();

  return true;
};

F.updateFilter = function () {

  this.sort();

  const actions = this.actions.map(act => act.action);

  this.filter.set({ actions });
};

F.updateDisplayFilter = function () {

  this.updateFilter();

  const actions = structuredClone(this.filter.get('actions'));

  // We need to manipulate the actions because some are scale and position sensitive
  // - This is why we separate the working and display filters 
  const view = getView();

  actions.forEach(act => {

    switch (act.action) {

      case 'area-alpha': {
        correctDisplayFilterAction_areaAlpha(act, view);
        break;
      }
      case 'blur': {
        correctDisplayFilterAction_blur(act, view);
        break;
      }
      case 'gaussian-blur': {
        correctDisplayFilterAction_gaussianBlur(act, view);
        break;
      }
      case 'newsprint': {
        correctDisplayFilterAction_newsprint(act, view);
        break;
      }
      case 'pixelate': {
        correctDisplayFilterAction_pixelate(act, view);
        break;
      }
      case 'random-noise': {
        correctDisplayFilterAction_randomNoise(act, view);
        break;
      }
      case 'tiles': {
        correctDisplayFilterAction_tiles(act, view);
        break;
      }
      case 'zoom-blur': {
        correctDisplayFilterAction_zoomBlur(act, view);
        break;
      }
    }
  });

  displayFilter.set({ actions });
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

const correctDisplayFilterAction_blur = (action, view) => {

  const { currentScale } = view;
  const { radiusHorizontal, radiusVertical, stepHorizontal, stepVertical } = action;

  action.radiusHorizontal = radiusHorizontal * currentScale;
  action.radiusVertical = radiusVertical * currentScale;
};

const correctDisplayFilterAction_gaussianBlur = (action, view) => {

  const { currentScale } = view;
  const { radiusHorizontal, radiusVertical } = action;

  action.radiusHorizontal = radiusHorizontal * currentScale;
  action.radiusVertical = radiusVertical * currentScale;
  action.stepHorizontal = Math.round(stepHorizontal * currentScale);
  action.stepVertical = Math.round(stepVertical * currentScale);
};

const correctDisplayFilterAction_newsprint = (action, view) => {

  const { currentScale } = view;
  const { width } = action;

  action.width = Math.round(width * currentScale);
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

const correctDisplayFilterAction_randomNoise = (action, view) => {

  const { currentScale } = view;
  const { width, height, level } = action;

  action.width = width * currentScale;
  action.height = height * currentScale;
  action.level = level / currentScale;
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

const correctDisplayFilterAction_zoomBlur = (action, view) => {

  const { x, y, assetWidth, assetHeight, currentScale } = view;
  const { startX, startY, innerRadius, outerRadius } = action;

  let fX, fY;

  if (typeof startX === 'string') fX = parseFloat(startX) / 100;
  else fX = startX / assetWidth;

  if (typeof startY === 'string') fY = parseFloat(startY) / 100;
  else fY = startY / assetHeight;

  action.startX = ((assetWidth * fX) - x) * currentScale;
  action.startY = ((assetHeight * fY) - y) * currentScale;
  action.innerRadius = innerRadius * currentScale;
  action.outerRadius = outerRadius * currentScale;
};


// FilterActionWrapper object
// ------------------------------------------------------------------------
const actionWrapperLibrary = {};

const FilterActionWrapper = function (items) {

  this.id = items.id;
  this.formId = items.formId;
  this.order = items.order;
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

  let i, key, val, fn;

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
export const initFormObjects = (scrawl = null, getImageDisplayViews = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initFormObjects function');
  if (!getImageDisplayViews) throw new Error('getImageDisplayViews function not passed to initFormObjects function');


  // Populate module-level variables
  getView = getImageDisplayViews;


  // Create the display filter and add it to picture
  const picture = scrawl.findEntity('live-view');

  displayFilter = scrawl.makeFilter({
    name: 'eternal-display-filter',
    actions: [],
  });

  picture.addFilters(displayFilter);


  // Return object
  return {
    getCurrentWrappedFilter,
    actionWrapperLibrary,
  };
};


// Development
// ------------------------------------------------------------------------
console.log(getFilterSchemas());
