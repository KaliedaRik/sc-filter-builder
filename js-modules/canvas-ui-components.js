// ------------------------------------------------------------------------
// Canvas-based UI components
// ------------------------------------------------------------------------


let scrawlHandle = null,
  getWrapper = null;


// Gradient builder canvas UI
// ==============================================
export const buildGradientComponent = (actionWrapper, canvas, colorFactory) => {

  const { id, formElement, formId, killList } = actionWrapper;
  const groupName = canvas.base.name;

  const gradientName = canvas.domElement.dataset.gradient,
    gradientStyle = scrawlHandle.findStyles(gradientName);

console.log(actionWrapper);

  // Gradient bar (top part)
  const gradientBar = scrawlHandle.makeBlock({

    name: `${id}-gradient-bar`,
    group: groupName,
    dimensions: ['90%', '25%'],
    start: ['center', '35%'],
    handle: ['center', 'top'],
    fillStyle: gradientStyle,
  });

  scrawlHandle.makeLabel({

    name: `${id}_label-for-0`,
    group: groupName,
    text: '0',
    start: ['5%', '12%'],
    handle: ['center', 'top'],
    fontString: '36px monospace',

  }).clone({

    name: `${id}_label-for-499`,
    text: '499',
    start: ['50%', '12%'],

  }).clone({

    name: `${id}_label-for-999`,
    text: '999',
    start: ['95%', '12%'],
  });


  // Generate color stops visuals and inputs
  const colorTriangelGroup = scrawlHandle.makeGroup({
    name: `${id}_color-stops-group`,
    host: canvas.base,
  });

  const stopsWrapper = formElement.querySelector(`#${formId}_gradient_wrapper`);


  const updateColorStops = () => {

    const colors = gradientStyle.get('colors');

console.log('stopsWrapper', stopsWrapper)
console.log('colorTriangelGroup', colorTriangelGroup)
console.log('colors', colors);

    for (const [key, color] of Object.entries(colors)) {
      console.log(typeof key, `${key}: ${color}`);
      console.log(colorFactory.buildColorStringFromData(color));

      scrawlHandle.makeShape({

        name: `${id}_stop-at_${key}`,
        group: colorTriangelGroup,
        pathDefinition: 'm0,0 20,60 -40,0z',
        fillStyle: colorFactory.buildColorStringFromData(color),
        strokeStyle: 'black',
        lineWidth: 2,
        method: 'fillThenDraw',
        start: [`${5 + (parseInt(key, 10) * 0.9) * 0.1}%`, '60%'],
        handle: ['center', 'top'],
      })
    }
  };

  updateColorStops();

  // Animation
  scrawlHandle.makeRender({

    name: `${id}_animation`,
    target: canvas,
  });

  killList.push(() => scrawlHandle.purge(id));
};



// Color curve filter canvas UI
// ==============================================
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

  const groupName = canvas.base.name;

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
        lineWidth: 6,
        strokeStyle: 'gold',
        method: 'fillThenDraw',
        radius: 40,
      });
    });


    // Each channel gets its own bezier curve
    // - Curve shape determined by the draggable pins
    beziers[channel] = scrawlHandle.makeBezier({

      name: `${id}_${channel}_curve`,
      group: groupName,
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
      precision: 1,

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

        const r = redCurve.getPathPositionData(i, true),
          g = greenCurve.getPathPositionData(i, true),
          b = blueCurve.getPathPositionData(i, true),
          a = allCurve.getPathPositionData(i, true);

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
// ==============================================
export const buildToneCurveComponent = (actionWrapper, canvas) => {

  // Build out pins
  const channelNames = ['luminance', 'chroma', 'aChannel', 'bChannel'];

  const channelColors = {
    luminance: 'black',
    chroma: 'red',
    aChannel: 'green',
    bChannel: 'blue',
  };

  const positionsData = [
    ['start', 0, 999],
    ['first-control', 333, 666],
    ['second-control', 666, 333],
    ['end', 999, 0],
  ];

  let currentChannel = 'luminance';

  const { id, formElement } = actionWrapper;

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
      order: channel === currentChannel ? 1 : 0,
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
        fillStyle: channelColors[channel],
        lineWidth: 6,
        strokeStyle: 'gold',
        method: 'fillThenDraw',
        radius: 40,
      });
    });


    // Each channel gets its own bezier curve
    // - Curve shape determined by the draggable pins
    beziers[channel] = scrawlHandle.makeBezier({

      name: `${id}_${channel}_curve`,
      strokeStyle: channelColors[channel],
      lineWidth: 6,
      method: 'draw',

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
      precision: 1,

      order: channel === currentChannel ? 1 : 0,
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

        recalculateCurves(currentChannel);
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

        recalculateCurves(currentChannel);
      },
    });
  };


  // Animation
  const animation = scrawlHandle.makeRender({

    name: `${canvas.name}_animation`,
    target: canvas,
  });


  // Get the recalculateCurves function
  const recalculateCurves = recalculateToneCurves(actionWrapper);

  buildDragZone('luminance');


  // Form event listeners 
  const channelSelector = scrawlHandle.addNativeListener('change', (e) => {

    if (e) e.preventDefault();

    currentChannel = selector.value;

    channelNames.forEach(n => {

      groups[n].set({ order: n === currentChannel ? 1: 0 });
      beziers[n].set({ order: n === currentChannel ? 1: 0 });
    });

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

      recalculateCurves(currentChannel);
    }
  }, '.channel-input');

  // Clean up
  actionWrapper.killList.push(() => {if (typeof currentPin === 'function') currentPin(true)});
  actionWrapper.killList.push(animation, channelSelector, inputSelectors);
  actionWrapper.killList.push(() => scrawlHandle.purge(id));
};


// Tone curves recalculation function
const recalculateToneCurves = function (actionWrapper) {

  const { id } = actionWrapper;

  // UI sampling resolution (Bezier → curve)
  const UI_L_SAMPLES = 256;
  const UI_C_SAMPLES = 256;
  const UI_AB_SAMPLES = 256;

  // Filter engine resolutions (fixed, strict)
  const L_WEIGHTS_SIZE = 501;
  const C_WEIGHTS_SIZE = 201;
  const AB_WEIGHTS_SIZE = 501;

  const lumCurve = scrawlHandle.findEntity(`${id}_luminance_curve`);
  const chromaCurve = scrawlHandle.findEntity(`${id}_chroma_curve`);
  const aCurve = scrawlHandle.findEntity(`${id}_aChannel_curve`);
  const bCurve = scrawlHandle.findEntity(`${id}_bChannel_curve`);

  const sampleBezierToCurve = (curveEntity, sampleCount) => {

    if (!curveEntity) return new Array(sampleCount).fill(0);

    const buckets = new Array(sampleCount);
    for (let i = 0; i < sampleCount; i++) buckets[i] = [];

    const width = 1000;
    const height = 1000;

    const STEPS = 1000;

    for (let t = 0, dt = 1 / STEPS; t <= 1; t += dt) {

      const pos = curveEntity.getPathPositionData(t);
      if (!pos) continue;

      const { x, y } = pos;

      const xn = x / width;
      const yn = y / height;

      const clampedX = (xn < 0) ? 0 : (xn > 1 ? 1 : xn);
      const clampedY = (yn < 0) ? 0 : (yn > 1 ? 1 : yn);

      let idx = Math.floor(clampedX * (sampleCount - 1));
      if (idx < 0) idx = 0;
      else if (idx >= sampleCount) idx = sampleCount - 1;

      const v = 1 - clampedY;

      buckets[idx].push(v);
    }

    const out = new Array(sampleCount);
    let lastValue = 0;

    for (let i = 0; i < sampleCount; i++) {

      const arr = buckets[i];
      if (arr.length) {

        const sum = arr.reduce((acc, val) => acc + val, 0);
        lastValue = sum / arr.length;
      }
      else {

        lastValue = i / (sampleCount - 1);
      }

      if (lastValue < 0) lastValue = 0;
      else if (lastValue > 1) lastValue = 1;

      out[i] = lastValue;
    }

    return out;
  };

  // Helper: build delta-curve (offsets) at engine resolution
  // + src[] is an absolute curve in [0,1] over [0,1]; we resample to targetSize,
  // + then subtract the diagonal (identity) so the result is an array of offsets.
  const buildDeltaCurve = (src, targetSize) => {

    if (!src || !src.length) return [];

    const n = src.length;
    const out = new Array(targetSize);
    const last = n - 1;
    const EPS = 1e-2;

    for (let i = 0; i < targetSize; i++) {

      const t = (targetSize === 1) ? 0 : (i / (targetSize - 1));

      const idx = t * last;
      const j = idx | 0;
      const f = idx - j;

      const v0 = src[j];
      const v1 = (j < last) ? src[j + 1] : src[last];

      const val = v0 * (1 - f) + v1 * f;
      const identity = t;

      const delta = val - identity;

      out[i] = (delta < -EPS || delta > EPS) ? delta : 0;
    }
    return out;
  };

  return function (currentChannel) {

    // Build new *absolute* curves from the Bezier paths (UI resolution)

    let luminance, chroma, aChannel, bChannel, curvesForFilter;

    if ('chroma' === currentChannel) {

      luminance = sampleBezierToCurve(lumCurve, UI_L_SAMPLES);
      chroma = sampleBezierToCurve(chromaCurve, UI_C_SAMPLES);

      curvesForFilter = {
        luminance: buildDeltaCurve(luminance, L_WEIGHTS_SIZE),
        chroma: buildDeltaCurve(chroma, C_WEIGHTS_SIZE),
        aChannel: [],
        bChannel: [],
      };
    }

    else if ('luminance' === currentChannel) {

      luminance = sampleBezierToCurve(lumCurve, UI_L_SAMPLES);
      chroma = sampleBezierToCurve(chromaCurve, UI_C_SAMPLES);
      aChannel = sampleBezierToCurve(aCurve, UI_AB_SAMPLES);
      bChannel = sampleBezierToCurve(bCurve, UI_AB_SAMPLES);

      curvesForFilter = {
        luminance: buildDeltaCurve(luminance, L_WEIGHTS_SIZE),
        chroma: buildDeltaCurve(chroma, C_WEIGHTS_SIZE),
        aChannel: buildDeltaCurve(aChannel, AB_WEIGHTS_SIZE),
        bChannel: buildDeltaCurve(bChannel, AB_WEIGHTS_SIZE),
      };
    }

    else {

      luminance = sampleBezierToCurve(lumCurve, UI_L_SAMPLES);
      aChannel = sampleBezierToCurve(aCurve, UI_AB_SAMPLES);
      bChannel = sampleBezierToCurve(bCurve, UI_AB_SAMPLES);

      curvesForFilter = {
        luminance: buildDeltaCurve(luminance, L_WEIGHTS_SIZE),
        chroma: [],
        aChannel: buildDeltaCurve(aChannel, AB_WEIGHTS_SIZE),
        bChannel: buildDeltaCurve(bChannel, AB_WEIGHTS_SIZE),
      };
    }

    actionWrapper.set({ curves: curvesForFilter });

    const currentFilter = getWrapper();

    currentFilter.updateDisplayFilter();
    currentFilter.updateHistory();
  }
};


// Export for initialization 
// ------------------------------------------------------------------------
export const initCanvasComponents = (
  scrawl = null,
  getCurrentWrappedFilter = null,
) => {

  if (!scrawl) throw new Error('Scrawl library not passed to initCurveComponents function');
  if (!getCurrentWrappedFilter) throw new Error('getCurrentWrappedFilter not passed to initCurveComponents function');

  scrawlHandle = scrawl;
  getWrapper = getCurrentWrappedFilter;

  return {};
};
