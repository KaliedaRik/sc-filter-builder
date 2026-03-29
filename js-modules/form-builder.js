// ------------------------------------------------------------------------
// Form builder
// ------------------------------------------------------------------------


// Imports
import { getFilterSchema, getActionSchema, getFilterSchemas } from './filter-schemas.js';
import { generateUuid } from './utilities.js';


// Handles
let scrawlHandle = null;


// FilterWrapper object - constructor
const FilterWrapper = function (filter, form = '') {

  this.filter = filter;
  this.name = filter.name;
  this.form = form;
  this.undoArray = [];
  this.redoArray = [];
  this.actions = [];

  const actObjects = filter.actions;

  if (this.form.length && actObjects.length === 1) {

    // Starter filters come with convenience method forms
    const wrapper = new FilterActionWrapper({
      id: generateUuid(),
      order: 0,
      action: actObjects[0],
      formSchema: getFilterSchema(this.form),
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


// FilterActionWrapper object - constructor
const FilterActionWrapper = function (items) {

  this.id = items.id;
  this.order = items.order;
  this.action = items.action;
  this.formSchema = items.formSchema;
  this.formKeys = [];
  this.formHTML = '<div>Form</div>';
  this.buttonHTML = '<div>Button</div>';
  this.observer = () => {};
  this.kill = () => this.observer();

  return this;
};

// FilterActionWrapper object - prototype
const A = FilterActionWrapper.prototype = Object.create(Object.prototype);

A.set = function (items) {};

A.toString = function () {

  return JSON.stringify(this.action);
};


// Exported wrapper function
export const wrap = (filter, form) => new FilterWrapper(filter, form);


// Export for initialization 
export const initFormBuilder = (scrawl = null) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initModalManagement function');

  scrawlHandle = scrawl;

  return {};
};
