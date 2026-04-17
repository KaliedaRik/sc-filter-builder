// ------------------------------------------------------------------------
// Form builder
// ------------------------------------------------------------------------


// Imports
// ------------------------------------------------------------------------
import {
  buildColorCurveComponent,
  buildToneCurveComponent,
  buildGradientComponent,
} from './canvas-ui-components.js'

import { generateUniqueString } from './utilities.js';


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
  good: 'viewport-good-marker',
  reasonable: 'viewport-reasonable-marker',
  poor: 'viewport-poor-marker'
};


// Generate the HTML for the builder area button for a filter action
// ------------------------------------------------------------------------
export const generateButtonHtml = (actionWrapper) => {

  const button = document.createElement('button');
  button.id = `button_${actionWrapper.id}`;
  button.classList.add('graph-action-button');
  button.classList.add(actionGroupCSS[actionWrapper.formSchema.viewportAccuracy]);
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
    case 'unit-color': return createControl_unitColor(data, actionWrapper);
    case 'text': return createControl_text(data, actionWrapper);
    case 'line-text': return createControl_lineText(data, actionWrapper);
    case 'number': return createControl_number(data, actionWrapper);
    case 'percentage-number': return createControl_percentageNumber(data, actionWrapper);
    case 'boolean': return createControl_boolean(data, actionWrapper);
    case 'select': return createControl_select(data, actionWrapper);
    case 'bespoke-area-alpha': return createControl_areaAlpha(data, actionWrapper);
    case 'bespoke-chroma-ranges': return createControl_colorRanges(data, actionWrapper);
    case 'bespoke-reduce-palette': return createControl_reducePalette(data, actionWrapper);
    case 'bespoke-channel-levels': return createControl_channelLevels(data, actionWrapper);
    case 'bespoke-matrix-weights': return createControl_matrixWeights(data, actionWrapper);
    case 'bespoke-vary-channel-by-weights': return createControl_channelWeights(data, actionWrapper);
    case 'bespoke-ok-perceptual-curves': return createControl_toneWeights(data, actionWrapper);
    case 'bespoke-map-to-gradient': return createControl_gradient(data, actionWrapper);
    case 'bespoke-swirl': return createControl_swirl(data, actionWrapper);
    default:
      const el = document.createElement('div');
      el.textContent = `No function for ${actionWrapper.formId} - ${data.label}`;
      return el;
  }
};

const getListenId = (id) => `${id}_listen`;


const createControl_swirl = (data, actionWrapper) => {

  actionWrapper.swirlObjects = {};

  const {formId, action, swirlObjects, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-swirls');
  el.id = localId;

  const swirlArrays = action.swirls;

  const updateSwirlArrays = () => {

    swirlArrays.length = 0;

    Object.values(swirlObjects).forEach(val => {

      swirlArrays.push([
        val.startX,
        val.startY,
        val.innerRadius,
        val.outerRadius,
        val.angle,
        val.easing,
      ]);
    })

    const currentFilter = getWrapper();

    currentFilter.updateDisplayFilter();
    currentFilter.updateHistory();
  };

  const buildSwirlPanel = (swirl, index) => {

    const swirlId = generateUniqueString();

    const [startX, startY, innerRadius, outerRadius, angle, easing] = swirl;

    const swirlData = {
      swirlId,
      startX,
      startY,
      innerRadius,
      outerRadius,
      angle,
      easing,
      localKill: [],
    };

    swirlObjects[swirlId] = swirlData;

    let swirlEl, row1, row2, label, rangeInput, value, listener;

    const localSwirlId = `${localId}_${swirlId}`,
      localSwirlStartX = `${localSwirlId}_start-x`,
      localSwirlStartX_number = `${localSwirlId}_start-x_number`,
      localSwirlStartY = `${localSwirlId}_start-y`,
      localSwirlStartY_number = `${localSwirlId}_start-y_number`,
      localSwirlInnerRadius = `${localSwirlId}_inner-radius`,
      localSwirlInnerRadius_number = `${localSwirlId}_inner-radius_number`,
      localSwirlOuterRadius = `${localSwirlId}_outer-radius`,
      localSwirlOuterRadius_number = `${localSwirlId}_outer-radius_number`,
      localSwirlAngle = `${localSwirlId}_angle`,
      localSwirlAngle_number = `${localSwirlId}_angle_number`,
      localSwirlEasing = `${localSwirlId}_easing`,
      localSwirlDelete = `${localSwirlId}_delete`;

    const localSwirl = document.createElement('div');
    localSwirl.classList.add('swirls-panel');

    const topper = document.createElement('div');
    topper.classList.add('swirls-topper');

    const title = document.createElement('div');
    title.classList.add('swirls-title');
    title.textContent = `Swirl ${index + 1}`;
    topper.appendChild(title);

    const button = document.createElement('button');
    button.classList.add('add-swirl-button');
    button.textContent = `Delete`;
    button.type = 'button';
    button.id = localSwirlDelete;

    listener = scrawlHandle.addNativeListener('click', (e) => {

      if (e) {

        e.preventDefault();

        swirlData.localKill.forEach(item => item());
        delete swirlObjects[swirlId];

        updateSwirlArrays();
      }
    }, button);

    killList.push(listener);
    swirlData.localKill.push(listener);

    topper.appendChild(button);
    localSwirl.appendChild(topper);

    // startX control
    swirlEl = document.createElement('div');
    swirlEl.classList.add('action-control-inputs-for-number');

    row1 = document.createElement('div');
    row1.classList.add('action-control-inputs-for-number-row-1');

    label = document.createElement('label');
    label.classList.add('action-control-visible-label');
    label.textContent = 'Horizontal start';
    label.setAttribute('for', localSwirlStartX);
    row1.appendChild(label);

    value = parseFloat(swirlData.startX);

    const displayedValue_startX = document.createElement('div');
    displayedValue_startX.id = localSwirlStartX_number;
    displayedValue_startX.textContent = `${value}%`;
    row1.appendChild(displayedValue_startX);

    row2 = document.createElement('div');
    row2.classList.add('action-control-inputs-for-number-row-2');

    rangeInput = document.createElement('input');
    rangeInput.id = localSwirlStartX;
    rangeInput.name = localSwirlStartX;
    rangeInput.type = 'range';
    rangeInput.min = '-30';
    rangeInput.max = '130';
    rangeInput.step = '0.1';
    rangeInput.value = `${value}`;
    row2.appendChild(rangeInput);

    swirlEl.appendChild(row1);
    swirlEl.appendChild(row2);

    listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

      if (e && e.target) {

        e.preventDefault();

        const target = e.target,
          value = parseFloat(target.value),
          valueString = `${value}%`;

        swirlData.startX = valueString;

        displayedValue_startX.textContent = valueString;

        updateSwirlArrays();
      }
    }, rangeInput);

    killList.push(listener);
    swirlData.localKill.push(listener);

    localSwirl.appendChild(swirlEl);

    // startY control
    swirlEl = document.createElement('div');
    swirlEl.classList.add('action-control-inputs-for-number');

    row1 = document.createElement('div');
    row1.classList.add('action-control-inputs-for-number-row-1');

    label = document.createElement('label');
    label.classList.add('action-control-visible-label');
    label.textContent = 'Vertical start';
    label.setAttribute('for', localSwirlStartY);
    row1.appendChild(label);

    value = parseFloat(swirlData.startY);

    const displayedValue_startY = document.createElement('div');
    displayedValue_startY.id = localSwirlStartY_number;
    displayedValue_startY.textContent = `${value}%`;
    row1.appendChild(displayedValue_startY);

    row2 = document.createElement('div');
    row2.classList.add('action-control-inputs-for-number-row-2');

    rangeInput = document.createElement('input');
    rangeInput.id = localSwirlStartY;
    rangeInput.name = localSwirlStartY;
    rangeInput.type = 'range';
    rangeInput.min = '-30';
    rangeInput.max = '130';
    rangeInput.step = '0.1';
    rangeInput.value = `${value}`;
    row2.appendChild(rangeInput);

    swirlEl.appendChild(row1);
    swirlEl.appendChild(row2);

    listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

      if (e && e.target) {

        e.preventDefault();

        const target = e.target,
          value = parseFloat(target.value),
          valueString = `${value}%`;

        swirlData.startY = valueString;

        displayedValue_startY.textContent = valueString;

        updateSwirlArrays();
      }
    }, rangeInput);

    killList.push(listener);
    swirlData.localKill.push(listener);

    localSwirl.appendChild(swirlEl);

    // innerRadius control
    swirlEl = document.createElement('div');
    swirlEl.classList.add('action-control-inputs-for-number');

    row1 = document.createElement('div');
    row1.classList.add('action-control-inputs-for-number-row-1');

    label = document.createElement('label');
    label.classList.add('action-control-visible-label');
    label.textContent = 'Inner radius';
    label.setAttribute('for', localSwirlInnerRadius);
    row1.appendChild(label);

    value = parseFloat(swirlData.innerRadius);

    const displayedValue_innerRadius = document.createElement('div');
    displayedValue_innerRadius.id = localSwirlInnerRadius_number;
    displayedValue_innerRadius.textContent = `${value}%`;
    row1.appendChild(displayedValue_innerRadius);

    row2 = document.createElement('div');
    row2.classList.add('action-control-inputs-for-number-row-2');

    rangeInput = document.createElement('input');
    rangeInput.id = localSwirlInnerRadius;
    rangeInput.name = localSwirlInnerRadius;
    rangeInput.type = 'range';
    rangeInput.min = '0';
    rangeInput.max = '100';
    rangeInput.step = '0.1';
    rangeInput.value = `${value}`;
    row2.appendChild(rangeInput);

    swirlEl.appendChild(row1);
    swirlEl.appendChild(row2);

    listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

      if (e && e.target) {

        e.preventDefault();

        const target = e.target,
          value = parseFloat(target.value),
          valueString = `${value}%`;

        swirlData.innerRadius = valueString;

        displayedValue_innerRadius.textContent = valueString;

        updateSwirlArrays();
      }
    }, rangeInput);

    killList.push(listener);
    swirlData.localKill.push(listener);

    localSwirl.appendChild(swirlEl);

    // outerRadius control
    swirlEl = document.createElement('div');
    swirlEl.classList.add('action-control-inputs-for-number');

    row1 = document.createElement('div');
    row1.classList.add('action-control-inputs-for-number-row-1');

    label = document.createElement('label');
    label.classList.add('action-control-visible-label');
    label.textContent = 'Outer radius';
    label.setAttribute('for', localSwirlOuterRadius);
    row1.appendChild(label);

    value = parseFloat(swirlData.outerRadius);

    const displayedValue_outerRadius = document.createElement('div');
    displayedValue_outerRadius.id = localSwirlOuterRadius_number;
    displayedValue_outerRadius.textContent = `${value}%`;
    row1.appendChild(displayedValue_outerRadius);

    row2 = document.createElement('div');
    row2.classList.add('action-control-inputs-for-number-row-2');

    rangeInput = document.createElement('input');
    rangeInput.id = localSwirlOuterRadius;
    rangeInput.name = localSwirlOuterRadius;
    rangeInput.type = 'range';
    rangeInput.min = '0';
    rangeInput.max = '100';
    rangeInput.step = '0.1';
    rangeInput.value = `${value}`;
    row2.appendChild(rangeInput);

    swirlEl.appendChild(row1);
    swirlEl.appendChild(row2);

    listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

      if (e && e.target) {

        e.preventDefault();

        const target = e.target,
          value = parseFloat(target.value),
          valueString = `${value}%`;

        swirlData.outerRadius = valueString;

        displayedValue_outerRadius.textContent = valueString;

        updateSwirlArrays();
      }
    }, rangeInput);

    killList.push(listener);
    swirlData.localKill.push(listener);

    localSwirl.appendChild(swirlEl);

    // angle control
    swirlEl = document.createElement('div');
    swirlEl.classList.add('action-control-inputs-for-number');

    row1 = document.createElement('div');
    row1.classList.add('action-control-inputs-for-number-row-1');

    label = document.createElement('label');
    label.classList.add('action-control-visible-label');
    label.textContent = 'Angle';
    label.setAttribute('for', localSwirlAngle);
    row1.appendChild(label);

    value = parseFloat(swirlData.angle);

    const displayedValue_angle = document.createElement('div');
    displayedValue_angle.id = localSwirlAngle_number;
    displayedValue_angle.textContent = `${value}`;
    row1.appendChild(displayedValue_angle);

    row2 = document.createElement('div');
    row2.classList.add('action-control-inputs-for-number-row-2');

    rangeInput = document.createElement('input');
    rangeInput.id = localSwirlAngle;
    rangeInput.name = localSwirlAngle;
    rangeInput.type = 'range';
    rangeInput.min = '-720';
    rangeInput.max = '720';
    rangeInput.step = '1';
    rangeInput.value = `${value}`;
    row2.appendChild(rangeInput);

    swirlEl.appendChild(row1);
    swirlEl.appendChild(row2);

    listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

      if (e && e.target) {

        e.preventDefault();

        const target = e.target,
          value = parseFloat(target.value);

        swirlData.angle = value;

        displayedValue_angle.textContent = `${value}`;

        updateSwirlArrays();
      }
    }, rangeInput);

    killList.push(listener);
    swirlData.localKill.push(listener);

    localSwirl.appendChild(swirlEl);

    // easing control
    swirlEl = document.createElement('div');
    swirlEl.classList.add('action-control-inputs-for-select');

    label = document.createElement('label');
    label.classList.add('action-control-swirl-easing-select-label');
    label.textContent = 'Swirl easing';
    label.setAttribute('for', localSwirlEasing);
    swirlEl.appendChild(label);

    const easingInput = document.createElement('select');
    easingInput.id = localSwirlEasing;
    easingInput.name = localSwirlEasing;

    ['linear', 'easeOut', 'easeOutIn', 'easeInOut', 'easeIn'].forEach(val => {

      const option = document.createElement('option');
      option.value = val;
      option.textContent = val;
      easingInput.appendChild(option);
    });

    easingInput.value = swirlData.easing;

    swirlEl.appendChild(easingInput);

    listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

      if (e && e.target) {

        e.preventDefault();

        const target = e.target,
          value = target.value;

        swirlData.easing = value;

        updateSwirlArrays();
      }
    }, easingInput);

    killList.push(listener);
    swirlData.localKill.push(listener);

    localSwirl.appendChild(swirlEl);
    swirlData.localKill.push(() => localSwirl.remove());

    el.appendChild(localSwirl);
  };

  swirlArrays.forEach((swirl, index) => buildSwirlPanel(swirl, index));

  const addSwirlButton = document.createElement('button');
  addSwirlButton.classList.add('add-swirl-button');
  addSwirlButton.textContent = `Add a new swirl`;
  addSwirlButton.type = 'button';

  el.appendChild(addSwirlButton);

  const addSwirlButtonListener = scrawlHandle.addNativeListener('click', (e) => {

    if (e) {

      e.preventDefault();

      buildSwirlPanel(['50%', '50%', 0, '30%', 0, 'linear'], swirlArrays.length);

      updateSwirlArrays();
    }
  }, addSwirlButton);

  killList.push(addSwirlButtonListener);

  return el;
};


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


const createControl_unitColor = (data, actionWrapper) => {

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

  initialVal = colorFactory.convertRGBtoHex(
    Math.floor(redVal * 256), 
    Math.floor(greenVal * 256), 
    Math.floor(blueVal * 256),
  );

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
  redInput.max = 1;
  redInput.step = 0.001;
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
  greenInput.max = 1;
  greenInput.step = 0.001;
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
  blueInput.max = 1;
  blueInput.step = 0.001;
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

      let [redValue, greenValue, blueValue] = colorFactory.extractRGBfromColorString(hexValue);

      redValue = parseInt(redValue, 10) / 256;
      greenValue = parseInt(greenValue, 10) / 256;
      blueValue = parseInt(blueValue, 10) / 256;

      redInput.value = redValue.toFixed(3);
      greenInput.value = greenValue.toFixed(3);
      blueInput.value = blueValue.toFixed(3);

      actionWrapper.set({
        [data.alternativeFor[0]]: redValue,
        [data.alternativeFor[1]]: greenValue,
        [data.alternativeFor[2]]: blueValue,
      });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, colorInput);

  const rgbListener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const redValue = parseFloat(redInput.value),
        greenValue = parseFloat(greenInput.value),
        blueValue = parseFloat(blueInput.value);

      const redValueInt = Math.floor(redVal * 256),
        greenValueInt = Math.floor(greenValue * 256),
        blueValueInt = Math.floor(blueValue * 256);

      colorInput.value = colorFactory.convertRGBtoHex(redValueInt, greenValueInt, blueValueInt);

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

  const { formId, killList } = actionWrapper;

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

const createControl_matrixWeights = (data, actionWrapper) => {

  const getCorrectedValue = (value) => {

    const defaultValue = [];

    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {

      if (value[0] === '[') {

        try {

          const testValue = JSON.parse(value)

          if (Array.isArray(testValue)) return testValue;
          return defaultValue;
        }
        catch (e) {
        
          return defaultValue;
        }
      }

      const testValue = value.split(',');

      if (Array.isArray(testValue)) return testValue;
      return defaultValue;
    }
  };

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-matrix');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  let value = getCorrectedValue(actionWrapper.action[data.key]);
  if (value == null) value = data.default;

  const input = document.createElement('textarea');
  input.id = localId;
  input.name = localId;
  input['data-lpignore'] = 'true';
  input.value = value.join(',');
  input.textContent = value.join(',');
  input.autocomplete = 'off';
  input.autocorrect = 'off';
  input.spellcheck = false;
  input.wrap = 'soft';
  input.rows = 3;
  el.appendChild(input);

  const message = document.createElement('div');
  message.innerHTML = 'Weight values, separated by commas &ndash; the number of weights must match the area of the matrix';
  message.classList.add('small-field-message');
  el.appendChild(message);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const val = getCorrectedValue(input.value);

      actionWrapper.set({
        [data.key]: val,
      });

      const requiredLength = actionWrapper.action.width * actionWrapper.action.height,
        actualLength = val.length,
        areAllNumbers = val.every(item => isFinite(parseFloat(item)));

      if (actualLength !== requiredLength || !areAllNumbers) el.classList.add('matrix-incorrect-length');
      else el.classList.remove('matrix-incorrect-length');

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, input);

  killList.push(listener);

  return el;
};

const createControl_colorRanges = (data, actionWrapper) => {

  const getCorrectedValue = (value) => {

    const defaultValue = [];

    if (typeof value === 'string') {

      try {

        value = JSON.parse(value);
        if (!Array.isArray(value)) value = defaultValue;
      }
      catch (e) { value = defaultValue; }
    }

    if (!Array.isArray(value)) value = defaultValue;

    const filteredValue = value.filter(item => {

      if (!Array.isArray(item)) return false;
      if (!item.length === 6) return false;

      let flag = true;
      for (let i = 0; i < 6; i++) {

        const v = item[i];

        if (typeof v !== 'number') {
          flag = false;
          break;
        }
        if (!Number.isSafeInteger(v)) {
          flag = false;
          break;
        }
        if (v < 0 || v > 255) {
          flag = false;
          break;
        }
      }
      return flag;
    });

    return filteredValue;
  };

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-color-ranges');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  let value = actionWrapper.action[data.key];
  value = JSON.stringify(getCorrectedValue(value));

  const input = document.createElement('input');
  input.id = localId;
  input.name = localId;
  input.type = 'text';
  input.autocomplete = 'new-password';
  input['data-lpignore'] = 'true';
  input.value = value;
  el.appendChild(input);

  const message = document.createElement('div');
  message.innerHTML = 'Add color ranges as an array of 6 integers between 0 and 255 in the form <span class="monospace-font">[lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue]</span> &ndash; each array separated by a comma';
  message.classList.add('small-field-message');
  el.appendChild(message);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const value = getCorrectedValue(e.target.value);

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

const createControl_channelLevels = (data, actionWrapper) => {

  const getCorrectedValue = (value) => {

    const defaultValue = [];

    if (Array.isArray(value)) return value;

    if (typeof value === 'string') {

      if (value[0] === '[') {

        try {

          const testValue = JSON.parse(value)

          if (Array.isArray(testValue)) return testValue;
          return defaultValue;
        }
        catch (e) {
        
          return defaultValue;
        }
      }

      const testValue = value.split(',');

      if (Array.isArray(testValue)) return testValue;
      return defaultValue;
    }
  };

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-channel-levels');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  let value = getCorrectedValue(actionWrapper.action[data.key]);

  const input = document.createElement('input');
  input.id = localId;
  input.name = localId;
  input.type = 'text';
  input.autocomplete = 'new-password';
  input['data-lpignore'] = 'true';
  input.value = value.join(',');
  el.appendChild(input);

  const message = document.createElement('div');
  message.innerHTML = 'Integer numbers 0-255, separated by commas';
  message.classList.add('small-field-message');
  el.appendChild(message);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const value = getCorrectedValue(e.target.value);

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

const createControl_reducePalette = (data, actionWrapper) => {

  const getCorrectedValue = (value) => {

    const defaultValue = 'black-white';

    if (Array.isArray(value)) return value;

    if(typeof value === 'number') return value;

    if (typeof value === 'string') {

      if (['black-white', 'monochrome-4', 'monochrome-8', 'monochrome-16'].includes(value)) return value;

      const numberValue = parseInt(value, 10);
      if(!isNaN(numberValue) && Number.isInteger(numberValue)) return numberValue;

      if (value[0] === '[') {

        try {

          const testValue = JSON.parse(value)

          if (Array.isArray(testValue)) return testValue;
          return defaultValue;
        }
        catch (e) {
        
          return defaultValue;
        }
      }

      const testValue = value.split(',');

      if (Array.isArray(testValue)) return testValue;
      return defaultValue;
    }

    return defaultValue;
  };

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-reduce-palette');
  el.dataset.localId = localId;

  const label = document.createElement('label');
  label.textContent = data.label;
  label.setAttribute('for', localId);
  el.appendChild(label);

  const value = getCorrectedValue(actionWrapper.action[data.key]),
    inputValue = (typeof value === 'string') 
      ? value
      : (Array.isArray(value))
        ? value.join(',')
        : `${value}`;

  const input = document.createElement('textarea');
  input.id = localId;
  input.name = localId;
  input.value = inputValue;
  input.textContent = inputValue;
  input.autocomplete = 'off';
  input.autocorrect = 'off';
  input.spellcheck = false;
  input.wrap = 'soft';
  input.rows = 3;
  input['data-lpignore'] = 'true';
  el.appendChild(input);

  const message = document.createElement('div');
  message.innerHTML = `Input can be in the form of:
<ul>
  <li>A single number value (commonest colors &ndash; will vary depending on viewport position)</li>
  <li>A series of comma separated CSS color values</li>
  <li>A preset string: "black-white"; "monochrome-4"; "monochrome-8"; "monochrome-16"</li>
</ul>`;
  message.classList.add('small-field-message');
  el.appendChild(message);

  const paletteButton = document.createElement('button');
  paletteButton.type = 'button';
  paletteButton.textContent = 'Copy current palette CSS color values';
  paletteButton.classList.add('copy-current-colors');
  el.appendChild(paletteButton);

  const copier = scrawlHandle.addNativeListener('click', async () => {

    const palette = scrawlHandle.getLastUsedReducePalette();

    try { await navigator.clipboard.writeText(palette); }
    catch (error) { console.log(error.message); }

  }, paletteButton);

  const listener = scrawlHandle.addNativeListener(['change', 'input'], (e) => {

    if (e && e.target) {

      e.preventDefault();

      const value = getCorrectedValue(e.target.value);

      actionWrapper.set({
        [data.key]: value,
      });

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, input);

  killList.push(copier, listener);

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

  const localId = `${formId}_${data.key}`,
    localId_number = `${localId}_number`,
    localId_range = `${localId}_range`;

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-number');
  el.dataset.localId = localId;

  const row1 = document.createElement('div');
  row1.classList.add('action-control-inputs-for-number-row-1');

  const label = document.createElement('label');
  label.classList.add('action-control-visible-label');
  label.textContent = data.label;
  label.setAttribute('for', localId_range);
  row1.appendChild(label);

  const displayedValue = document.createElement('div');
  displayedValue.id = localId_number;
  displayedValue.textContent = `${value}`;
  row1.appendChild(displayedValue);

  const row2 = document.createElement('div');
  row2.classList.add('action-control-inputs-for-number-row-2');

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

      if (data.alternativeFor && Array.isArray(data.alternativeFor)) {

        data.alternativeFor.forEach(alt => actionWrapper.set({ [alt]: value }));
      }
      else actionWrapper.set({ [data.key]: value });

      displayedValue.textContent = `${value}`;

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, rangeInput);

  killList.push(listener);

  return el;
};


const createControl_percentageNumber = (data, actionWrapper) => {

  const {formId, killList } = actionWrapper;

  const localId = `${formId}_${data.key}`,
    localId_number = `${localId}_number`,
    localId_range = `${localId}_range`;

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;
  value = (typeof value === 'string') ? parseFloat(value) : value;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-number');
  el.dataset.localId = localId;

  const row1 = document.createElement('div');
  row1.classList.add('action-control-inputs-for-number-row-1');

  const label = document.createElement('label');
  label.classList.add('action-control-visible-label');
  label.textContent = data.label;
  label.setAttribute('for', localId_range);
  row1.appendChild(label);

  const displayedValue = document.createElement('div');
  displayedValue.id = localId_number;
  displayedValue.textContent = `${value}%`;
  row1.appendChild(displayedValue);

  const row2 = document.createElement('div');
  row2.classList.add('action-control-inputs-for-number-row-2');

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

      if (data.alternativeFor && Array.isArray(data.alternativeFor)) {

        data.alternativeFor.forEach(alt => actionWrapper.set({ [alt]: `${value}%` }));
      }
      else actionWrapper.set({ [data.key]: `${value}%` });

      displayedValue.textContent = `${value}%`;

      const currentFilter = getWrapper();

      currentFilter.updateDisplayFilter();
      currentFilter.updateHistory();
    }
  }, rangeInput);

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

const createControl_channelWeights = (data, actionWrapper) => {

  const {formId } = actionWrapper;

  const localId = `${formId}_${data.key}`,
    canvasId = `${localId}_canvas`;

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-color-curve-weights');
  el.dataset.localId = localId;

  const canvasEl = document.createElement('canvas');
  canvasEl.id = canvasId;
  canvasEl.name = canvasId;
  canvasEl.width = '250';
  canvasEl.height = '250';
  canvasEl.setAttribute('data-scrawl-canvas', '');
  canvasEl.setAttribute('data-base-background-color', 'beige');
  canvasEl.setAttribute('data-base-width', '1000');
  canvasEl.setAttribute('data-base-height', '1000');
  canvasEl.setAttribute('data-is-responsive', 'true');
  canvasEl.setAttribute('data-fit', 'contain');
  canvasEl.setAttribute('data-label', 'Channel weights graphical input tool');
  canvasEl.classList.add('color-curve-weights-ui');
  el.appendChild(canvasEl);

  const controlWrapper = document.createElement('div');
  controlWrapper.classList.add('color-curve-weights-control-wrapper');

  const channelSelectorLabel = document.createElement('label');
  channelSelectorLabel.classList.add('hidden-label');
  channelSelectorLabel.textContent = 'Select channel to manipulate';
  channelSelectorLabel.setAttribute('for', `${localId}_channel-selector`);
  el.appendChild(channelSelectorLabel);

  const channelSelector = document.createElement('select');
  channelSelector.id = `${localId}_channel-selector`;
  channelSelector.name = `${localId}_channel-selector`;
  channelSelector.classList.add('channel-selector');

  const channels = ['Combined', 'Red', 'Green', 'Blue'];
  channels.forEach(channel => {
    const option = document.createElement('option');
    option.value = channel.toLowerCase();
    option.textContent = channel;
    channelSelector.appendChild(option);
  });

  channelSelector.value = 'combined';
  controlWrapper.appendChild(channelSelector);

  const labelX = document.createElement('div');
  labelX.textContent = 'X coord';
  controlWrapper.appendChild(labelX);

  const labelY = document.createElement('div');
  labelY.textContent = 'Y coord';
  controlWrapper.appendChild(labelY);

  const labelStart = document.createElement('div');
  labelStart.textContent = 'Start pin';
  controlWrapper.appendChild(labelStart);

  const inputStartXLabel = document.createElement('label');
  inputStartXLabel.classList.add('hidden-label');
  inputStartXLabel.textContent = 'Start pin X coordinate';
  inputStartXLabel.setAttribute('for', `${localId}_start-x`);
  el.appendChild(inputStartXLabel);

  const inputStartX = document.createElement('input');
  inputStartX.id = `${localId}_start-x`;
  inputStartX.name = `${localId}_start-x`;
  inputStartX.type = 'number';
  inputStartX.min = 0;
  inputStartX.max = 999;
  inputStartX.step = 1;
  inputStartX.value = 0;
  inputStartX.setAttribute('disabled', '');
  controlWrapper.appendChild(inputStartX);

  const inputStartYLabel = document.createElement('label');
  inputStartYLabel.classList.add('hidden-label');
  inputStartYLabel.textContent = 'Start pin Y coordinate';
  inputStartYLabel.setAttribute('for', `${localId}_start-y`);
  el.appendChild(inputStartYLabel);

  const inputStartY = document.createElement('input');
  inputStartY.id = `${localId}_start-y`;
  inputStartY.name = `${localId}_start-y`;
  inputStartY.type = 'number';
  inputStartY.min = 0;
  inputStartY.max = 999;
  inputStartY.step = 1;
  inputStartY.value = 999;
  inputStartY.classList.add('channel-input');
  controlWrapper.appendChild(inputStartY);

  const labelStartControl = document.createElement('div');
  labelStartControl.textContent = 'Start control pin';
  controlWrapper.appendChild(labelStartControl);

  const inputStartControlXLabel = document.createElement('label');
  inputStartControlXLabel.classList.add('hidden-label');
  inputStartControlXLabel.textContent = 'Start control pin X coordinate';
  inputStartControlXLabel.setAttribute('for', `${localId}_start-control-x`);
  el.appendChild(inputStartControlXLabel);

  const inputStartControlX = document.createElement('input');
  inputStartControlX.id = `${localId}_start-control-x`;
  inputStartControlX.name = `${localId}_start-control-x`;
  inputStartControlX.type = 'number';
  inputStartControlX.min = 0;
  inputStartControlX.max = 999;
  inputStartControlX.step = 1;
  inputStartControlX.value = 333;
  inputStartControlX.classList.add('channel-input');
  controlWrapper.appendChild(inputStartControlX);

  const inputStartControlYLabel = document.createElement('label');
  inputStartControlYLabel.classList.add('hidden-label');
  inputStartControlYLabel.textContent = 'Start control pin Y coordinate';
  inputStartControlYLabel.setAttribute('for', `${localId}_start-control-y`);
  el.appendChild(inputStartControlYLabel);

  const inputStartControlY = document.createElement('input');
  inputStartControlY.id = `${localId}_start-control-y`;
  inputStartControlY.name = `${localId}_start-control-y`;
  inputStartControlY.type = 'number';
  inputStartControlY.min = 0;
  inputStartControlY.max = 999;
  inputStartControlY.step = 1;
  inputStartControlY.value = 666;
  inputStartControlY.classList.add('channel-input');
  controlWrapper.appendChild(inputStartControlY);

  const labelEndControl = document.createElement('div');
  labelEndControl.textContent = 'End control pin';
  controlWrapper.appendChild(labelEndControl);

  const inputEndControlXLabel = document.createElement('label');
  inputEndControlXLabel.classList.add('hidden-label');
  inputEndControlXLabel.textContent = 'End control pin X coordinate';
  inputEndControlXLabel.setAttribute('for', `${localId}_end-control-x`);
  el.appendChild(inputEndControlXLabel);

  const inputEndControlX = document.createElement('input');
  inputEndControlX.id = `${localId}_end-control-x`;
  inputEndControlX.name = `${localId}_end-control-x`;
  inputEndControlX.type = 'number';
  inputEndControlX.min = 0;
  inputEndControlX.max = 999;
  inputEndControlX.step = 1;
  inputEndControlX.value = 666;
  inputEndControlX.classList.add('channel-input');
  controlWrapper.appendChild(inputEndControlX);

  const inputEndControlYLabel = document.createElement('label');
  inputEndControlYLabel.classList.add('hidden-label');
  inputEndControlYLabel.textContent = 'End control pin Y coordinate';
  inputEndControlYLabel.setAttribute('for', `${localId}_end-control-y`);
  el.appendChild(inputEndControlYLabel);

  const inputEndControlY = document.createElement('input');
  inputEndControlY.id = `${localId}_end-control-y`;
  inputEndControlY.name = `${localId}_end-control-y`;
  inputEndControlY.type = 'number';
  inputEndControlY.min = 0;
  inputEndControlY.max = 999;
  inputEndControlY.step = 1;
  inputEndControlY.value = 333;
  inputEndControlY.classList.add('channel-input');
  controlWrapper.appendChild(inputEndControlY);

  const labelEnd = document.createElement('div');
  labelEnd.textContent = 'End pin';
  controlWrapper.appendChild(labelEnd);

  const inputEndXLabel = document.createElement('label');
  inputEndXLabel.classList.add('hidden-label');
  inputEndXLabel.textContent = 'End pin X coordinate';
  inputEndXLabel.setAttribute('for', `${localId}_end-x`);
  el.appendChild(inputEndXLabel);

  const inputEndX = document.createElement('input');
  inputEndX.id = `${localId}_end-x`;
  inputEndX.name = `${localId}_end-x`;
  inputEndX.type = 'number';
  inputEndX.min = 0;
  inputEndX.max = 999;
  inputEndX.step = 1;
  inputEndX.value = 999;
  inputEndX.setAttribute('disabled', '');
  controlWrapper.appendChild(inputEndX);

  const inputEndYLabel = document.createElement('label');
  inputEndYLabel.classList.add('hidden-label');
  inputEndYLabel.textContent = 'End pin Y coordinate';
  inputEndYLabel.setAttribute('for', `${localId}_end-y`);
  el.appendChild(inputEndYLabel);

  const inputEndY = document.createElement('input');
  inputEndY.id = `${localId}_end-y`;
  inputEndY.name = `${localId}_end-y`;
  inputEndY.type = 'number';
  inputEndY.min = 0;
  inputEndY.max = 999;
  inputEndY.step = 1;
  inputEndY.value = 0;
  inputEndY.classList.add('channel-input');
  controlWrapper.appendChild(inputEndY);

  el.appendChild(controlWrapper);

  return el;
};

const createControl_toneWeights = (data, actionWrapper) => {

  const {formId } = actionWrapper;

  const localId = `${formId}_${data.key}`,
    canvasId = `${localId}_canvas`;

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-tone-curve-weights');
  el.dataset.localId = localId;

  const canvasEl = document.createElement('canvas');
  canvasEl.id = canvasId;
  canvasEl.name = canvasId;
  canvasEl.width = '250';
  canvasEl.height = '250';
  canvasEl.setAttribute('data-scrawl-canvas', '');
  canvasEl.setAttribute('data-base-background-color', 'beige');
  canvasEl.setAttribute('data-base-width', '1000');
  canvasEl.setAttribute('data-base-height', '1000');
  canvasEl.setAttribute('data-is-responsive', 'true');
  canvasEl.setAttribute('data-fit', 'contain');
  canvasEl.setAttribute('data-label', 'Tone curve weights graphical input tool');
  canvasEl.classList.add('tone-curve-weights-ui');
  el.appendChild(canvasEl);

  const controlWrapper = document.createElement('div');
  controlWrapper.classList.add('tone-curve-weights-control-wrapper');

  const channelSelectorLabel = document.createElement('label');
  channelSelectorLabel.classList.add('hidden-label');
  channelSelectorLabel.textContent = 'Select channel to manipulate';
  channelSelectorLabel.setAttribute('for', `${localId}_channel-selector`);
  el.appendChild(channelSelectorLabel);

  const channelSelector = document.createElement('select');
  channelSelector.id = `${localId}_channel-selector`;
  channelSelector.name = `${localId}_channel-selector`;
  channelSelector.classList.add('channel-selector');

  const channels = [
    ['Luminance', 'luminance'],
    ['Chroma', 'chroma'],
    ['Red ↔ green', 'aChannel'],
    ['Blue ↔ yellow', 'bChannel']
  ];
  channels.forEach(channel => {
    const option = document.createElement('option');
    option.value = channel[1];
    option.textContent = channel[0];
    channelSelector.appendChild(option);
  });

  channelSelector.value = 'luminance';
  controlWrapper.appendChild(channelSelector);

  const labelX = document.createElement('div');
  labelX.textContent = 'X coord';
  controlWrapper.appendChild(labelX);

  const labelY = document.createElement('div');
  labelY.textContent = 'Y coord';
  controlWrapper.appendChild(labelY);

  const labelStart = document.createElement('div');
  labelStart.textContent = 'Start pin';
  controlWrapper.appendChild(labelStart);

  const inputStartXLabel = document.createElement('label');
  inputStartXLabel.classList.add('hidden-label');
  inputStartXLabel.textContent = 'Start pin X coordinate';
  inputStartXLabel.setAttribute('for', `${localId}_start-x`);
  el.appendChild(inputStartXLabel);

  const inputStartX = document.createElement('input');
  inputStartX.id = `${localId}_start-x`;
  inputStartX.name = `${localId}_start-x`;
  inputStartX.type = 'number';
  inputStartX.min = 0;
  inputStartX.max = 999;
  inputStartX.step = 1;
  inputStartX.value = 0;
  inputStartX.setAttribute('disabled', '');
  controlWrapper.appendChild(inputStartX);

  const inputStartYLabel = document.createElement('label');
  inputStartYLabel.classList.add('hidden-label');
  inputStartYLabel.textContent = 'Start pin Y coordinate';
  inputStartYLabel.setAttribute('for', `${localId}_start-y`);
  el.appendChild(inputStartYLabel);

  const inputStartY = document.createElement('input');
  inputStartY.id = `${localId}_start-y`;
  inputStartY.name = `${localId}_start-y`;
  inputStartY.type = 'number';
  inputStartY.min = 0;
  inputStartY.max = 999;
  inputStartY.step = 1;
  inputStartY.value = 999;
  inputStartY.classList.add('channel-input');
  controlWrapper.appendChild(inputStartY);

  const labelStartControl = document.createElement('div');
  labelStartControl.textContent = 'Start control pin';
  controlWrapper.appendChild(labelStartControl);

  const inputStartControlXLabel = document.createElement('label');
  inputStartControlXLabel.classList.add('hidden-label');
  inputStartControlXLabel.textContent = 'Start control pin X coordinate';
  inputStartControlXLabel.setAttribute('for', `${localId}_start-control-x`);
  el.appendChild(inputStartControlXLabel);

  const inputStartControlX = document.createElement('input');
  inputStartControlX.id = `${localId}_start-control-x`;
  inputStartControlX.name = `${localId}_start-control-x`;
  inputStartControlX.type = 'number';
  inputStartControlX.min = 0;
  inputStartControlX.max = 999;
  inputStartControlX.step = 1;
  inputStartControlX.value = 333;
  inputStartControlX.classList.add('channel-input');
  controlWrapper.appendChild(inputStartControlX);

  const inputStartControlYLabel = document.createElement('label');
  inputStartControlYLabel.classList.add('hidden-label');
  inputStartControlYLabel.textContent = 'Start control pin Y coordinate';
  inputStartControlYLabel.setAttribute('for', `${localId}_start-control-y`);
  el.appendChild(inputStartControlYLabel);

  const inputStartControlY = document.createElement('input');
  inputStartControlY.id = `${localId}_start-control-y`;
  inputStartControlY.name = `${localId}_start-control-y`;
  inputStartControlY.type = 'number';
  inputStartControlY.min = 0;
  inputStartControlY.max = 999;
  inputStartControlY.step = 1;
  inputStartControlY.value = 666;
  inputStartControlY.classList.add('channel-input');
  controlWrapper.appendChild(inputStartControlY);

  const labelEndControl = document.createElement('div');
  labelEndControl.textContent = 'End control pin';
  controlWrapper.appendChild(labelEndControl);

  const inputEndControlXLabel = document.createElement('label');
  inputEndControlXLabel.classList.add('hidden-label');
  inputEndControlXLabel.textContent = 'End control pin X coordinate';
  inputEndControlXLabel.setAttribute('for', `${localId}_end-control-x`);
  el.appendChild(inputEndControlXLabel);

  const inputEndControlX = document.createElement('input');
  inputEndControlX.id = `${localId}_end-control-x`;
  inputEndControlX.name = `${localId}_end-control-x`;
  inputEndControlX.type = 'number';
  inputEndControlX.min = 0;
  inputEndControlX.max = 999;
  inputEndControlX.step = 1;
  inputEndControlX.value = 666;
  inputEndControlX.classList.add('channel-input');
  controlWrapper.appendChild(inputEndControlX);

  const inputEndControlYLabel = document.createElement('label');
  inputEndControlYLabel.classList.add('hidden-label');
  inputEndControlYLabel.textContent = 'End control pin Y coordinate';
  inputEndControlYLabel.setAttribute('for', `${localId}_end-control-y`);
  el.appendChild(inputEndControlYLabel);

  const inputEndControlY = document.createElement('input');
  inputEndControlY.id = `${localId}_end-control-y`;
  inputEndControlY.name = `${localId}_end-control-y`;
  inputEndControlY.type = 'number';
  inputEndControlY.min = 0;
  inputEndControlY.max = 999;
  inputEndControlY.step = 1;
  inputEndControlY.value = 333;
  inputEndControlY.classList.add('channel-input');
  controlWrapper.appendChild(inputEndControlY);

  const labelEnd = document.createElement('div');
  labelEnd.textContent = 'End pin';
  controlWrapper.appendChild(labelEnd);

  const inputEndXLabel = document.createElement('label');
  inputEndXLabel.classList.add('hidden-label');
  inputEndXLabel.textContent = 'End pin X coordinate';
  inputEndXLabel.setAttribute('for', `${localId}_end-x`);
  el.appendChild(inputEndXLabel);

  const inputEndX = document.createElement('input');
  inputEndX.id = `${localId}_end-x`;
  inputEndX.name = `${localId}_end-x`;
  inputEndX.type = 'number';
  inputEndX.min = 0;
  inputEndX.max = 999;
  inputEndX.step = 1;
  inputEndX.value = 999;
  inputEndX.setAttribute('disabled', '');
  controlWrapper.appendChild(inputEndX);

  const inputEndYLabel = document.createElement('label');
  inputEndYLabel.classList.add('hidden-label');
  inputEndYLabel.textContent = 'End pin Y coordinate';
  inputEndYLabel.setAttribute('for', `${localId}_end-y`);
  el.appendChild(inputEndYLabel);

  const inputEndY = document.createElement('input');
  inputEndY.id = `${localId}_end-y`;
  inputEndY.name = `${localId}_end-y`;
  inputEndY.type = 'number';
  inputEndY.min = 0;
  inputEndY.max = 999;
  inputEndY.step = 1;
  inputEndY.value = 0;
  inputEndY.classList.add('channel-input');
  controlWrapper.appendChild(inputEndY);

  el.appendChild(controlWrapper);

  return el;
};

const createControl_gradient = (data, actionWrapper) => {

  const {formId } = actionWrapper;

  const localId = `${formId}_${data.key}`,
    canvasId = `${localId}_canvas`,
    wrapperId = `${localId}_wrapper`;

  let value = actionWrapper.action[data.key];
  if (value == null) value = data.default;

  let gradientName = actionWrapper.action.gradient;
  if(typeof gradientName !== 'string') gradientName = gradientName.name || '';

  const el = document.createElement('div');
  el.classList.add('action-control-inputs-for-map-to-gradient');
  el.dataset.localId = localId;

  const canvasEl = document.createElement('canvas');
  canvasEl.id = canvasId;
  canvasEl.name = canvasId;
  canvasEl.width = '250';
  canvasEl.height = '50';
  canvasEl.setAttribute('data-scrawl-canvas', '');
  canvasEl.setAttribute('data-base-background-color', 'beige');
  canvasEl.setAttribute('data-base-width', '1000');
  canvasEl.setAttribute('data-base-height', '200');
  canvasEl.setAttribute('data-is-responsive', 'true');
  canvasEl.setAttribute('data-fit', 'contain');
  canvasEl.setAttribute('data-label', 'Gradient graphical input tool');
  canvasEl.setAttribute('data-gradient', gradientName);
  canvasEl.classList.add('gradient-ui');
  el.appendChild(canvasEl);

  const controlWrapper = document.createElement('div');
  controlWrapper.id = wrapperId;
  controlWrapper.classList.add('gradient-controls-wrapper');

  el.appendChild(controlWrapper);

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

            // Import filter form canvas elements into SC
            else if (mutation.target.id === 'filter-controls-panel') {

              // Only process the element once
              if (!node.dataset.scAdopted) {

                node.dataset.scAdopted = '1';

                const canvasEl = node.querySelector('canvas');

                if (canvasEl != null) {

                  const formCanvas = scrawl.getCanvas(canvasEl.id);

                  if (formCanvas != null) {

                    actionWrapper.killList.push(formCanvas);

                    const classes = canvasEl.className.split(' ');

                    if (classes.includes('color-curve-weights-ui')) buildColorCurveComponent(actionWrapper, formCanvas);

                    else if (classes.includes('tone-curve-weights-ui')) buildToneCurveComponent(actionWrapper, formCanvas);

                    else if (classes.includes('gradient-ui')) buildGradientComponent(actionWrapper, formCanvas, colorFactory);
                  }
                }
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
  return {};
};


// Development
// ------------------------------------------------------------------------

