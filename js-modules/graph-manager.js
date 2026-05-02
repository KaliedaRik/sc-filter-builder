// ------------------------------------------------------------------------
// Graph manager
// ------------------------------------------------------------------------

import { getScrawlHandle } from './utilities.js';

import {
  IN_MIX_OUT,
  OUT_ONLY,
  socketDetails,
} from './filter-schemas.js';

let scrawl, canvas, sourceSocket, sourceAlphaSocket, resultSocket;

const ZERO_STR = '',
  SOURCE = 'source',
  SOURCE_ALPHA = 'source-alpha',
  RESULT = 'result',

  WIRE_GRAPH = 'wire-graph',
  
  L_SOURCE = '[source]',
  L_SOURCE_ALPHA = '[source-alpha]',
  L_WORK = '[work]',
  L_RESULT = '[result]',
  L_BAD_LINE = '[bad-line]',
  L_SOURCES = [L_SOURCE, L_SOURCE_ALPHA],
  
  PROCESS_IMAGE = 'process-image',
  DISPLACE = 'displace',
  COMPOSITES = ['compose', 'blend'],
  NONE = 'none',

  IN = 'lineIn',
  MIX = 'lineMix',
  OUT = 'lineOut',
  DIRECT = 'direct',
  SOCKET_DOUBLE_TOP = 20,
  SOCKET_DOUBLE_BOTTOM = 50,
  SOCKET_SINGLE = 35,
  SOCKET_RADIUS = 8;

const endSockets = {};


export const buildGraphData = (actionsArray) => {

  const dataArray = [],
    nodes = [],
    edges = [];

  actionsArray.forEach((item, index) => {

    const filterAction = item.action;

    const {
      action,
      lineIn = null,
      lineOut = null,
      lineMix = null,
    } = filterAction;

    dataArray.push({
      index,
      action,
      lineIn,
      lineOut,
      lineMix,
      id: item.id,
      buttonId: item.buttonId,
      formId: item.formId,
    });
  });

  const dataArraylen = dataArray.length;

  if (!dataArraylen) nodes.push(...enhanceEmptyActionGraphData());
  else if (dataArraylen === 1) nodes.push(...enhanceSingleActionGraphData(dataArray));
  else nodes.push(...enhanceMultiActionGraphData(dataArray));

  const errorFlag = nodes.some(n => n.error != null);

  const nodesLen = nodes.length;

  if (nodesLen < 2) edges.push(...generateSimpleEdgesData(nodes));
  else edges.push(...generateEdgesData(nodes))

  return {
    nodes,
    edges,
    errorFlag,
  }
};

const enhanceSingleActionGraphData = (data) => {

  const getLineLabel = (line) => {

    if (line === SOURCE) return SOURCE;
    if (line === SOURCE_ALPHA) return L_SOURCE_ALPHA;
    if (!line) return L_SOURCE;
    return L_BAD_LINE;
  };

  const getLineOutLabel = (line, index) => {

    if (!line) return L_RESULT;
    return L_BAD_LINE;
  };

  const d = { ...data[0] };

  const { lineIn, lineOut, lineMix, action } = d;

  // This is always an error in an actions-based filter because we expect some action to consume the imported image; the filter itself will just pass the input ImageData object through with no additional processing
  if (action === PROCESS_IMAGE) {

    d.lineInLabel = null;
    d.lineMixLabel = null;
    d.lineOutLabel = (lineOut?.length) ? lineOut : L_BAD_LINE;

    if (d.lineOutLabel === L_BAD_LINE) {

      d.error = 'Singleton process-image action with bad lineOut value';
      return [d];
    }

    d.error = 'Singleton process-image action';
    return [d];
  }

  // This is mostly an error in an actions-based filter, though it is possible to compose/blend using only source and source-alpha inputs
  if (COMPOSITES.includes(action)) {

    d.lineInLabel = getLineLabel(lineIn);
    d.lineMixLabel = getLineLabel(lineMix);
    d.lineOutLabel = getLineOutLabel(lineOut);

    if (lineIn === ZERO_STR && lineMix === ZERO_STR) {

      d.error = `Singleton ${action} action uses implied source for both inputs`;
      return [d];
    }

    if (lineIn == null || lineMix == null || lineOut == null) {

      d.error = `Singleton ${action} action with bad line values`;
      return [d];
    }

    if (L_SOURCES.includes(d.lineInLabel) && L_SOURCES.includes(d.lineMixLabel)) return [d];

    d.error = `Singleton ${action} action`;
    return [d];
  }

  // This is always an error in an actions-based filter because the displace action needs both lineIn and lineMix - these could in theory be a mix of '' (source) and 'source-alpha', but what's the point? Better to mark the filter as erroring
  if (action === DISPLACE) {

    d.lineInLabel = getLineLabel(lineIn);
    d.lineMixLabel = getLineLabel(lineMix);
    d.lineOutLabel = getLineOutLabel(lineOut);

    if (lineIn === ZERO_STR && lineMix === ZERO_STR) {

      d.error = 'Singleton displace action uses implied source for both inputs';
      return [d];
    }

    if (lineIn == null || lineMix == null || lineOut == null) {

      d.error = 'Singleton displace action with bad line values';
      return [d];
    }

    d.error = 'Singleton displace action';
    return [d];
  }

  // Other filter actions should be valid, as long as they have acceptable lineIn and lineOut values
  d.lineInLabel = getLineLabel(lineIn);
  d.lineMixLabel = null;
  d.lineOutLabel = getLineOutLabel(lineOut);

  if (
    lineIn == null || lineOut == null || 
    d.lineOutLabel !== L_RESULT || !L_SOURCES.includes(d.lineInLabel)
  ) {

    d.error = 'Bad line values';
    return [d];
  }

  return [d];
};

const enhanceMultiActionGraphData = (data) => {

  const getLineLabel = (line) => {

    if (line === SOURCE) return SOURCE;
    if (line === SOURCE_ALPHA) return L_SOURCE_ALPHA;

    if (!line) {

      if (workLineIsInPlay) return L_WORK;
      return L_SOURCE;
    }

    if (!acceptableInputs.includes(line)) return L_BAD_LINE;

    return line;
  };

  const getLineOutLabel = (line, index) => {

    if (!line) {

      if (index === lastAction) return L_RESULT;
      return L_WORK;
    }

    if (!acceptableInputs.includes(line)) acceptableInputs.push(line);

    return line;
  };

  let workLineIsInPlay = false;

  const results = [],
    acceptableInputs = [],
    lastAction = data.length - 1;

  data.forEach((d, index) => {

    const { lineIn, lineOut, lineMix, action } = d;

    if (action === PROCESS_IMAGE) {

      d.lineInLabel = null;
      d.lineMixLabel = null;
      d.lineOutLabel = (lineOut?.length) ? lineOut : L_BAD_LINE;

      if (d.lineOutLabel === L_BAD_LINE) d.error = 'process-image action with bad lineOut value';
      else acceptableInputs.push(lineOut);
    }

    else if (action === DISPLACE || COMPOSITES.includes(action)) {

      d.lineInLabel = getLineLabel(lineIn);
      d.lineMixLabel = getLineLabel(lineMix);
      d.lineOutLabel = getLineOutLabel(lineOut, index);

      if ([d.lineInLabel, d.lineMixLabel, d.lineOutLabel].includes(L_BAD_LINE)) d.error = `${action} action with bad line values`;

      if (!lineOut && !workLineIsInPlay) workLineIsInPlay = true;
    }

    else {

      d.lineInLabel = getLineLabel(lineIn);
      d.lineMixLabel = null;
      d.lineOutLabel = getLineOutLabel(lineOut, index);

      if ([d.lineInLabel, d.lineOutLabel].includes(L_BAD_LINE)) d.error = `${action} action with bad line values`;

      if (!lineOut && !workLineIsInPlay) workLineIsInPlay = true;
    }

    results.push(d);
  });

  return results;
};


// An empty filter actions array is a valid filter actions array
const enhanceEmptyActionGraphData = () => {

  return [{
    index: null,
    action: NONE,
    lineIn: null,
    lineOut: null,
    lineMix: null,
    lineInLabel: null,
    lineMixLabel: null,
    lineOutLabel: null,
  }];
}

const generateSimpleEdgesData = (nodes) => {

  const edges = [];

  const n = nodes[0];

  if (!n || n.action === NONE) return [{
    from: SOURCE,
    to: RESULT,
    socket: IN,
    label: DIRECT,
  }];

  if (L_BAD_LINE === n.lineInLabel) edges.push({
    from: null,
    to: n.id,
    socket: IN,
    label: null,
    error: L_BAD_LINE,
  });
  else if (n.lineInLabel) edges.push({
    from: (n.lineInLabel === L_SOURCE_ALPHA) ? SOURCE_ALPHA : SOURCE,
    to: n.id,
    socket: IN,
    label: n.lineInLabel,
  });

  if (n.lineMixLabel && L_BAD_LINE === n.lineMixLabel) edges.push({
    from: null,
    to: n.id,
    socket: MIX,
    label: null,
    error: L_BAD_LINE,
  });
  else if (n.lineMixLabel) edges.push({
    from: (n.lineMixLabel === L_SOURCE_ALPHA) ? SOURCE_ALPHA : SOURCE,
    to: n.id,
    socket: MIX,
    label: n.lineMixLabel,
  });

  if (L_BAD_LINE === n.lineOutLabel) edges.push({
    from: n.id,
    to: null,
    socket: OUT,
    label: null,
    error: L_BAD_LINE,
  });
  else edges.push({
    from: n.id,
    to: RESULT,
    socket: OUT,
    label: n.lineOutLabel,
  });

  return edges;
};

const generateEdgesData = (nodes) => {

  const edges = [],
    namedOutputs = new Map();

  let workSource = SOURCE;

  nodes.forEach(n => {

    if (!n || n.action === NONE) return;

    // lineIn edge
    if (L_BAD_LINE === n.lineInLabel) edges.push({
      from: null,
      to: n.id,
      socket: IN,
      label: null,
    });
    else if (n.lineInLabel) edges.push({
      from: getEdgeSource(n.lineInLabel, namedOutputs, workSource),
      to: n.id,
      socket: IN,
      label: n.lineInLabel,
    });

    // lineMix edge
    if (L_BAD_LINE === n.lineMixLabel) edges.push({
      from: null,
      to: n.id,
      socket: MIX,
      label: null,
    });
    else if (n.lineMixLabel) edges.push({
      from: getEdgeSource(n.lineMixLabel, namedOutputs, workSource),
      to: n.id,
      socket: MIX,
      label: n.lineMixLabel,
    });

    // Register this node's output for downstream actions
    if (L_BAD_LINE === n.lineOutLabel) edges.push({
      from: n.id,
      to: null,
      socket: OUT,
      label: null,
    });
    else if (n.lineOutLabel === L_RESULT) edges.push({
      from: n.id,
      to: RESULT,
      socket: OUT,
      label: n.lineOutLabel,
    });
    else if (n.lineOutLabel === L_WORK) workSource = n.id;
    else if (n.lineOutLabel) namedOutputs.set(n.lineOutLabel, n.id);
  });

  return edges;
};

const getEdgeSource = (label, namedOutputs, workSource) => {

  if (label === L_SOURCE || label === SOURCE) return SOURCE;
  if (label === L_SOURCE_ALPHA || label === SOURCE_ALPHA) return SOURCE_ALPHA;
  if (label === L_WORK) return workSource;

  return namedOutputs.get(label) || null;
};


export const addSocketsToButton = (actionWrapper) => {

  const { buttonId, action: filterAction, killList } = actionWrapper

  const action = filterAction.action,
    elWrapper = scrawl.findElement(actionWrapper.buttonId),
    socketRequirements = socketDetails[action];

  const sockets = actionWrapper.sockets = {};

  if (socketRequirements === OUT_ONLY) {

    const outSocket = scrawl.makeWheel({

      name: `${buttonId}_out`,
      group: canvas.base,
      handle: ['center', 'center'],
      radius: SOCKET_RADIUS,

      pivot: elWrapper,
      pivotCorner: 'topRight',
      lockTo: 'pivot',
      offsetY: SOCKET_SINGLE, 
    });

    sockets.out = outSocket;

    killList.push(outSocket);
  }
  else if (socketRequirements === IN_MIX_OUT) {

    const inSocket = scrawl.makeWheel({

      name: `${buttonId}_in`,
      group: canvas.base,
      handle: ['center', 'center'],
      radius: SOCKET_RADIUS,

      pivot: elWrapper,
      pivotCorner: 'topLeft',
      lockTo: 'pivot',
      offsetY: SOCKET_DOUBLE_TOP, 
    });

    const mixSocket = scrawl.makeWheel({

      name: `${buttonId}_mix`,
      group: canvas.base,
      handle: ['center', 'center'],
      radius: SOCKET_RADIUS,

      pivot: elWrapper,
      pivotCorner: 'topLeft',
      lockTo: 'pivot',
      offsetY: SOCKET_DOUBLE_BOTTOM,
    });

    const outSocket = scrawl.makeWheel({

      name: `${buttonId}_out`,
      group: canvas.base,
      handle: ['center', 'center'],
      radius: SOCKET_RADIUS,

      pivot: elWrapper,
      pivotCorner: 'topRight',
      lockTo: 'pivot',
      offsetY: SOCKET_SINGLE, 
    });

    sockets.in = inSocket;
    sockets.mix = mixSocket;
    sockets.out = outSocket;

    killList.push(inSocket, mixSocket, outSocket);
  }
  else {

    const inSocket = scrawl.makeWheel({

      name: `${buttonId}_in`,
      group: canvas.base,
      handle: ['center', 'center'],
      radius: SOCKET_RADIUS,

      pivot: elWrapper,
      pivotCorner: 'topLeft',
      lockTo: 'pivot',
      offsetY: SOCKET_SINGLE, 
    });

    const outSocket = scrawl.makeWheel({

      name: `${buttonId}_out`,
      group: canvas.base,
      handle: ['center', 'center'],
      radius: SOCKET_RADIUS,

      pivot: elWrapper,
      pivotCorner: 'topRight',
      lockTo: 'pivot',
      offsetY: SOCKET_SINGLE, 
    });

    sockets.in = inSocket;
    sockets.out = outSocket;

    killList.push(inSocket, outSocket);
  }
};


export const calculateButtonPositions = (wrapper) => {

  const getLevel = (id) => {

    if (levelCache.has(id)) return levelCache.get(id);

    // Cycle protection; shouldn't happen, but bad imported packets may surprise us
    if (resolving.has(id)) return 1;

    resolving.add(id);

    const upstreamNodeIds = incoming[id]
      .map(e => e.from)
      .filter(from => from && nodeById[from]);

    let level = 1;

    if (upstreamNodeIds.length) {

      level = Math.max(...upstreamNodeIds.map(from => getLevel(from) + 1));
    }

    resolving.delete(id);
    levelCache.set(id, level);

    return level;
  };

  const getColumnX = (level, maxLevel) => {

    if (maxLevel === 1) return 50;

    // Better spacing for simple two-node graphs
    if (maxLevel === 2) {

      return (level === 1) ? 32 : 68;
    }

    // Three-node graphs also benefit from not hugging the sockets
    if (maxLevel === 3) {

      return [0, 24, 50, 76][level];
    }

    const left = 18;
    const right = 82;

    return left + ((level - 1) / (maxLevel - 1)) * (right - left);
  };

  const getLaneBias = (node) => {

    const ins = incoming[node.id] || [];
    const outs = outgoing[node.id] || [];

    // What this node consumes
    if (ins.some(e => e.from === SOURCE_ALPHA || e.from === L_SOURCE_ALPHA)) return 2;
    if (ins.some(e => e.from === SOURCE || e.from === L_SOURCE)) return 0;

    // What this node feeds
    if (outs.some(e => e.socket === MIX)) return 2;
    if (outs.some(e => e.socket === IN)) return 0;

    return 1;
  };

  const getPredecessorAverageY = (node) => {

    const preds = (incoming[node.id] || [])
      .map(e => e.from)
      .filter(id => id && nodeById[id] && Number.isFinite(nodeById[id].graphY));

    if (!preds.length) return null;

    return preds.reduce((sum, id) => sum + nodeById[id].graphY, 0) / preds.length;
  };

  const getPreferredY = (node) => {

    const predY = getPredecessorAverageY(node);

    if (predY != null) return predY;

    const bias = getLaneBias(node);

    if (bias === 0) return 35;
    if (bias === 2) return 65;

    return 50;
  };

  const getNeighbourAverageY = (node, direction) => {

    const links = (direction === 'incoming') ? incoming[node.id] : outgoing[node.id];

    const ys = links
      .map(e => (direction === 'incoming') ? e.from : e.to)
      .filter(id => id && nodeById[id] && Number.isFinite(nodeById[id].graphY))
      .map(id => nodeById[id].graphY);

    if (!ys.length) return null;

    return ys.reduce((sum, y) => sum + y, 0) / ys.length;
  };

  const refineColumnOrder = (direction) => {

    const levels = [...columns.keys()].sort((a, b) => a - b);

    if (direction === 'right-to-left') levels.reverse();

    levels.forEach(level => {

      const column = columns.get(level);

      if (!column || column.length < 2) return;

      column.sort((a, b) => {

        const aY = getNeighbourAverageY(a, direction === 'left-to-right' ? 'incoming' : 'outgoing');
        const bY = getNeighbourAverageY(b, direction === 'left-to-right' ? 'incoming' : 'outgoing');

        if (aY != null && bY != null && aY !== bY) return aY - bY;

        const laneBias = getLaneBias(a) - getLaneBias(b);

        if (laneBias) return laneBias;

        return a.index - b.index;
      });

      const count = column.length;

      column.forEach((node, i) => {

        node.graphY = top + (i / (count - 1)) * (bottom - top);
      });
    });
  };

  const { nodes, edges } = wrapper.graphData;

  const realNodes = nodes.filter(n => n && n.id && n.action !== NONE);
  if (!realNodes.length) return;

  const nodeById = Object.fromEntries(realNodes.map(n => [n.id, n]));

  const incoming = {};
  const outgoing = {};

  realNodes.forEach(n => {

    incoming[n.id] = [];
    outgoing[n.id] = [];
  });

  edges.forEach(edge => {

    const { from, to } = edge;

    if (to && nodeById[to]) incoming[to].push(edge);
    if (from && nodeById[from]) outgoing[from].push(edge);
  });

  const levelCache = new Map();
  const resolving = new Set();

  realNodes.forEach(n => n.graphLevel = getLevel(n.id));

  const maxLevel = Math.max(...realNodes.map(n => n.graphLevel));

  const columns = new Map();

  realNodes.forEach(n => {

    if (!columns.has(n.graphLevel)) columns.set(n.graphLevel, []);

    columns.get(n.graphLevel).push(n);
  });

  const top = 24;
  const bottom = 76;

  [...columns.keys()].sort((a, b) => a - b).forEach(level => {

    const column = columns.get(level);

    column.sort((a, b) => {

      const aPredY = getPredecessorAverageY(a);
      const bPredY = getPredecessorAverageY(b);

      if (aPredY != null && bPredY != null && aPredY !== bPredY) return aPredY - bPredY;

      const laneBias = getLaneBias(a) - getLaneBias(b);

      if (laneBias) return laneBias;

      return a.index - b.index;
    });

    const x = getColumnX(level, maxLevel);

    const count = column.length;

    column.forEach((node, i) => {

      const y = (count === 1)
        ? getPreferredY(node)
        : top + (i / (count - 1)) * (bottom - top);

      node.graphX = x;
      node.graphY = y;
    });
  });

  refineColumnOrder('left-to-right');
  refineColumnOrder('right-to-left');
  refineColumnOrder('left-to-right');

  realNodes.forEach(node => {

    const button = scrawl.findElement(node.buttonId);

    if (button) button.set({ start: [`${node.graphX}%`, `${node.graphY}%`] });
  });
};

export const wireGraph = (wrapper) => {

  const getPivot = (val, isFrom, socket) => {

    if (val === SOURCE || val === L_SOURCE) return sourceSocket;
    if (val === SOURCE_ALPHA || val === L_SOURCE_ALPHA) return sourceAlphaSocket;
    if (val === RESULT || val === L_RESULT) return resultSocket;
    if (nodesObject[val]) {

      const name = nodesObject[val].buttonId;
      if (isFrom) return scrawl.findArtefact(`${name}_out`);
      if (socket === IN) return scrawl.findArtefact(`${name}_in`);
      if (socket === MIX) return scrawl.findArtefact(`${name}_mix`);
    }
    return null;
  };

  const getLabel = (edgeLabel, startId, endId) => {

    const start = nodesObject[startId],
      end = nodesObject[endId];

    if (!start || !end) return edgeLabel;

    if (start.lineOutLabel === end.lineInLabel) return start.lineOutLabel;
    if (start.lineOutLabel === end.lineMixLabel) return start.lineOutLabel;

    return '[unknown]';
  };

  const makeErrorMarker = (edge, pivot, isFrom = false) => {

    if (!pivot) return;

    const { from, to, socket, error } = edge;

    scrawl.makeLabel({

      name: `${WIRE_GRAPH}_${from}_${to}_${socket}_error-label`,
      group: canvas.base,
      pivot,
      lockTo: 'pivot',
      handleX: isFrom ? 'left' : 'right',
      offsetX: isFrom ? 12 : -12,
      handleY: 'center',
      fontString: '15px bold Arial, sans-serif',
      text: error,
      fillStyle: 'red',
    });
  };

  // Get rid of all previous SC wiregraph artefacts 
  scrawl.purge(WIRE_GRAPH);

  const nodesObject = {}

  const nodes = wrapper.graphData.nodes,
    edges = wrapper.graphData.edges;

  nodes.forEach(node => nodesObject[node.id] = node);

  if (edges.length) {

    edges.forEach(edge => {

      const { from: fromId, to: toId, socket, label } = edge;

      const fromPivot = getPivot(fromId, true),
        toPivot = getPivot(toId, false, socket);

      if (!fromPivot || !toPivot) {

        if (!fromPivot) makeErrorMarker(edge, toPivot, false);
        else makeErrorMarker(edge, fromPivot, true);

        return;
      }

      const line = scrawl.makeLine({

        name: `${WIRE_GRAPH}_${fromId}_${toId}_line`,
        group: canvas.base,
        pivot: fromPivot,
        endPivot: toPivot,
        lockTo: 'pivot',
        endLockTo: 'pivot',
        useAsPath: true,
        useStartAsControlPoint: true,
        method: 'none',
      });

      const h1Pin = scrawl.makeBlock({

        name: `${WIRE_GRAPH}_${fromId}_${toId}_control-pin-from`,
        group: canvas.base,
        pivot: fromPivot,
        path: line,
        lockTo: ['path', 'pivot'],
        pathPosition: 0.5,
        method: 'none',
      });

      const h2Pin = scrawl.makeBlock({

        name: `${WIRE_GRAPH}_${fromId}_${toId}_control-pin-to`,
        group: canvas.base,
        pivot: toPivot,
        path: line,
        lockTo: ['path', 'pivot'],
        pathPosition: 0.5,
        method: 'none',
      });

      const bezier = scrawl.makeBezier({

        name: `${WIRE_GRAPH}_${fromId}_${toId}_bezier`,
        group: canvas.base,
        pivot: fromPivot,
        lockTo: 'pivot',
        useStartAsControlPoint: true,
        startControlPivot: h1Pin,
        startControlLockTo: 'pivot',
        endControlPivot: h2Pin,
        endControlLockTo: 'pivot',
        endPivot: toPivot,
        endLockTo: 'pivot',
        lineWidth: 2,
        method: 'draw',
        useAsPath: true,
      });

      const lineName = scrawl.makeLabel({

        name: `${WIRE_GRAPH}_${fromId}_${toId}_label`,
        group: canvas.base,
        calculateOrder: 1,
        stampOrder: 2,
        fontString: '15px bold Arial, sans-serif',
        text: getLabel(label, fromId, toId),
        handle: ['center', 'center'],
        path: bezier,
        lockTo: 'path',
        pathPosition: 0.5,
      });

      scrawl.makeBlock({

        name: `${WIRE_GRAPH}_${fromId}_${toId}_label-background`,
        group: canvas.base,
        calculateOrder: 2,
        stampOrder: 1,
        mimic: lineName,
        lockTo: 'mimic',
        useMimicDimensions: true,
        useMimicStart: true,
        useMimicHandle: true,
        addOwnDimensionsToMimic: true,
        addOwnOffsetToMimic: true,
        dimensions: [4, 4],
        offset: [-2, -3],
        fillStyle: 'white',
      });
    });
  }
  else {

    // We just need a line from source to result
    scrawl.makeLine({

      name: `${WIRE_GRAPH}-direct-line`,
      group: canvas.base,
      pivot: sourceSocket,
      endPivot: resultSocket,
      lockTo: 'pivot',
      endLockTo: 'pivot',
      useAsPath: false,
      useStartAsControlPoint: true,
      method: 'draw',
    });
  }

  // Wiring is just plumbing - we can work out where the buttons should be after wiring completes
  calculateButtonPositions(wrapper);
};


export const initGraphManager = () => {

  scrawl = getScrawlHandle();
  canvas = scrawl.findCanvas('filter-builder-canvas');

  sourceSocket = scrawl.makeOval({

    name: 'source-socket',
    group: canvas.base,
    start: [0, '25%'],
    handle: ['center', 'center'],
    order: 3,
    radiusX: 60,
    radiusY: '20%',
    fillStyle: 'white',
  });

  sourceAlphaSocket = scrawl.makeOval({

    name: 'source-alpha-socket',
    group: canvas.base,
    start: [0, '75%'],
    handle: ['center', 'center'],
    order: 3,
    radiusX: 60,
    radiusY: '20%',
    fillStyle: 'black',
  });

  resultSocket = scrawl.makeOval({

    name: 'result-socket',
    group: canvas.base,
    start: ['100%', '50%'],
    handle: ['center', 'center'],
    order: 3,
    radiusX: 60,
    radiusY: '20%',
    fillStyle: 'white',
  });

  endSockets.source = sourceSocket;
  endSockets.sourceAlpha = sourceAlphaSocket;
  endSockets.result = resultSocket;

  scrawl.makeLabel({

    name: 'source-socket-label',
    group: canvas.base,
    order: 4,
    fontString: '12px Arial, sans-serif',
    text: 'SOURCE',
    handle: ['center', -5],
    fillStyle: 'black',
    pivot: sourceSocket,
    lockTo: 'pivot',
    roll: -90,

  }).clone({

    name: 'result-socket-label',
    text: 'RESULT',
    pivot: resultSocket,
    roll: 90,

  }).clone({

    name: 'source-alpha-socket-1-label',
    text: 'SOURCE',
    fillStyle: 'white',
    pivot: sourceAlphaSocket,
    roll: -90,

  }).clone({

    name: 'source-alpha-socket-2-label',
    text: 'ALPHA',
    handleY: -20,
  });
};
