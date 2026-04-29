// ------------------------------------------------------------------------
// Graph manager
// ------------------------------------------------------------------------

import {
  getScrawlHandle,
  getDomHandle,
} from './utilities.js';

let scrawl, dom;

const ZERO_STR = '',
  SOURCE = 'source',
  SOURCE_ALPHA = 'source-alpha',
  RESULT = 'result',
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
  IN = 'in',
  MIX = 'mix',
  DIRECT = 'direct';


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
    socket: null,
    label: null,
  });
  else edges.push({
    from: n.id,
    to: RESULT,
    socket: IN,
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
      socket: null,
      label: null,
    });
    else if (n.lineOutLabel === L_RESULT) edges.push({
      from: n.id,
      to: RESULT,
      socket: IN,
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


export const initGraphManager = () => {

  scrawl = getScrawlHandle();
  dom = getDomHandle();
};
