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

  const groups = {};

  channelNames.forEach(channel => {

    const mainName = `${id}_${channel}_pin`;

    groups[channel] = scrawlHandle.makeGroup({

      name: `${mainName}_group`,
      host: canvas.base,
    });

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

    scrawlHandle.makeBezier({

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
    });
  });

  let draggedPin = false;

  const currentPin = scrawlHandle.makeDragZone({

    zone: canvas,
    collisionGroup: groups['combined'],
    endOn: ['up', 'leave'],
    exposeCurrentArtefact: true,
    preventTouchDefaultWhenDragging: true,

    updateOnStart: () => {

      draggedPin = currentPin();

      if (typeof draggedPin !== 'boolean' && draggedPin) {

        const pin = draggedPin.artefact,
          name = pin.name;

        if (name.indexOf('start') > 0 || name.indexOf('end') > 0) {

          pin.isBeingDragged = false;
          pin.set({
            lockYTo: 'mouse',
          });
        }
      }
    },

    updateWhileMoving: () => recalculateWeights(),

    updateOnEnd: () => {

      if (typeof draggedPin !== 'boolean' && draggedPin) {

        const pin = draggedPin.artefact,
          name = pin.name;

        if (name.indexOf('start') > 0 || name.indexOf('end') > 0) {

          pin.set({
            start: pin.get('position'),
            lockYTo: 'start',
          });
        }
      }
      draggedPin = false;

      recalculateWeights();
    },
  });

  const recalculateWeights = recalculateColorWeights(actionWrapper, weights);

  actionWrapper.killList.push(currentPin);

  const animation = scrawlHandle.makeRender({

    name: `${canvas.name}_animation`,
    target: canvas,
  });

  actionWrapper.killList.push(animation);
};

// Filter weights recalculation
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
