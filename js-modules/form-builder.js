// ------------------------------------------------------------------------
// Form builder
// ------------------------------------------------------------------------


// Imports
import { getFilterSchema, getActionSchema, getFilterSchemas } from './filter-schemas.js';
import { generateUuid } from './utilities.js';


// Handles
let scrawlHandle = null,
  domHandle = null,
  stackHandle = null,
  canvasHandle = null,
  filterControlsPanel = null,
  filterBuilderAreaHold = null,
  stackDragGroup = null;


// FilterWrapper object - constructor
const FilterWrapper = function (filter, formSchemaName = '') {

  this.filter = filter;
  this.name = filter.name;
  this.formSchemaName = formSchemaName;
  this.undoArray = [];
  this.redoArray = [];
  this.actions = [];

  const actObjects = filter.actions;

  if (this.formSchemaName.length && actObjects.length === 1) {

    // Starter filters come with convenience method forms
    const wrapper = new FilterActionWrapper({
      id: generateUuid(),
      order: 0,
      action: actObjects[0],
      formSchema: getFilterSchema(this.formSchemaName),
    });

    this.actions.push(wrapper);
  }
  else {

    // Other, more complex, filters - we show the action forms for each action
    actObjects.forEach((act, index) => {

      const wrapper = new FilterActionWrapper({
        id: generateUuid(),
        order: index,
        action: act,
        formSchema: getActionSchema(act.action),
      });

      this.actions.push(wrapper);
    });
  }

  return this;
};


// FilterWrapper object - prototype
const F = FilterWrapper.prototype = Object.create(Object.prototype);

F.toString = function () {

  return this.actions.map(act => act.toString()).join(',');
};

F.update = function () {};
F.undo = function () {};
F.redo = function () {};

F.sort = function () {};

F.kill = function () {

  this.undoArray.length = 0;
  this.redoArray.length = 0;

  this.actions.forEach(act => act.kill());
  this.actions.length = 0;

  this.filter.kill();

  return true;
};

const actionWrapperLibrary = {};


// FilterActionWrapper object - constructor
const FilterActionWrapper = function (items) {

  this.id = items.id;
  this.order = items.order;
  this.action = items.action;
  this.formSchema = items.formSchema;

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

  this.killList.forEach(item => item.kill());

  this.formElement.remove();
  this.buttonElement.remove();

  delete actionWrapperLibrary[this.id];
};

A.setters = {};

A.set = function (items) {

  let i, key, val, fn;

  const keys = Object.keys(items),
    keysLen = keys.length;

  if (keysLen) {

    const setters = this.setters;

    for (i = 0; i < keysLen; i++) {

      key = keys[i];
      val = items[key];

      if (key && key !== 'id' && val != null) {

        fn = setters[key];

        if (fn) fn.call(this, val);
        else this[key] = val;
      }
    }
  }
  return this;
};


const actionGroupCSS = {
  ['Color channel filter']: 'group-color-channel-filters',
  ['Convolution filter']: 'group-convolution-filters',
};


// Generate the HTML for the filter action form
const generateFormHtml = (actionWrapper) => {

  const id = `form_${actionWrapper.id}`;

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

  const controls = generateFormControls(id, actionWrapper.formSchema, actionWrapper.killList);

  details.appendChild(summary);
  details.appendChild(controls);

  filterControlsPanel.appendChild(details);

  return details;
};

const generateFormControls = (id, schema, killList) => {

  // console.log('generateFormControls id:', id);
  // console.log('generateFormControls schema:', schema);
  // console.log('generateFormControls killList:', killList);

  const controls = document.createElement('div');
  controls.textContent = 'Filter controls will go wherever';

  return controls;
};

const createEventsForFormControls = (actionWrapper) => {

  console.log('ready to wire up form', actionWrapper);

  console.log('library', actionWrapperLibrary);
};

// Generate the HTML for the builder area button for a filter action
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

  filterBuilderAreaHold.appendChild(button);

  return button;
};


// Exported wrapper function
export const wrap = (filter, form) => new FilterWrapper(filter, form);


// Export for initialization 
export const initFormBuilder = (scrawl = null, dom = null, stack = null, canvas = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initFormBuilder function');
  if (!dom) throw new Error('DOM mappings not passed to initFormBuilder function');
  if (!stack) throw new Error('Stack not passed to initFormBuilder function');
  if (!canvas) throw new Error('Canvas not passed to initFormBuilder function');


  // populate module-level variables
  scrawlHandle = scrawl;
  domHandle = dom;
  stackHandle = stack;
  canvasHandle = canvas;

  filterControlsPanel = dom['filter-controls-panel'];
  filterBuilderAreaHold = dom['filter-builder-area-hold'];


  // Make the stack elements draggable
  stackDragGroup = scrawl.makeGroup({ name: 'stack-drag-group' });

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
            // - direct children appended to #filter-builder-area-hold must be BUTTON.graph-action-button[data-action-wrapper]
            if (mutation.target.id === 'filter-builder-area-hold' && node.tagName === 'BUTTON') {

              // Only process the element once
              if (!node.dataset.scAdopted) {

                const id = node.id;

                stackHandle.addExistingDomElements(`#${id}`);

                const el = scrawlHandle.findElement(id);

                el.set({
                  start: ['center', 'center'],
                  handle: ['center', 'center'],
                  dimensions: [200, 80],
                });

                stackDragGroup.addArtefacts(el);

                actionWrapper.killList.push(el)
                actionWrapper.buttonElement = el.domElement;

                node.dataset.scAdopted = '1';
              }
            }

            // Wire up filter action forms after they get added to the DOM
            // - direct children appended to #filter-controls-panel must be DETAILS[data-action-wrapper]
            if (mutation.target.id === 'filter-controls-panel' && node.tagName === 'DETAILS') {

              // Only process the element once
              if (!node.dataset.formWired) {

                createEventsForFormControls(actionWrapper);

                node.dataset.formWired = '1';
              }
            }
          }
        });
      }
    }
  });

  multiObserver.observe(filterBuilderAreaHold, { childList: true });
  multiObserver.observe(filterControlsPanel, { childList: true });

  return {};
};


// Development
console.log(getFilterSchemas());
