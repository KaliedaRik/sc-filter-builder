// ------------------------------------------------------------------------
// Form builder
// ------------------------------------------------------------------------


// Imports
// ------------------------------------------------------------------------


// Module-scoped Handles and variables
// ------------------------------------------------------------------------
let scrawlHandle = null,
  filterControlsPanel = null,
  filterBuilderAreaHold = null,
  getWrapper = null,
  colorFactory = null;


// CSS considerations
// ------------------------------------------------------------------------
const actionGroupCSS = {
  ['Color channel filter']: 'group-color-channel-filters',
  ['Convolution filter']: 'group-convolution-filters',
};


// Generate the HTML for the builder area button for a filter action
// ------------------------------------------------------------------------
export const generateButtonHtml = (actionWrapper) => {

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
export const generateFormHtml = (actionWrapper) => {

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

  const controls = generateFormControls(actionWrapper);

  details.appendChild(summary);
  details.appendChild(controls);

  // Further processing happens when the element is appended to its DOM parent
  // - This happens in the MutationObserver function, created during module initialization
  filterControlsPanel.appendChild(details);

  return details;
};

const generateFormControls = (actionWrapper) => {

  const controls = document.createElement('div');
  controls.classList.add('form-action-controls-panel');

  actionWrapper.formSchema.presentation.forEach(section => {

    const res = generateFormSection(section, actionWrapper);

    controls.appendChild(res);
  });

  return controls;
};

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

    case 'color': return createControl_color(data, actionWrapper);
    case 'color-array': return createControl_colorArray(data, actionWrapper);
    case 'line-text': return createControl_lineText(data, actionWrapper);
    case 'number': return createControl_number(data, actionWrapper);
    case 'percentage-number': return createControl_percentageNumber(data, actionWrapper);
    case 'boolean': return createControl_boolean(data, actionWrapper);
    case 'text': return createControl_text(data, actionWrapper);
    case 'select': return createControl_select(data, actionWrapper);
    case 'bespoke-area-alpha': return createControl_areaAlpha(data, actionWrapper);
    default:
      const el = document.createElement('div');
      el.textContent = `No function for ${actionWrapper.formId} - ${data.label}`;
      return el;
  }
};

const getListenId = (id) => `${id}_listen`;


const createControl_color = (data, actionWrapper) => {

  const { formId, formSchema, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  let redVal, greenVal, blueVal, initialVal;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-color');
  el.dataset.localId = localId;

  const row1 = document.createElement('div');
  row1.classList.add('action-control-inputs-for-color-row-1');

  const localId_color = `${localId}_color`;

  const label = document.createElement('label');
  label.classList.add('action-control-color-input-label');
  label.textContent = data.label;
  label.setAttribute('for', localId_color);
  row1.appendChild(label);

  redVal = actionWrapper.action[data.alternativeFor[0]];
  greenVal = actionWrapper.action[data.alternativeFor[1]];
  blueVal = actionWrapper.action[data.alternativeFor[2]];

  initialVal = colorFactory.convertRGBtoHex(redVal, greenVal, blueVal);

  const colorInput = document.createElement('input');
  colorInput.id = localId_color;
  colorInput.name = localId_color;
  colorInput.type = 'color';
  colorInput.value = initialVal;
  row1.appendChild(colorInput);

  const row2 = document.createElement('div');
  row2.classList.add('action-control-inputs-for-color-row-2');

  const localId_redChannel = `${localId}_red-channel`;
  const row2Red = document.createElement('div');
  row2Red.classList.add('action-control-inputs-for-color-row-2-item');

  const redLabel = document.createElement('label');
  redLabel.classList.add('action-control-red-channel-label');
  redLabel.textContent = formSchema.controls[data.alternativeFor[0]].label;
  redLabel.setAttribute('for', localId_redChannel);
  row2Red.appendChild(redLabel);

  const redInput = document.createElement('input');
  redInput.id = localId_redChannel;
  redInput.name = localId_redChannel;
  redInput.type = 'number';
  redInput.autocomplete = 'new-password';
  redInput['data-lpignore'] = 'true';
  redInput.min = 0;
  redInput.max = 255;
  redInput.step = 1;
  redInput.value = `${redVal}`;
  row2Red.appendChild(redInput);

  const localId_greenChannel = `${localId}_green-channel`;
  const row2Green = document.createElement('div');
  row2Green.classList.add('action-control-inputs-for-color-row-2-item');

  const greenLabel = document.createElement('label');
  greenLabel.classList.add('action-control-green-channel-label');
  greenLabel.textContent = formSchema.controls[data.alternativeFor[1]].label;
  greenLabel.setAttribute('for', localId_greenChannel);
  row2Green.appendChild(greenLabel);

  const greenInput = document.createElement('input');
  greenInput.id = localId_greenChannel;
  greenInput.name = localId_greenChannel;
  greenInput.type = 'number';
  greenInput.autocomplete = 'new-password';
  greenInput['data-lpignore'] = 'true';
  greenInput.min = 0;
  greenInput.max = 255;
  greenInput.step = 1;
  greenInput.value = `${greenVal}`;
  row2Green.appendChild(greenInput);

  const localId_blueChannel = `${localId}_blue-channel`;
  const row2Blue = document.createElement('div');
  row2Blue.classList.add('action-control-inputs-for-color-row-2-item');

  const blueLabel = document.createElement('label');
  blueLabel.classList.add('action-control-blue-channel-label');
  blueLabel.textContent = formSchema.controls[data.alternativeFor[2]].label;
  blueLabel.setAttribute('for', localId_blueChannel);
  row2Blue.appendChild(blueLabel);

  const blueInput = document.createElement('input');
  blueInput.id = localId_blueChannel;
  blueInput.name = localId_blueChannel;
  blueInput.type = 'number';
  blueInput.autocomplete = 'new-password';
  blueInput['data-lpignore'] = 'true';
  blueInput.min = 0;
  blueInput.max = 255;
  blueInput.step = 1;
  blueInput.value = `${blueVal}`;
  row2Blue.appendChild(blueInput);

  row2.appendChild(row2Red);
  row2.appendChild(row2Green);
  row2.appendChild(row2Blue);

  el.appendChild(row1);
  el.appendChild(row2);

  const colorListener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const hexValue = colorInput.value;

      const [redValue, greenValue, blueValue] = colorFactory.extractRGBfromColorString(hexValue);

      redInput.value = redValue;
      greenInput.value = greenValue;
      blueInput.value = blueValue;

      actionWrapper.set({
        [data.alternativeFor[0]]: parseInt(redValue, 10),
        [data.alternativeFor[1]]: parseInt(greenValue, 10),
        [data.alternativeFor[2]]: parseInt(blueValue, 10),
      });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, colorInput);

  const rgbListener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const redValue = parseInt(redInput.value, 10),
        greenValue = parseInt(greenInput.value, 10),
        blueValue = parseInt(blueInput.value, 10);

      colorInput.value = colorFactory.convertRGBtoHex(redValue, greenValue, blueValue);

      actionWrapper.set({
        [data.alternativeFor[0]]: redValue,
        [data.alternativeFor[1]]: greenValue,
        [data.alternativeFor[2]]: blueValue,
      });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, [redInput, greenInput, blueInput]);

  killList.push(colorListener, rgbListener);

  return el;
};


const createControl_colorArray = (data, actionWrapper) => {

console.log('createControl_colorArray actionWrapper', actionWrapper, 'data', data);
  const { formId, formSchema, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  let redVal, greenVal, blueVal, alphaVal, initialVal;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-color-array');
  el.dataset.localId = localId;

  const row1 = document.createElement('div');
  row1.classList.add('action-control-inputs-for-color-array-row-1');

  const localId_color = `${localId}_color`;

  const label = document.createElement('label');
  label.classList.add('action-control-color-array-input-label');
  label.textContent = data.label;
  label.setAttribute('for', localId_color);
  row1.appendChild(label);

  [redVal, greenVal, blueVal, alphaVal] = actionWrapper.action[data.key];

  initialVal = colorFactory.convertRGBtoHex(redVal, greenVal, blueVal);
console.log('values', redVal, greenVal, blueVal, alphaVal, initialVal);

  const colorInput = document.createElement('input');
  colorInput.id = localId_color;
  colorInput.name = localId_color;
  colorInput.type = 'color';
  colorInput.value = initialVal;
  row1.appendChild(colorInput);

  const row2 = document.createElement('div');
  row2.classList.add('action-control-inputs-for-color-array-row-2');

  const localId_redChannel = `${localId}_red-channel`;
  const row2Red = document.createElement('div');
  row2Red.classList.add('action-control-inputs-for-color-array-row-2-item');

  const redLabel = document.createElement('label');
  redLabel.classList.add('action-control-red-channel-label');
  redLabel.textContent = 'Red';
  redLabel.setAttribute('for', localId_redChannel);
  row2Red.appendChild(redLabel);

  const redInput = document.createElement('input');
  redInput.id = localId_redChannel;
  redInput.name = localId_redChannel;
  redInput.type = 'number';
  redInput.autocomplete = 'new-password';
  redInput['data-lpignore'] = 'true';
  redInput.min = 0;
  redInput.max = 255;
  redInput.step = 1;
  redInput.value = `${redVal}`;
  row2Red.appendChild(redInput);

  const localId_greenChannel = `${localId}_green-channel`;
  const row2Green = document.createElement('div');
  row2Green.classList.add('action-control-inputs-for-color-array-row-2-item');

  const greenLabel = document.createElement('label');
  greenLabel.classList.add('action-control-green-channel-label');
  greenLabel.textContent = 'Green';
  greenLabel.setAttribute('for', localId_greenChannel);
  row2Green.appendChild(greenLabel);

  const greenInput = document.createElement('input');
  greenInput.id = localId_greenChannel;
  greenInput.name = localId_greenChannel;
  greenInput.type = 'number';
  greenInput.autocomplete = 'new-password';
  greenInput['data-lpignore'] = 'true';
  greenInput.min = 0;
  greenInput.max = 255;
  greenInput.step = 1;
  greenInput.value = `${greenVal}`;
  row2Green.appendChild(greenInput);

  const localId_blueChannel = `${localId}_blue-channel`;
  const row2Blue = document.createElement('div');
  row2Blue.classList.add('action-control-inputs-for-color-array-row-2-item');

  const blueLabel = document.createElement('label');
  blueLabel.classList.add('action-control-blue-channel-label');
  blueLabel.textContent = 'Blue';
  blueLabel.setAttribute('for', localId_blueChannel);
  row2Blue.appendChild(blueLabel);

  const blueInput = document.createElement('input');
  blueInput.id = localId_blueChannel;
  blueInput.name = localId_blueChannel;
  blueInput.type = 'number';
  blueInput.autocomplete = 'new-password';
  blueInput['data-lpignore'] = 'true';
  blueInput.min = 0;
  blueInput.max = 255;
  blueInput.step = 1;
  blueInput.value = `${blueVal}`;
  row2Blue.appendChild(blueInput);

  const localId_alphaChannel = `${localId}_alpha-channel`;
  const row2Alpha = document.createElement('div');
  row2Alpha.classList.add('action-control-inputs-for-color-array-row-2-item');

  const alphaLabel = document.createElement('label');
  alphaLabel.classList.add('action-control-alpha-channel-label');
  alphaLabel.textContent = 'Alpha';
  alphaLabel.setAttribute('for', localId_alphaChannel);
  row2Alpha.appendChild(alphaLabel);

  const alphaInput = document.createElement('input');
  alphaInput.id = localId_alphaChannel;
  alphaInput.name = localId_alphaChannel;
  alphaInput.type = 'number';
  alphaInput.autocomplete = 'new-password';
  alphaInput['data-lpignore'] = 'true';
  alphaInput.min = 0;
  alphaInput.max = 255;
  alphaInput.step = 1;
  alphaInput.value = `${alphaVal}`;
  row2Alpha.appendChild(alphaInput);

  row2.appendChild(row2Red);
  row2.appendChild(row2Green);
  row2.appendChild(row2Blue);
  row2.appendChild(row2Alpha);

  el.appendChild(row1);
  el.appendChild(row2);

  const colorListener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const hexValue = colorInput.value,
        alphaValue = parseInt(alphaInput.value, 10);

      const [redValue, greenValue, blueValue] = colorFactory.extractRGBfromColorString(hexValue);

      redInput.value = `${redValue}`;
      greenInput.value = `${greenValue}`;
      blueInput.value = `${blueValue}`;

      actionWrapper.set({ [data.key]: [redValue, greenValue, blueValue, alphaValue] });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, colorInput);

  const rgbListener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const redValue = parseInt(redInput.value, 10),
        greenValue = parseInt(greenInput.value, 10),
        blueValue = parseInt(blueInput.value, 10),
        alphaValue = parseInt(alphaInput.value, 10);

      colorInput.value = colorFactory.convertRGBtoHex(redValue, greenValue, blueValue);

      actionWrapper.set({ [data.key]: [redValue, greenValue, blueValue, alphaValue] });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, [redInput, greenInput, blueInput]);

  const alphaListener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const redValue = parseInt(redInput.value, 10),
        greenValue = parseInt(greenInput.value, 10),
        blueValue = parseInt(blueInput.value, 10),
        alphaValue = parseInt(alphaInput.value, 10);

      actionWrapper.set({ [data.key]: [redValue, greenValue, blueValue, alphaValue] });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, [alphaInput]);

  killList.push(colorListener, rgbListener, alphaListener);

  return el;
};


const createControl_lineText = (data, actionWrapper) => {

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-linetext');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;

  const input = document.createElement('input');
  input.id = localId;
  input.name = localId;
  input.type = 'text';
  input.autocomplete = 'new-password';
  input['data-lpignore'] = 'true';
  input.value = value;
  el.appendChild(input);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      actionWrapper.set({
        [data.key]: input.value,
      });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, input);

  killList.push(listener);

  return el;
};


const createControl_areaAlpha = (data, actionWrapper) => {

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-area-alpha');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  const [topLeftValue, bottomLeftValue, topRightValue, bottomRightValue] = actionWrapper.action[data.key];

  const container = document.createElement('div');
  container.classList.add('action-control-inputs-for-area-alpha-container');

  const localId_topLeftAlpha = `${localId}_top-left-channel`;
  const topLeft = document.createElement('div');
  topLeft.classList.add('action-control-inputs-for-area-alpha-item');

  const topLeftLabel = document.createElement('label');
  topLeftLabel.classList.add('action-control-inputs-for-area-alpha-label');
  topLeftLabel.textContent = 'Top left';
  topLeftLabel.setAttribute('for', localId_topLeftAlpha);
  topLeft.appendChild(topLeftLabel);

  const topLeftInput = document.createElement('input');
  topLeftInput.id = localId_topLeftAlpha;
  topLeftInput.name = localId_topLeftAlpha;
  topLeftInput.type = 'number';
  topLeftInput.autocomplete = 'new-password';
  topLeftInput['data-lpignore'] = 'true';
  topLeftInput.min = 0;
  topLeftInput.max = 255;
  topLeftInput.step = 1;
  topLeftInput.value = `${topLeftValue}`;
  topLeft.appendChild(topLeftInput);

  const localId_topRightAlpha = `${localId}_top-left-channel`;
  const topRight = document.createElement('div');
  topLeft.classList.add('action-control-inputs-for-area-alpha-item');

  const topRightLabel = document.createElement('label');
  topRightLabel.classList.add('action-control-inputs-for-area-alpha-label');
  topRightLabel.textContent = 'Top right';
  topRightLabel.setAttribute('for', localId_topRightAlpha);
  topRight.appendChild(topRightLabel);

  const topRightInput = document.createElement('input');
  topRightInput.id = localId_topRightAlpha;
  topRightInput.name = localId_topRightAlpha;
  topRightInput.type = 'number';
  topRightInput.autocomplete = 'new-password';
  topRightInput['data-lpignore'] = 'true';
  topRightInput.min = 0;
  topRightInput.max = 255;
  topRightInput.step = 1;
  topRightInput.value = `${topRightValue}`;
  topRight.appendChild(topRightInput);

  const localId_bottomLeftAlpha = `${localId}_bottom-left-channel`;
  const bottomLeft = document.createElement('div');
  bottomLeft.classList.add('action-control-inputs-for-area-alpha-item');

  const bottomLeftLabel = document.createElement('label');
  bottomLeftLabel.classList.add('action-control-inputs-for-area-alpha-label');
  bottomLeftLabel.textContent = 'Bottom left';
  bottomLeftLabel.setAttribute('for', localId_bottomLeftAlpha);
  bottomLeft.appendChild(bottomLeftLabel);

  const bottomLeftInput = document.createElement('input');
  bottomLeftInput.id = localId_bottomLeftAlpha;
  bottomLeftInput.name = localId_bottomLeftAlpha;
  bottomLeftInput.type = 'number';
  bottomLeftInput.autocomplete = 'new-password';
  bottomLeftInput['data-lpignore'] = 'true';
  bottomLeftInput.min = 0;
  bottomLeftInput.max = 255;
  bottomLeftInput.step = 1;
  bottomLeftInput.value = `${bottomLeftValue}`;
  bottomLeft.appendChild(bottomLeftInput);

  const localId_bottomRightAlpha = `${localId}_bottom-right-channel`;
  const bottomRight = document.createElement('div');
  bottomRight.classList.add('action-control-inputs-for-area-alpha-item');

  const bottomRightLabel = document.createElement('label');
  bottomRightLabel.classList.add('action-control-inputs-for-area-alpha-label');
  bottomRightLabel.textContent = 'Bottom right';
  bottomRightLabel.setAttribute('for', localId_bottomRightAlpha);
  bottomRight.appendChild(bottomRightLabel);

  const bottomRightInput = document.createElement('input');
  bottomRightInput.id = localId_bottomRightAlpha;
  bottomRightInput.name = localId_bottomRightAlpha;
  bottomRightInput.type = 'number';
  bottomRightInput.autocomplete = 'new-password';
  bottomRightInput['data-lpignore'] = 'true';
  bottomRightInput.min = 0;
  bottomRightInput.max = 255;
  bottomRightInput.step = 1;
  bottomRightInput.value = `${bottomRightValue}`;
  bottomRight.appendChild(bottomRightInput);

  container.appendChild(topLeft);
  container.appendChild(topRight);
  container.appendChild(bottomLeft);
  container.appendChild(bottomRight);

  el.appendChild(container);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const topLeftVal = parseInt(topLeftInput.value, 10),
        topRightVal = parseInt(topRightInput.value, 10),
        bottomLeftVal = parseInt(bottomLeftInput.value, 10),
        bottomRightVal = parseInt(bottomRightInput.value, 10);

      actionWrapper.set({
        [data.key]: [topLeftVal, bottomLeftVal, topRightVal, bottomRightVal],
      });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, [topLeftInput, topRightInput, bottomLeftInput, bottomRightInput]);

  killList.push(listener);

  return el;
};


const createControl_text = (data, actionWrapper) => {

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-text');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;

  const input = document.createElement('input');
  input.id = localId;
  input.name = localId;
  input.type = 'text';
  input.autocomplete = 'new-password';
  input['data-lpignore'] = 'true';
  input.value = value;
  el.appendChild(input);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      actionWrapper.set({
        [data.key]: input.value,
      });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, input);

  killList.push(listener);

  return el;
};


const createControl_boolean = (data, actionWrapper) => {

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

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

  const isFalse = document.createElement('option');
  isFalse.value = '0';
  isFalse.textContent = 'False';

  const isTrue = document.createElement('option');
  isTrue.value = '1';
  isTrue.textContent = 'True';

  input.appendChild(isFalse);
  input.appendChild(isTrue);

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;
  value = (value) ? '1' : '0';

  input.options.selectedIndex = value;

  el.appendChild(input);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const value = (input.value === '1') ? true : false;

      actionWrapper.set({
        [data.key]: value,
      });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, input);

  killList.push(listener);

  return el;
};


const createControl_number = (data, actionWrapper) => {

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-number');
  el.dataset.localId = localId;

  const row1 = document.createElement('div');
  row1.classList.add('action-control-inputs-for-number-row-1');

  const localId_number = `${localId}_number`;

  const label = document.createElement('label');
  label.classList.add('action-control-visible-label');
  label.textContent = data.label;
  label.setAttribute('for', localId_number);
  row1.appendChild(label);

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;

  const numberInput = document.createElement('input');
  numberInput.id = localId_number;
  numberInput.name = localId_number;
  numberInput.type = 'number';
  numberInput.autocomplete = 'new-password';
  numberInput['data-lpignore'] = 'true';
  numberInput.min = `${data.minValue}`;
  numberInput.max = `${data.maxValue}`;
  numberInput.step = `${data.step}`;
  numberInput.value = `${value}`;
  row1.appendChild(numberInput);

  const row2 = document.createElement('div');
  row2.classList.add('action-control-inputs-for-number-row-2');

  const localId_range = `${localId}_range`;

  const hiddenLabel = document.createElement('label');
  hiddenLabel.classList.add('action-control-hidden-label');
  hiddenLabel.textContent = `${data.label} for range input`;
  hiddenLabel.setAttribute('for', localId_range);
  row2.appendChild(hiddenLabel);

  const rangeInput = document.createElement('input');
  rangeInput.id = localId_range;
  rangeInput.name = localId_range;
  rangeInput.type = 'range';
  rangeInput.min = `${data.minValue}`;
  rangeInput.max = `${data.maxValue}`;
  rangeInput.step = `${data.step}`;
  rangeInput.value = `${value}`;
  row2.appendChild(rangeInput);

  el.appendChild(row1);
  el.appendChild(row2);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const target = e.target;
      const value = (data.step < 1) ? parseFloat(target.value) : parseInt(target.value, 10);

      if (data.alternativeControl) {

        data.alternativeFor.forEach(alt => actionWrapper.set({ [alt]: value }));
      }
      else actionWrapper.set({ [data.key]: value });

      numberInput.value = value;
      rangeInput.value = value;

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, [numberInput, rangeInput]);

  killList.push(listener);

  return el;
};


const createControl_percentageNumber = (data, actionWrapper) => {

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-number');
  el.dataset.localId = localId;

  const row1 = document.createElement('div');
  row1.classList.add('action-control-inputs-for-number-row-1');

  const label = document.createElement('label');
  label.classList.add('action-control-visible-label');
  label.textContent = `${data.label} (%)`;
  label.setAttribute('for', `${localId}_number`);
  row1.appendChild(label);

  const localId_number = `${localId}_number`;

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;
  value = (typeof value === 'string') ? parseFloat(value) : value;

  const numberInput = document.createElement('input');
  numberInput.id = localId_number;
  numberInput.name = localId_number;
  numberInput.type = 'number';
  numberInput.autocomplete = 'new-password';
  numberInput['data-lpignore'] = 'true';
  numberInput.min = `${data.minValue}`;
  numberInput.max = `${data.maxValue}`;
  numberInput.step = `${data.step}`;
  numberInput.value = `${value}`;
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
  rangeInput.min = `${data.minValue}`;
  rangeInput.max = `${data.maxValue}`;
  rangeInput.step = `${data.step}`;
  rangeInput.value = `${value}`;
  row2.appendChild(rangeInput);

  el.appendChild(row1);
  el.appendChild(row2);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const target = e.target;

      const value = (data.step < 1) ? parseFloat(target.value) : parseInt(target.value, 10);

      if (data.alternativeControl) {

        data.alternativeFor.forEach(alt => actionWrapper.set({ [alt]: `${value}%` }));
      }
      else actionWrapper.set({ [data.key]: `${value}%` });

      numberInput.value = value;
      rangeInput.value = value;

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, [numberInput, rangeInput]);

  killList.push(listener);

  return el;
};


const createControl_select = (data, actionWrapper) => {

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`,
    listenId = getListenId(formId);

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-select');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  const input = document.createElement('select');
  input.id = localId;
  input.name = localId;
  input.classList.add(listenId);

  data.options.forEach(val => {

    const option = document.createElement('option');
    option.value = val;
    option.textContent = val;
    input.appendChild(option);
  })

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;

  input.value = value;

  el.appendChild(input);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const value = input.value;

      actionWrapper.set({
        [data.key]: value,
      });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, input);

  killList.push(listener);

  return el;
};


// Export for initialization 
// ------------------------------------------------------------------------
export const initFormBuilder = (
  scrawl = null,
  dom = null,
  getCurrentWrappedFilter = null,
  actionWrapperLibrary = null,
) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initFormBuilder function');
  if (!dom) throw new Error('DOM mappings not passed to initFormBuilder function');
  if (!getCurrentWrappedFilter) throw new Error('getCurrentWrappedFilter not passed to initFormBuilder function');
  if (!actionWrapperLibrary) throw new Error('actionWrapperLibrary not passed to initFormBuilder function');


  const stack = scrawl.findStack('filter-builder-stack');

  // // populate module-level variables
  scrawlHandle = scrawl;
  filterControlsPanel = dom['filter-controls-panel'];
  filterBuilderAreaHold = dom['filter-builder-area-hold'];
  getWrapper = getCurrentWrappedFilter;

  colorFactory = scrawl.makeColor({
    name: 'form-builder-color-factory',
  });


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
          }
        });
      }
    }
  });
  multiObserver.observe(filterBuilderAreaHold, { childList: true });


  // Return object
  return {};
};


// Development
// ------------------------------------------------------------------------

