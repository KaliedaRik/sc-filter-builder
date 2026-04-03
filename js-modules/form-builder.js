// ------------------------------------------------------------------------
// Form builder
// ------------------------------------------------------------------------


// Imports
// ------------------------------------------------------------------------
import { getFilterSchema, getActionSchema, getFilterSchemas } from './filter-schemas.js';
import { generateUuid } from './utilities.js';


// Module-scoped Handles and variables
// ------------------------------------------------------------------------
let scrawlHandle = null,
  filterControlsPanel = null,
  filterBuilderAreaHold = null,
  currentFilter = null,
  displayFilter = null,
  getView = null;


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

      case 'pixelate': correctDisplayFilterAction_pixelate(act, view);
    }
  });

  displayFilter.set({ actions });
};


// updateDisplayFilter correction functions
const correctDisplayFilterAction_pixelate = (action, view) => {

/*
const view = {
  x: 0,
  y: 0,
  width: 1,
  height: 1,
  assetWidth: 1,
  assetHeight: 1,
  currentScale: 1,
};
*/
  const { x, y, currentScale } = view;

  const updatedWidth = action.tileWidth * currentScale,
    updatedHeight = action.tileHeight * currentScale,
    remainingX = (action.offsetX + (x % action.tileWidth)) * currentScale,
    remainingY = (action.offsetY + (y % action.tileHeight)) * currentScale;

  action.tileWidth = updatedWidth;
  action.tileHeight = updatedHeight;
  action.offsetX = remainingX;
  action.offsetY = remainingY;
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

  // Used to build the SC updater
  this.formCollection = {};

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

    const setters = this.setters,
      action = this.action;

    for (i = 0; i < keysLen; i++) {

      key = keys[i];
      val = items[key];

      if (key && key !== 'id' && val != null) {

        fn = setters[key];

        if (fn) fn.call(this, val);
        else action[key] = val;
      }
    }
  }
  return this;
};

// Bespoke setters for more complex action forms
const S = A.setters = {};


// CSS considerations
// ------------------------------------------------------------------------
const actionGroupCSS = {
  ['Color channel filter']: 'group-color-channel-filters',
  ['Convolution filter']: 'group-convolution-filters',
};


// Generate the HTML for the builder area button for a filter action
// ------------------------------------------------------------------------
const generateButtonHtml = (actionWrapper) => {

  const button = document.createElement('button');
  button.id = `button_${actionWrapper.id}`;
  button.classList.add('graph-action-button');
  button.classList.add(actionGroupCSS[actionWrapper.formSchema.group]);
  button.setAttribute('data-action-wrapper', actionWrapper.id);

  const title = document.createElement('h2');
  title.textContent = actionWrapper.formSchema.label;
  button.appendChild(title);

  const buttonId = document.createElement('p');
  buttonId.textContent = actionWrapper.id.substring(0, 8);
  button.appendChild(buttonId);

  // Further processing happens when the element is appended to its DOM parent
  // - This happens in the MutationObserver function, created during module initialization
  filterBuilderAreaHold.appendChild(button);

  return button;
};


// Generate the HTML for the filter action form
// ------------------------------------------------------------------------
const generateFormHtml = (actionWrapper) => {

  const id = actionWrapper.formId;

  const details = document.createElement('details');
  details.id = id;
  details.setAttribute('data-action-wrapper', actionWrapper.id);
  details.setAttribute('open', '');

  const summary = document.createElement('summary');

  const summarySpan1 = document.createElement('span');
  summarySpan1.classList.add('summary-title');
  summarySpan1.textContent = `${actionWrapper.formSchema.label} `;
  summary.appendChild(summarySpan1);

  const summarySpan2 = document.createElement('span');
  summarySpan2.classList.add('summary-identifier');
  summarySpan2.textContent = `(${actionWrapper.id.substring(0, 8)})`;
  summary.appendChild(summarySpan2);

  // const controls = generateFormControls(id, actionWrapper.formSchema, actionWrapper.formCollection, actionWrapper.killList);
  const controls = generateFormControls(actionWrapper);

  details.appendChild(summary);
  details.appendChild(controls);

  // Further processing happens when the element is appended to its DOM parent
  // - This happens in the MutationObserver function, created during module initialization
  filterControlsPanel.appendChild(details);

  return details;
};

// const generateFormControls = (id, schema, formCollection, killList) => {
const generateFormControls = (actionWrapper) => {

  const controls = document.createElement('div');
  controls.classList.add('form-action-controls-panel');

  actionWrapper.formSchema.presentation.forEach(section => {

    // const res = generateFormSection(id, schema.action, section, schema.controls, formCollection, killList);
    const res = generateFormSection(section, actionWrapper);

    controls.appendChild(res);
  });

  return controls;
};

// const generateFormSection = (id, action, section, controls, formCollection, killList) => {
const generateFormSection = (section, actionWrapper) => {

  const controls = actionWrapper.formSchema.controls;

  const detailsEl = document.createElement('details');
  detailsEl.classList.add('form-action-section-panel');
  if (section.openOnLoad) detailsEl.setAttribute('open', '');

  const summaryEl = document.createElement('summary');
  summaryEl.textContent = section.header;
  detailsEl.appendChild(summaryEl);

  section.inputs.forEach(item => {

    const row = createControl(controls[item], actionWrapper);
    detailsEl.appendChild(row);
  });

  return detailsEl;
};


// Form controls creation
// ------------------------------------------------------------------------
const createControl = (data, actionWrapper) => {

  switch (data.controlType) {

    case 'line-text': return createControl_lineText(data, actionWrapper);
    case 'number': return createControl_number(data, actionWrapper);
    case 'boolean': return createControl_boolean(data, actionWrapper);
    default:
      const el = document.createElement('div');
      el.textContent = `No function for ${actionWrapper.formId} - ${data.label}`;
      return el;
  }
};

const getListenId = (id) => `${id}_listen`;


// THIS NEEDS FIXING - can have more than one 'gaussianBlur' action in a set of actions!
// - this solution only returns the first instance of multiple actions of same type
const getFilterAttributeValue = (action, attribute) => {

  const act = currentFilter.filter.actions.filter(f => f.action === action);

  return act[0][attribute];
};

// const createControl_lineText = (id, action, data, formCollection, killList) => {
const createControl_lineText = (data, actionWrapper) => {

  const {formId, formSchema, formCollection, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`,
    listenId = getListenId(formId);

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-linetext');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  const val = getFilterAttributeValue(formSchema.action, data.key);

  const input = document.createElement('input');
  input.id = localId;
  input.name = localId;
  input.type = 'text';
  input.value = (val != null) ? val : data.default;
  input.classList.add(listenId);
  el.appendChild(input);

  formCollection[localId] = [data.key, 'raw'];

  return el;
};

// const createControl_boolean = (id, action, data, formCollection, killList) => {
const createControl_boolean = (data, actionWrapper) => {

  const {formId, formSchema, formCollection, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`,
    listenId = getListenId(formId);

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-boolean');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  const input = document.createElement('select');
  input.id = localId;
  input.name = localId;
  input.classList.add(listenId);

  const isFalse = document.createElement('option');
  isFalse.value = '0';
  isFalse.textContent = 'False';

  const isTrue = document.createElement('option');
  isTrue.value = '1';
  isTrue.textContent = 'True';

  input.appendChild(isFalse);
  input.appendChild(isTrue);

  let val = getFilterAttributeValue(formSchema.action, data.key);
  val = (val != null) ? val : data.default;
  val = (val) ? '1' : '0';

  input.options.selectedIndex = val;

  el.appendChild(input);

  formCollection[localId] = [data.key, 'boolean'];

  return el;
};

// const createControl_number = (id, action, data, formCollection, killList) => {
const createControl_number = (data, actionWrapper) => {

  const {formId, formSchema, formCollection, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`,
    listenId = getListenId(formId);

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-number');
  el.dataset.localId = localId;

  const row1 = document.createElement('div');
  row1.classList.add('action-control-inputs-for-number-row-1');

  const label = document.createElement('label');
  label.classList.add('action-control-visible-label');
  label.textContent = data.label;
  label.setAttribute('for', `${localId}_number`);
  row1.appendChild(label);

  const localId_number = `${localId}_number`;

  const val = getFilterAttributeValue(formSchema.action, data.key);

  const numberInput = document.createElement('input');
  numberInput.id = localId_number;
  numberInput.name = localId_number;
  numberInput.type = 'number';
  numberInput.value = (val != null) ? val : data.default;
  numberInput.min = data.minValue;
  numberInput.max = data.maxValue;
  numberInput.step = data.step;
  numberInput.classList.add(listenId);
  row1.appendChild(numberInput);

  const row2 = document.createElement('div');
  row2.classList.add('action-control-inputs-for-number-row-2');

  const hiddenLabel = document.createElement('label');
  hiddenLabel.classList.add('action-control-hidden-label');
  hiddenLabel.textContent = `${data.label} for range input`;
  hiddenLabel.setAttribute('for', `${localId}_range`);
  row2.appendChild(hiddenLabel);

  const localId_range = `${localId}_range`;

  const rangeInput = document.createElement('input');
  rangeInput.id = localId_range;
  rangeInput.name = localId_range;
  rangeInput.type = 'range';
  rangeInput.value = (val != null) ? val : data.default;
  rangeInput.min = data.minValue;
  rangeInput.max = data.maxValue;
  rangeInput.step = data.step;
  rangeInput.classList.add(listenId);
  row2.appendChild(rangeInput);

  if (data.alternativeControl) {

    if ('set-alternatives-to-this' === data.alternativeAction) {

      const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

        if (e && e.target) {

          e.preventDefault();

          const target = e.target;

          let val;

          if (data.step < 1) val = parseFloat(target.value);
          else val = parseInt(target.value, 10);

          data.alternativeFor.forEach(alt => actionWrapper.set({
            [alt]: val,
          }));

          currentFilter.updateDisplayFilter();
          currentFilter.updateHistory();
        }
      }, [numberInput, rangeInput]);

      killList.push(listener);
    }
  }
  else {

    if (data.step < 1) {

      formCollection[localId_number] = [data.key, 'float'];
      formCollection[localId_range] = [data.key, 'float'];
    }
    else {

      formCollection[localId_number] = [data.key, 'round'];
      formCollection[localId_range] = [data.key, 'round'];
    }
  }

  const numberToRange = scrawlHandle.addNativeListener(['change', 'input'], (e) => {
    if (e?.target?.value != null) rangeInput.value = e.target.value;
  }, numberInput);

  const rangeToNumber = scrawlHandle.addNativeListener(['change', 'input'], (e) => {
    if (e?.target?.value != null) numberInput.value = e.target.value;
  }, rangeInput);

  killList.push(numberToRange, rangeToNumber);

  el.appendChild(row1);
  el.appendChild(row2);

  return el;
};

const createEventsForFormControls = (actionWrapper) => {

  const { formId, formCollection, killList } = actionWrapper;
  const listenClass = `.${getListenId(formId)}`;

  const updater = scrawlHandle.makeUpdater({

    event: ['input', 'change'],
    origin: listenClass,
    target: actionWrapper,
    useNativeListener: true,
    preventDefault: true,
    updates: formCollection,

    callback: () => {

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  });

  killList.push(updater);
};


// Exported wrapper function
// ------------------------------------------------------------------------
export const wrap = (filter, form) => new FilterWrapper(filter, form);


// Export for initialization 
// ------------------------------------------------------------------------
export const initFormBuilder = (scrawl = null, dom = null, stack = null, canvas = null, getImageDisplayViews = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initFormBuilder function');
  if (!dom) throw new Error('DOM mappings not passed to initFormBuilder function');
  if (!stack) throw new Error('Stack not passed to initFormBuilder function');
  if (!canvas) throw new Error('Canvas not passed to initFormBuilder function');
  if (!getImageDisplayViews) throw new Error('getImageDisplayViews function not passed to initFormBuilder function');


  // populate module-level variables
  scrawlHandle = scrawl;
  getView = getImageDisplayViews;
  filterControlsPanel = dom['filter-controls-panel'];
  filterBuilderAreaHold = dom['filter-builder-area-hold'];


  // Create the display filter and add it to picture
  const picture = scrawl.findEntity('live-view');

  displayFilter = scrawl.makeFilter({
    name: 'eternal-display-filter',
    actions: [],
  });

  picture.addFilters(displayFilter);


  // Make the stack elements draggable
  const stackDragGroup = scrawl.makeGroup({ name: 'stack-drag-group' });

  scrawl.makeDragZone({
    zone: stack,
    collisionGroup: stackDragGroup,
    endOn: ['up', 'leave'],
    preventTouchDefaultWhenDragging: true,
    processingOrder: 2,
  });


  // MutationObservers
  const multiObserver = new MutationObserver(mutationList => {

    for (const mutation of mutationList) {

      if (mutation.type === 'childList' && mutation.addedNodes.length) {

        // Should only be one node at a time in this setup - but just in case ...
        const nodesToProcess = [...mutation.addedNodes];

        nodesToProcess.forEach(node => {

          const actionWrapperKey = node.dataset.actionWrapper,
            actionWrapper = actionWrapperLibrary[actionWrapperKey];

          if (actionWrapper) {

            // Import filter action buttons into SC
            if (mutation.target.id === 'filter-builder-area-hold' && node.tagName === 'BUTTON') {

              // Only process the element once
              if (!node.dataset.scAdopted) {

                node.dataset.scAdopted = '1';

                const id = node.id;

                stack.addExistingDomElements(`#${id}`);

                const el = scrawl.findElement(id);

                el.set({
                  start: ['center', 'center'],
                  handle: ['center', 'center'],
                  dimensions: [200, 80],
                });

                stackDragGroup.addArtefacts(el);

                actionWrapper.killList.push(el)
                actionWrapper.buttonElement = el.domElement;
              }
            }

            // Wire up filter action forms after they get added to the DOM
            if (mutation.target.id === 'filter-controls-panel' && node.tagName === 'DETAILS') {

              // Only process the element once
              if (!node.dataset.formWired) {

                node.dataset.formWired = '1';
                createEventsForFormControls(actionWrapper);
              }
            }
          }
        });
      }
    }
  });
  multiObserver.observe(filterBuilderAreaHold, { childList: true });
  multiObserver.observe(filterControlsPanel, { childList: true });


  // Return object
  return {
    getCurrentWrappedFilter,
  };
};


// Development
// ------------------------------------------------------------------------
console.log(getFilterSchemas());
