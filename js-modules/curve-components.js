// ------------------------------------------------------------------------
// Curve components - canvas-based UI controls
// ------------------------------------------------------------------------


let scrawlHandle = null,
  getWrapper = null;


// Color curve filter canvas UI
export const buildColorCurveComponent = (actionWrapper, canvas) => {

  // Build out pins
  const channelNames = ['combined', 'red', 'green', 'blue'];
  const positionsData = [
    ['start', 0, 999],
    ['first-control', 333, 666],
    ['second-control', 666, 333],
    ['end', 999, 0],
  ];

  const { id, formElement } = actionWrapper;

  const weights = [];

  const selector = formElement.querySelector('.channel-selector');
  const inputElements = formElement.querySelectorAll('.channel-input');
  const input = {};

  [...inputElements].forEach(el => {

    const id = el.id;
    if (id.includes('start-y')) input['start-y'] = el;
    else if (id.includes('start-control-x')) input['start-control-x'] = el;
    else if (id.includes('start-control-y')) input['start-control-y'] = el;
    else if (id.includes('end-control-x')) input['end-control-x'] = el;
    else if (id.includes('end-control-y')) input['end-control-y'] = el;
    else if (id.includes('end-y')) input['end-y'] = el;
  })

  const groups = {},
    beziers = {};


  // Build out the graphical entitys
  channelNames.forEach(channel => {

    const mainName = `${id}_${channel}_pin`;


    // Channels each get their own group
    groups[channel] = scrawlHandle.makeGroup({

      name: `${mainName}_group`,
      host: canvas.base,
      visibility: channel === 'combined',
    });


    // Each channel gets four draggable pins
    positionsData.forEach(pos => {

      const [label, x, y] = pos;

      const instanceName = `${mainName}_${label}`;

      scrawlHandle.makeWheel({

        name: instanceName,
        group: groups[channel],
        start: [x, y],
        handle: ['center', 'center'],
        fillStyle: channel === 'combined' ? 'black' : channel,
        strokeStyle: 'gold',
        method: 'fillThenDraw',
        radius: 40,
      });
    });


    // Each channel gets its own bezier curve
    // - Curve shape determined by the draggable pins
    beziers[channel] = scrawlHandle.makeBezier({

      name: `${id}_${channel}_curve`,
      strokeStyle: channel === 'combined' ? 'black' : channel,
      lineWidth: 6,
      method: 'draw',
      order: 3,

      pivot: `${mainName}_start`,
      lockTo: 'pivot',

      startControlPivot: `${mainName}_first-control`,
      startControlLockTo: 'pivot',

      endControlPivot: `${mainName}_second-control`,
      endControlLockTo: 'pivot',

      endPivot: `${mainName}_end`,
      endLockTo: 'pivot',

      useStartAsControlPoint: true,
      useAsPath: true,

      visibility: channel === 'combined',
    });
  });


  // Drag zone function
  let draggedPin = false;
  let currentPin = false;

  const clampVal = (val) => {

    val = Math.round(val);

    if (val < 0) return 0;
    if (val > 999) return 999;
    return val;
  }

  const buildDragZone = (channel) => {

    if (typeof currentPin === 'function') currentPin(true);

    currentPin = scrawlHandle.makeDragZone({

      zone: canvas,
      collisionGroup: groups[channel],
      endOn: ['up', 'leave'],
      exposeCurrentArtefact: true,
      preventTouchDefaultWhenDragging: true,

      updateOnStart: () => {

        draggedPin = currentPin();

        if (typeof draggedPin !== 'boolean' && draggedPin) {

          const pin = draggedPin.artefact,
            name = pin.name;

          // The start and end pins can only be dragged vertically
          if (name.indexOf('start') > 0 || name.indexOf('end') > 0) {

            pin.isBeingDragged = false;
            pin.set({
              lockYTo: 'mouse',
            });
          }
        }
      },

      updateWhileMoving: () => {

          const pin = draggedPin.artefact,
            name = pin.name;

        let [x, y] = pin.get('position');

        x = clampVal(x);
        y = clampVal(y);

        if (name.indexOf('start') > 0) input['start-y'].value = y;
        else if (name.indexOf('first-control') > 0) {
          
          input['start-control-x'].value = x;
          input['start-control-y'].value = y;
        }
        else if (name.indexOf('second-control') > 0) {
          
          input['end-control-x'].value = x;
          input['end-control-y'].value = y;
        }
        else if (name.indexOf('end') >0) input['end-y'].value = y;

        recalculateWeights();
      },

      updateOnEnd: () => {

        if (typeof draggedPin !== 'boolean' && draggedPin) {

          const pin = draggedPin.artefact,
            name = pin.name;

          // The start and end pins can only be dragged vertically
          if (name.indexOf('start') > 0 || name.indexOf('end') > 0) {

            pin.set({
              start: pin.get('position'),
              lockYTo: 'start',
            });
          }

          let [x, y] = pin.get('position');

          x = clampVal(x);
          y = clampVal(y);

          if (name.indexOf('start') > 0) input['start-y'].value = y;
          else if (name.indexOf('first-control') > 0) {
            
            input['start-control-x'].value = x;
            input['start-control-y'].value = y;
          }
          else if (name.indexOf('second-control') > 0) {
            
            input['end-control-x'].value = x;
            input['end-control-y'].value = y;
          }
          else if (name.indexOf('end') >0) input['end-y'].value = y;
        }
        draggedPin = false;

        recalculateWeights();
      },
    });
  };


  // Get the recalculateWeights function
  const recalculateWeights = recalculateColorWeights(actionWrapper, weights);

  buildDragZone('combined');

  const animation = scrawlHandle.makeRender({

    name: `${canvas.name}_animation`,
    target: canvas,
  });


  // Form event listeners 
  let currentChannel = 'combined';

  const channelSelector = scrawlHandle.addNativeListener('change', (e) => {

    if (e) e.preventDefault();

    currentChannel = selector.value;

    if ('combined' === currentChannel) {

      groups.combined.set({ visibility: true, order: 0 });
      groups.red.set({ visibility: false, order: 0 });
      groups.green.set({ visibility: false, order: 0 });
      groups.blue.set({ visibility: false, order: 0 });

      beziers.combined.set({ visibility: true, order: 0 });
      beziers.red.set({ visibility: false, order: 0 });
      beziers.green.set({ visibility: false, order: 0 });
      beziers.blue.set({ visibility: false, order: 0 });
    }
    else {

      groups.combined.set({ visibility: false, order: 0 });
      groups.red.set({ visibility: true, order: 0 });
      groups.green.set({ visibility: true, order: 0 });
      groups.blue.set({ visibility: true, order: 0 });

      beziers.combined.set({ visibility: false, order: 0 });
      beziers.red.set({ visibility: true, order: 0 });
      beziers.green.set({ visibility: true, order: 0 });
      beziers.blue.set({ visibility: true, order: 0 });
    }

    groups[currentChannel].set({ order: 1 });
    beziers[currentChannel].set({ order: 1 });

    buildDragZone(currentChannel);

    let pin, x, y;

    pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_start`);
    [x, y] = pin.get('position');

    y = clampVal(y);
    input['start-y'].value = y;

    pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_first-control`);
    [x, y] = pin.get('position');

    x = clampVal(x);
    input['start-control-x'].value = x;

    y = clampVal(y);
    input['start-control-y'].value = y;

    pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_second-control`);
    [x, y] = pin.get('position');

    x = clampVal(x);
    input['end-control-x'].value = x;

    y = clampVal(y);
    input['end-control-y'].value = y;

    pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_end`);
    [x, y] = pin.get('position');

    y = clampVal(y);
    input['end-y'].value = y;

  }, selector);

  const inputSelectors = scrawlHandle.addNativeListener(['input', 'change'], (e) => {

    if (e && e.target && e.target.id.indexOf(id) > 0) {

      e.preventDefault();

      const input = e.target,
        name = e.target.id;

      let pin,
        val = clampVal(parseInt(input.value, 10));

      if (name.indexOf('start-y') > 0) {

        pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_start`);
        pin.set({ startY: val });
      }
      else if (name.indexOf('start-control-x') > 0) {
        
        pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_first-control`);
        pin.set({ startX: val });
      }
      else if (name.indexOf('start-control-y') > 0) {
        
        pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_first-control`);
        pin.set({ startY: val });
      }
      else if (name.indexOf('end-control-x') > 0) {
        
        pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_second-control`);
        pin.set({ startX: val });
      }
      else if (name.indexOf('end-control-y') > 0) {
        
        pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_second-control`);
        pin.set({ startY: val });
      }
      else if (name.indexOf('end-y') > 0) {
        
        pin = scrawlHandle.findEntity(`${id}_${currentChannel}_pin_end`);
        pin.set({ startY: val });
      }

      recalculateWeights();
    }
  }, '.channel-input');


  // Clean up
  actionWrapper.killList.push(() => {if (typeof currentPin === 'function') currentPin(true)});
  actionWrapper.killList.push(animation, channelSelector, inputSelectors);
  actionWrapper.killList.push(() => scrawlHandle.purge(id));
};


// Color weights recalculation function
const recalculateColorWeights = function (actionWrapper, weights) {

  const { id } = actionWrapper;

  const allCurve = scrawlHandle.findEntity(`${id}_combined_curve`),
    redCurve = scrawlHandle.findEntity(`${id}_red_curve`),
    greenCurve = scrawlHandle.findEntity(`${id}_green_curve`),
    blueCurve = scrawlHandle.findEntity(`${id}_blue_curve`);

  const inverseStep = 256 / 1000;

  return function () {

    const [startAllX] = allCurve.get('position');
    const [endAllX] = allCurve.get('endPosition');

    const [startRedX] = redCurve.get('position');
    const [endRedX] = redCurve.get('endPosition');

    const [startGreenX] = greenCurve.get('position');
    const [endGreenX] = greenCurve.get('endPosition');

    const [startBlueX] = blueCurve.get('position');
    const [endBlueX] = blueCurve.get('endPosition');

    const redArray = [],
        greenArray = [],
        blueArray = [],
        allArray = [];

    for (let i = 0; i < 1; i += 0.001) {

        const r = redCurve.getPathPositionData(i),
          g = greenCurve.getPathPositionData(i),
          b = blueCurve.getPathPositionData(i),
          a = allCurve.getPathPositionData(i);

        let {x:xr, y:yr} = r;
        let {x:xg, y:yg} = g;
        let {x:xb, y:yb} = b;
        let {x:xa, y:ya} = a;

        xr = Math.floor(xr * inverseStep);
        xg = Math.floor(xg * inverseStep);
        xb = Math.floor(xb * inverseStep);
        xa = Math.floor(xa * inverseStep);

        yr = 256 - (yr * inverseStep);
        yg = 256 - (yg * inverseStep);
        yb = 256 - (yb * inverseStep);
        ya = 256 - (ya * inverseStep);

        if (!redArray[xr]) redArray[xr] = [];
        redArray[xr].push(yr);

        if (!greenArray[xg]) greenArray[xg] = [];
        greenArray[xg].push(yg);

        if (!blueArray[xb]) blueArray[xb] = [];
        blueArray[xb].push(yb);

        if (!allArray[xa]) allArray[xa] = [];
        allArray[xa].push(ya);
    }

    let temp, tempLen, res;

    for (let i = 0, cursor = 0; i < 256; i++) {

      if (!redArray[i]) redArray[i] = [];
      tempLen = redArray[i].length;

      if (!tempLen) {
        if (startRedX < endRedX) {
          if (i < startRedX) weights[cursor] = -i;
          else weights[cursor] = 255 - i;
        }
        else {
          if (i > startRedX) weights[cursor] = -i;
          else weights[cursor] = 255 - i;
        }
      }
      else {
        temp = [...redArray[i]];
        res = Math.round(temp.reduce((acc, val) => acc + val, 0) / tempLen);
        weights[cursor] = res - i;
      }
      cursor++;

      if (!greenArray[i]) greenArray[i] = [];
      tempLen = greenArray[i].length;
      if (!tempLen) {
        if (startGreenX < endGreenX) {
          if (i < startGreenX) weights[cursor] = -i;
          else weights[cursor] = 255 - i;
        }
        else {
          if (i > startGreenX) weights[cursor] = -i;
          else weights[cursor] = 255 - i;
        }
      }
      else {
        temp = [...greenArray[i]];
        res = Math.round(temp.reduce((acc, val) => acc + val, 0) / tempLen);
        weights[cursor] = res - i;
      }
      cursor++;

      if (!blueArray[i]) blueArray[i] = [];
      tempLen = blueArray[i].length;
      if (!tempLen) {
        if (startBlueX < endBlueX) {
          if (i < startBlueX) weights[cursor] = -i;
          else weights[cursor] = 255 - i;
        }
        else {
          if (i > startBlueX) weights[cursor] = -i;
          else weights[cursor] = 255 - i;
        }
      }
      else {
        temp = [...blueArray[i]];
        res = Math.round(temp.reduce((acc, val) => acc + val, 0) / tempLen);
        weights[cursor] = res - i;
      }
      cursor++;

      if (!allArray[i]) allArray[i] = [];
      tempLen = allArray[i].length;
      if (!tempLen) {
        if (startAllX < endAllX) {
          if (i < startAllX) weights[cursor] = -i;
          else weights[cursor] = 255 - i;
        }
        else {
          if (i > startAllX) weights[cursor] = -i;
          else weights[cursor] = 255 - i;
        }
      }
      else {
        temp = [...allArray[i]];
        res = Math.round(temp.reduce((acc, val) => acc + val, 0) / tempLen);
        weights[cursor] = res - i;
      }
      cursor++;
    }

    actionWrapper.set({
      weights: [...weights],
    });

    const currentFilter = getWrapper();

    currentFilter.updateDisplayFilter();
    currentFilter.updateHistory();
  }
};

// Tone curve filter canvas UI
export const buildToneCurveComponent = (actionWrapper, canvas) => {

  const animation = scrawlHandle.makeRender({

    name: `${canvas.name}_animation`,
    target: canvas,
  });

  actionWrapper.killList.push(animation);
};


// Export for initialization 
// ------------------------------------------------------------------------
export const initCurveComponents = (
  scrawl = null,
  getCurrentWrappedFilter = null,
) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initCurveComponents function');
  if (!getCurrentWrappedFilter) throw new Error('getCurrentWrappedFilter not passed to initCurveComponents function');

  scrawlHandle = scrawl;
  getWrapper = getCurrentWrappedFilter;

  return {};
};
