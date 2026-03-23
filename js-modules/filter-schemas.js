/*
These objects model the filter action objects which make up a Scrawl-canvas filter's actions array. We define the attributes that an individual action object takes:
- name (as key);
- `controlType` - what sort of input best suits the attributes
- `default` - the default value
- any other value which can help us construct a form input/select for the attribute
- `label`  - suggested label for input/select control
- `description` - could be used for tool tips, etc
*/

// All filter action objects (except one) require the following controls
const requiredControls = {
  lineIn: {
    controlType: 'text',
    default: '',
    label: 'Line in',
    description: '',
  },
  lineOut: {
    controlType: 'text',
    default: '',
    label: 'Line out',
    description: '',
  },
  opacity: {
    controlType: 'number',
    default: 1,
    minValue: 0,
    maxValue: 1,
    step: 0.01,
    label: 'Opacity',
    description: '',
  },
};

// The actionSchema objects directly map the input values expected by each filter
// - the key value is the Scrawl-canvas filter-engine's name for that filter effect
export const actionSchemas = {
  ['alpha-to-channels']: {
    label: 'Set alpha to channels',
    description: '',
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
      excludeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Exclude red channel',
        description: '',
      },
      excludeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Exclude green channel',
        description: '',
      },
      excludeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Exclude blue channel',
        description: '',
      },
    },
  },
  ['area-alpha']: {
    label: 'Area alpha',
    description: '',
    controls: {
      ...requiredControls,
      tileWidth: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Tile width',
        description: '',
      },
      tileHeight: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Tile height',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
      gutterWidth: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Gutter width',
        description: '',
      },
      gutterHeight: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Gutter height',
        description: '',
      },
      areaAlphaLevels: {
        controlType: 'bespoke',
        default: [255, 0, 0, 0],
        label: '',
        description: 'Array of four numbers, each between 0 and 255, representing the alpha values for each [?, ?, ?, ?] area',
      },
    },
  },
  ['average-channels']: {
    label: 'Aveerage channels',
    description: '',
    controls: {
      ...requiredControls,
      excludeRed: {
        controlType: 'boolean',
        default: false,
        label: 'Exclude red channel',
        description: 'Set red channel value to zero',
      },
      excludeGreen: {
        controlType: 'boolean',
        default: false,
        label: 'Exclude green channel',
        description: 'Set green channel value to zero',
      },
      excludeBlue: {
        controlType: 'boolean',
        default: false,
        label: 'Exclude blue channel',
        description: 'Set blue channel value to zero',
      },
      includeRed: {
        controlType: 'boolean',
        default: false,
        label: 'Include red channel',
        description: 'Include red channel in the averaging calculation',
      },
      includeGreen: {
        controlType: 'boolean',
        default: false,
        label: 'Include green channel',
        description: 'Include green channel in the averaging calculation',
      },
      includeBlue: {
        controlType: 'boolean',
        default: false,
        label: 'Include blue channel',
        description: 'Include blue channel in the averaging calculation',
      },
    },
  },
  ['blend']: {
    label: 'Blend operations',
    description: '',
    controls: {
      ...requiredControls,
      lineMix: {
        controlType: 'text',
        default: '',
        label: 'Line mix',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        minValue: -Infinity,
        maxValue: Infinity,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        minValue: -Infinity,
        maxValue: Infinity,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
      blend: {
        controlType: 'select',
        default: 'normal',
        options: ['normal', 'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', 'saturation', 'hue-match', 'chroma-match'],
        label: 'Blend effect',
        description: '',
      },
    },
  },
  ['blur']: {
    label: 'Box blur',
    description: '',
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        label: 'Include alpha channel',
        description: '',
      },
      excludeTransparentPixels: {
        controlType: 'boolean',
        default: false,
        label: 'Exclude transparent pixels',
        description: '',
      },
      processHorizontal: {
        controlType: 'boolean',
        default: true,
        label: 'Process horizontal',
        description: '',
      },
      radiusHorizontal: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Horizontal radius',
        description: '',
      },
      stepHorizontal: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Horizontal step',
        description: '',
      },
      passesHorizontal: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Horizontal passes',
        description: '',
      },
      processVertical: {
        controlType: 'boolean',
        default: true,
        label: 'Process vertical',
        description: '',
      },
      radiusVertical: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Vertical radius',
        description: '',
      },
      stepVertical: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Vertical steps',
        description: '',
      },
      passesVertical: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Vertical passes',
        description: '',
      },
    },
  },
  ['channels-to-alpha']: {
    label: 'Set channels to alpha',
    description: '',
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
    },
  },
  ['chroma']: {
    label: 'Chroma ranges',
    description: '',
    controls: {
      ...requiredControls,
      ranges: {
        controlType: 'bespoke',
        default: [],
        label: 'Color ranges for removal',
        description: 'An array of arrays, each member array comprised of 6 integer numbers between 0 and 255 representing [lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue]',
      },
      featherRed: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Feather red channel',
        description: '',
      },
      featherGreen: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Feather green channel',
        description: '',
      },
      featherBlue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Feather blue channel',
        description: '',
      },
    },
  },
  ['clamp-channels']: {
    label: 'Clamp channels',
    description: '',
    controls: {
      ...requiredControls,
      lowRed: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red channel low bound',
        description: '',
      },
      lowGreen: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green channel low bound',
        description: '',
      },
      lowBlue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue channel low bound',
        description: '',
      },
      highRed: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red channel high bound',
        description: '',
      },
      highGreen: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green channel high bound',
        description: '',
      },
      highBlue: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue channel high bound',
        description: '',
      },
    },
  },
  ['compose']: {
    label: 'Composition operations',
    description: '',
    controls: {
      ...requiredControls,
      lineMix: {
        controlType: 'text',
        default: '',
        label: 'Line mix',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        minValue: -Infinity,
        maxValue: Infinity,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        minValue: -Infinity,
        maxValue: Infinity,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
      compose: {
        controlType: 'select',
        default: 'source-over',
        options: ['source-over', 'source-in', 'source-out', 'source-atop', 'source-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'destination-only', 'xor', 'clear'],
        label: 'Composition effect',
        description: '',
      },
    },
  },
  ['corrode']: {
    label: 'Corrode',
    description: '',
    controls: {
      ...requiredControls,
      width: {
        controlType: 'number',
        default: 3,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Width',
        description: '',
      },
      height: {
        controlType: 'number',
        default: 3,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Height',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: Infinity,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
      includeRed: {
        controlType: 'boolean',
        default: false,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: false,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: false,
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: true,
        label: 'Include alpha channel',
        description: '',
      },
      operation: {
        controlType: 'select',
        default: 'mean',
        options: ['mean', 'lowest', 'highest'],
        label: 'Operation',
        description: '',
      },
    },
  },
  ['colors-to-alpha']: {
    label: 'Chroma key',
    description: '',
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red channel',
        description: '',
      },
      green: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green channel',
        description: '',
      },
      blue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue channel',
        description: '',
      },
      transparentAt: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Effect transparent at',
        description: '',
      },
      opaqueAt: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Effect opaque at',
        description: '',
      },
    },
  },
  ['deconvolute']: {
    label: 'Deconvolute',
    description: '',
    controls: {
      ...requiredControls,
      strength: {
        controlType: 'number',
        default: 0.85,
        minValue: 0,
        maxValue: 2,
        step: 0.01,
        label: 'Strength',
        description: '',
      },
      radius: {
        controlType: 'number',
        default: 1.25,
        minValue: 0,
        maxValue: 10,
        step: 0.05,
        label: 'Radius',
        description: '',
      },
      level: {
        controlType: 'number',
        default: 0.015,
        minValue: 0,
        maxValue: 0.05,
        step: 0.001,
        label: 'Level',
        description: '',
      },
      smoothing: {
        controlType: 'number',
        default: 0.015,
        minValue: 0,
        maxValue: 0.05,
        step: 0.001,
        label: 'Smoothing',
        description: '',
      },
      clamp: {
        controlType: 'number',
        default: 0.08,
        minValue: 0,
        maxValue: 0.2,
        step: 0.01,
        label: 'Clamp',
        description: '',
      },
      passes: {
        controlType: 'number',
        default: 8,
        minValue: 0,
        maxValue: 20,
        step: 1,
        label: 'Passes',
        description: '',
      },
      deriveMaskFromImage: {
        controlType: 'boolean',
        default: true,
        label: 'Derive mask from image',
        description: '',
      },
      multiscale: {
        controlType: 'boolean',
        default: true,
        label: 'Multiscale',
        description: '',
      },
      multiscaleFinalPasses: {
        controlType: 'number',
        default: 2,
        minValue: 0,
        maxValue: 4,
        step: 1,
        label: 'Multiscale final passes',
        description: '',
      },
    },
  },
  ['displace']: {
    label: 'Displace',
    description: '',
    controls: {
      ...requiredControls,
      lineMix: {
        controlType: 'text',
        default: '',
        label: 'Line mix',
        description: '',
      },
      channelX: {
        controlType: 'select',
        default: 'red',
        options: ['red', 'green', 'blue', 'alpha'],
        label: 'X channel',
        description: '',
      },
      channelY: {
        controlType: 'select',
        default: 'green',
        options: ['red', 'green', 'blue', 'alpha'],
        label: 'Y channel',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        minValue: -200,
        maxValue: 200,
        step: 1,
        label: 'X offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        minValue: -200,
        maxValue: 200,
        step: 1,
        label: 'Y Offset',
        description: '',
      },
      scaleX: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 100,
        step: 1,
        label: 'X scale',
        description: '',
      },
      scaleY: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 100,
        step: 1,
        label: 'Y scale',
        description: '',
      },
      transparentEdges: {
        controlType: 'boolean',
        default: false,
        label: 'Transparent edges',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        label: 'Use input as mask',
        description: '',
      },
    },
  },
  ['flood']: {
    label: 'Flood',
    description: '',
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red channel',
        description: '',
      },
      green: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green channel',
        description: '',
      },
      blue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue channel',
        description: '',
      },
      alpha: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Alpha channel',
        description: '',
      },
      excludeAlpha: {
        controlType: 'boolean',
        default: true,
        label: 'Exclude transparent pixels',
        description: '',
      },
    },
  },
  ['gaussian-blur']: {
    label: 'Gaussian blur',
    description: '',
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: true,
        label: 'Include alpha channel',
        description: '',
      },
      excludeTransparentPixels: {
        controlType: 'boolean',
        default: false,
        label: 'Exclude transparent pixels',
        description: '',
      },
      premultiply: {
        controlType: 'boolean',
        default: false,
        label: 'Premultiply',
        description: '',
      },
      radiusHorizontal: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 200,
        step: 0.5,
        label: 'Horizontal radius',
        description: '',
      },
      radiusVertical: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 200,
        step: 0.5,
        label: 'Vertical radius',
        description: '',
      },
      angle: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 360,
        step: 0.5,
        label: 'Angle',
        description: '',
      },
    },
  },
  ['glitch']: {
    label: 'Glitch',
    description: '',
    controls: {
      ...requiredControls,
      useMixedChannel: {
        controlType: 'boolean',
        default: true,
        label: 'Use mixed channel',
        description: 'When true, all channels use the same offset levels',
      },
      seed: {
        controlType: 'text',
        default: 'default-seed',
        label: 'Random engine seed',
        description: '',
      },
      step: {
        controlType: 'number',
        default: 1,
        minValue: 1,
        maxValue: 50,
        step: 1,
        label: 'Step',
        description: '',
      },
      offsetMin: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum offset',
        description: '',
      },
      offsetMax: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum offset',
        description: '',
      },
      offsetRedMin: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum red channel offset',
        description: '',
      },
      offsetRedMax: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum red channel offset',
        description: '',
      },
      offsetGreenMin: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum green channel offset',
        description: '',
      },
      offsetGreenMax: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum green channel offset',
        description: '',
      },
      offsetBlueMin: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum blue channel offset',
        description: '',
      },
      offsetBlueMax: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum blue channel offset',
        description: '',
      },
      offsetAlphaMin: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum alpha channel offset',
        description: '',
      },
      offsetAlphaMax: {
        controlType: 'number',
        default: 0,
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum alpha channel offset',
        description: '',
      },
      transparentEdges: {
        controlType: 'boolean',
        default: false,
        label: 'Transparent edges',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        label: 'Use input as mask',
        description: '',
      },
      level: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Intensity level',
        description: '',
      },
    },
  },
  ['grayscale']: {
    label: 'Grayscale',
    description: '',
    controls: {
      ...requiredControls,
    },
  },
  ['invert-channels']: {
    label: 'Invert channels',
    description: '',
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
    },
  },
  ['lock-channels-to-levels']: {
    label: 'Posterize by channel',
    description: '',
    controls: {
      ...requiredControls,
      red: {
        controlType: 'bespoke',
        default: [0],
        label: 'Red channel pins',
        description: 'An array of integer numbers, each between 0 and 255',
      },
      green: {
        controlType: 'bespoke',
        default: [0],
        label: 'Green channel pins',
        description: 'An array of integer numbers, each between 0 and 255',
      },
      blue: {
        controlType: 'bespoke',
        default: [0],
        label: 'Blue channel pins',
        description: 'An array of integer numbers, each between 0 and 255',
      },
      alpha: {
        controlType: 'bespoke',
        default: [255],
        label: 'Alpha channel pins',
        description: 'An array of integer numbers, each between 0 and 255',
      },
    },
  },
  ['luminance-to-alpha']: {
    label: 'Luminance to alpha',
    description: '',
    controls: {
      ...requiredControls,
    },
  },
  ['map-to-gradient']: {
    label: 'Map to gradient',
    description: '',
    controls: {
      ...requiredControls,
      useNaturalGrayscale: {
        controlType: 'boolean',
        default: false,
        label: 'Use natural grayscale',
        description: 'When set to true, uses a grayscaled image rather than a simple gray image as the base for the filter\'s work',
      },
      gradient: {
        controlType: 'bespoke',
        default: null,
        label: 'Gradient',
        description: 'Expects to receive a Scrawl-canvas LinearGradient object, or the name value of the object. We need to create a gradient builder mini-tool before we can use this filter in the main tool',
      },
    },
  },
  ['matrix']: {
    label: 'Matrix',
    description: '',
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        label: 'Include alpha channel',
        description: '',
      },
      width: {
        controlType: 'number',
        default: 3,
        minValue: 1,
        maxValue: 20,
        step: 1,
        label: 'Matrix width',
        description: '',
      },
      height: {
        controlType: 'number',
        default: 3,
        minValue: 1,
        maxValue: 20,
        step: 1,
        label: 'Matrix height',
        description: '',
      },
      premultiply: {
        controlType: 'boolean',
        default: false,
        label: 'Premultiply',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        label: 'Use input as mask',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 19,
        step: 1,
        label: 'Width offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 19,
        step: 1,
        label: 'Height offset',
        description: '',
      },
      weights: {
        controlType: 'bespoke',
        default: [0, 0, 0, 0, 1, 0, 0, 0, 0],
        label: 'Matrix weights',
        description: 'An array of matrix weights, with length = width * height',
      },
    },
  },
  ['modify-ok-channels']: {
    label: 'Modify OK channels',
    description: '',
    controls: {
      ...requiredControls,
      channelL: {
        controlType: 'number',
        default: 0,
        minValue: -1,
        maxValue: 1,
        step: 0.01,
        label: 'Luminance channel',
        description: '',
      },
      channelA: {
        controlType: 'number',
        default: 0,
        minValue: -0.4,
        maxValue: 0.4,
        step: 0.005,
        label: 'OKLAB A channel',
        description: '',
      },
      channelB: {
        controlType: 'number',
        default: 0,
        minValue: -0.4,
        maxValue: 0.4,
        step: 0.005,
        label: 'OKLAB B channel',
        description: '',
      },
    },
  },
  ['modulate-channels']: {
    label: 'Modulate channels',
    description: '',
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'Red channel',
        description: '',
      },
      green: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'Green channel',
        description: '',
      },
      blue: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'Blue channel',
        description: '',
      },
      alpha: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'Alpha channel',
        description: '',
      },
      saturation: {
        controlType: 'boolean',
        default: false,
        label: 'Use gray as base',
        description: 'When false, acts as a brightness filter; when true, acts as a saturation filter',
      },
    },
  },
  ['modulate-ok-channels']: {
    label: 'Modulate OK channels',
    description: '',
    controls: {
      ...requiredControls,
      channelL: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'Luminance channel',
        description: '',
      },
      channelA: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'OKLAB A channel',
        description: '',
      },
      channelB: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'OKLAB B channel',
        description: '',
      },
    },
  },
  ['negative']: {
    label: 'Negative',
    description: 'Invert OKLab channel colors',
    controls: {
      ...requiredControls,
    },
  },
  ['newsprint']: {
    label: 'Newsprint',
    description: '',
    controls: {
      ...requiredControls,
      width: {
        controlType: 'number',
        default: 1,
        minValue: 1,
        maxValue: 20,
        step: 1,
        label: 'Width',
        description: '',
      },
    },
  },
  ['offset']: {
    label: 'Offset',
    description: '',
    controls: {
      ...requiredControls,
      offsetRedX: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Red channel horizontal offset',
        description: '',
      },
      offsetRedY: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Red channel vertical offset',
        description: '',
      },
      offsetGreenX: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Green channel horizontal offset',
        description: '',
      },
      offsetGreenY: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Green channel vertical offset',
        description: '',
      },
      offsetBlueX: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Blue channel horizontal offset',
        description: '',
      },
      offsetBlueY: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Blue channel vertical offset',
        description: '',
      },
      offsetAlphaX: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Alpha channel horizontal offset',
        description: '',
      },
      offsetAlphaY: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Alpha channel vertical offset',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        label: 'Use input as mask',
        description: '',
      },
    },
  },
  ['ok-perceptual-curves']: {
    label: 'OK pereceptual curves',
    description: '',
    controls: {
      ...requiredControls,
      BESPOKE: {
        controlType: 'bespoke',
        default: {
          luminance: [],
          chroma: [],
          aChannel: [],
          bChannel: [],
        },
        label: 'Curve weights',
        description: '',
      },
    },
  },
  ['pixelate']: {
    label: 'Pixelate',
    description: '',
    controls: {
      ...requiredControls,
      tileWidth: {
        controlType: 'number',
        default: 1,
        minValue: 1,
        maxValue: 200,
        step: 1,
        label: 'Tile width',
        description: '',
      },
      tileHeight: {
        controlType: 'number',
        default: 1,
        minValue: 1,
        maxValue: 200,
        step: 1,
        label: 'Tile height',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        label: 'Include alpha channel',
        description: '',
      },
    },
  },
  ['random-noise']: {
    label: 'Random noise',
    description: '',
    controls: {
      ...requiredControls,
      width: {
        controlType: 'number',
        default: 1,
        minValue: -200,
        maxValue: 200,
        step: 1,
        label: 'Width',
        description: '',
      },
      height: {
        controlType: 'number',
        default: 1,
        minValue: -200,
        maxValue: 200,
        step: 1,
        label: 'Height',
        description: '',
      },
      seed: {
        controlType: 'text',
        default: 'default-random-seed',
        label: 'Random seed string',
        description: '',
      },
      noiseType: {
        controlType: 'select',
        default: 'random',
        options: ['random', 'ordered', 'bluenoise'],
        label: 'Noise type',
        description: '',
      },
      level: {
        controlType: 'number',
        default: 0.5,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Noise level',
        description: '',
      },
      noWrap: {
        controlType: 'boolean',
        default: false,
        label: 'No wrap',
        description: '',
      },
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: true,
        label: 'Include alpha channel',
        description: '',
      },
      excludeTransparentPixels: {
        controlType: 'boolean',
        default: true,
        label: 'Exclude transparent pixels',
        description: '',
      },
    },
  },
  ['reduce-palette']: {
    label: 'Reduce palette',
    description: '',
    controls: {
      ...requiredControls,
      seed: {
        controlType: 'text',
        default: 'default-random-seed',
        label: 'Random seed string',
        description: '',
      },
      minimumColorDistance: {
        controlType: 'number',
        default: 1000,
        minValue: 10,
        maxValue: 5000,
        step: 10,
        label: 'Minimum color distance',
        description: '',
      },
      palette: {
        controlType: 'bespoke',
        default: 'black-white',
        label: 'Palette',
        description: 'Use string for: monochrome or defined palettes. Use number for: commonest colors palette',
      },
      noiseType: {
        controlType: 'select',
        default: 'random',
        options: ['random', 'ordered', 'bluenoise'],
        label: 'Noise type',
        description: '',
      },
    },
  },
  ['rotate-hue']: {
    label: 'Rotate hue',
    description: '',
    controls: {
      ...requiredControls,
      angle: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 360,
        step: 0.1,
        label: 'Angle',
        description: '',
      },
    },
  },
  ['set-channel-to-level']: {
    label: 'Set channels to level',
    description: '',
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: false,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: false,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: false,
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        label: 'Include alpha channel',
        description: '',
      },
      level: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Level',
        description: '',
      },
    },
  },
  ['step-channels']: {
    label: 'Channel step',
    description: '',
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 1,
        minValue: 1,
        maxValue: 255,
        step: 1,
        label: 'Red channel',
        description: '',
      },
      green: {
        controlType: 'number',
        default: 1,
        minValue: 1,
        maxValue: 255,
        step: 1,
        label: 'Green channel',
        description: '',
      },
      blue: {
        controlType: 'number',
        default: 1,
        minValue: 1,
        maxValue: 255,
        step: 1,
        label: 'Blue channel',
        description: '',
      },
      clamp: {
        controlType: 'select',
        default: 'down',
        options: ['down', 'round', 'up'],
        label: 'Clamp results',
        description: '',
      },
    },
  },
  ['tiles']: {
    label: 'Tiles',
    description: '',
    controls: {
      ...requiredControls,
      mode: {
        controlType: 'select',
        default: 'rect',
        options: ['rect', 'hex', 'random'],
        label: 'Tile mode',
        description: '',
      },
// Check to see if originX/originY can take % values - if not, update filter to make this happen
      originX: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 600,
        step: 1,
        label: 'Origin X (rect, hex)',
        description: '',
      },
      originY: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 600,
        step: 1,
        label: 'Origin Y (rect, hex)',
        description: '',
      },
      rectWidth: {
        controlType: 'number',
        default: 10,
        minValue: 1,
        maxValue: 100,
        step: 1,
        label: 'Width (rect)',
        description: '',
      },
      rectHeight: {
        controlType: 'number',
        default: 10,
        minValue: 1,
        maxValue: 100,
        step: 1,
        label: 'Height (rect)',
        description: '',
      },
      hexRadius: {
        controlType: 'number',
        default: 5,
        minValue: 1,
        maxValue: 50,
        step: 1,
        label: 'Radius (hex)',
        description: '',
      },
      randomCount: {
        controlType: 'number',
        default: 100,
        minValue: 10,
        maxValue: 5000,
        step: 10,
        label: 'Random points (random)',
        description: '',
      },
      pointsData: {
        controlType: 'bespoke',
        default: [],
        label: 'Points data',
        description: 'An array of arrays whose members consist of integer [x, y] coordinate pairs',
      },
      angle: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 360,
        step: 0.1,
        label: 'Rotation angle (rect, hex)',
        description: '',
      },
      spiralStrength: {
        controlType: 'number',
        default: 0,
        minValue: -0.005,
        maxValue: 0.005,
        step: 0.00005,
        label: 'Spiral strength (rect, hex)',
        description: '',
      },
      seed: {
        controlType: 'text',
        default: 'default-random-seed',
        label: 'Random seed string',
        description: '',
      },
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        label: 'Include alpha channel',
        description: '',
      },
      premultiply: {
        controlType: 'boolean',
        default: false,
        label: 'Premultiply',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        label: 'Use input as mask',
        description: '',
      },
    },
  },
  ['tint']: {
    label: 'Tint',
    description: '',
    controls: {
      ...requiredControls,
      redInRed: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Red-in-red',
        description: '',
      },
      redInGreen: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Red-in-green',
        description: '',
      },
      redInBlue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Red-in-blue',
        description: '',
      },
      greenInRed: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Green-in-red',
        description: '',
      },
      greenInGreen: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Green-in-green',
        description: '',
      },
      greenInBlue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Green-in-blue',
        description: '',
      },
      blueInRed: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Blue-in-red',
        description: '',
      },
      blueInGreen: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Blue-in-green',
        description: '',
      },
      blueInBlue: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Blue-in-blue',
        description: '',
      },
    },
  },
  ['unsharp']: {
    label: 'Unsharpen',
    description: '',
    controls: {
      ...requiredControls,
      strength: {
        controlType: 'number',
        default: 0.8,
        minValue: 0,
        maxValue: 2,
        step: 0.01,
        label: 'Strength',
        description: '',
      },
      radius: {
        controlType: 'number',
        default: 2,
        minValue: 0,
        maxValue: 10,
        step: 0.1,
        label: 'CHANGE ME',
        description: '',
      },
      level: {
        controlType: 'number',
        default: 0.015,
        minValue: 0,
        maxValue: 0.05,
        step: 0.001,
        label: 'Level',
        description: '',
      },
      smoothing: {
        controlType: 'number',
        default: 0.015,
        minValue: 0,
        maxValue: 0.05,
        step: 0.001,
        label: 'Smoothing',
        description: '',
      },
      clamp: {
        controlType: 'number',
        default: 0.08,
        minValue: 0,
        maxValue: 0.2,
        step: 0.001,
        label: 'Clamp',
        description: '',
      },
      useEdgeMask: {
        controlType: 'boolean',
        default: true,
        label: 'Use edge mask',
        description: '',
      },
    },
  },
  ['vary-channels-by-weights']: {
    label: 'Vary channels by weights',
    description: '',
    controls: {
      ...requiredControls,
      weights: {
        controlType: 'bespoke',
        default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        label: 'Weights',
        description: 'An array of 1024 integers (256 * 4) where each four-integer group represents the deviation from the expected value for [red-channel, green-channel, blue-channel, combined-channels], with the reference being channel values [0, 0, 0, 0, 1, 1, 1, 1, ...etc]',
      },
      useMixedChannel: {
        controlType: 'boolean',
        default: true,
        label: 'Use mixed channel',
        description: 'Switch between weighting against a grayscaled image (default) and weighting on a per-channel basis',
      },
    },
  },
  ['zoom-blur']: {
    label: 'Zoom blur',
    description: '',
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: true,
        label: 'Include alpha channel',
        description: '',
      },
      excludeTransparentPixels: {
        controlType: 'boolean',
        default: true,
        label: 'Exclude transparent pixels',
        description: '',
      },
      startX: {
        controlType: 'percentage-number',
        default: 50,
        minValue: 0,
        maxValue: 100,
        step: 0.1,
        label: 'Horizontal origin',
        description: '',
      },
      startY: {
        controlType: 'percentage-number',
        default: 50,
        minValue: 0,
        maxValue: 100,
        step: 0.1,
        label: 'Vertical origin',
        description: '',
      },
      innerRadius: {
        controlType: 'percentage-number',
        default: 0,
        minValue: 0,
        maxValue: 60,
        step: 0.1,
        label: 'Inner radius',
        description: '',
      },
      outerRadius: {
        controlType: 'percentage-number',
        default: 0,
        minValue: 0,
        maxValue: 60,
        step: 0.1,
        label: 'Outer radius',
        description: '',
      },
      easing: {
        controlType: 'select',
        default: 'linear',
        options: ['linear', 'easeOut', 'easeOutIn', 'easeInOut', 'easeIn'],
        label: 'Easing',
        description: '',
      },
      premultiply: {
        controlType: 'boolean',
        default: false,
        label: 'Premultiply',
        description: '',
      },
      multiscale: {
        controlType: 'boolean',
        default: true,
        label: 'Multiscale',
        description: '',
      },
      strength: {
        controlType: 'number',
        default: 0.35,
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Strength',
        description: '',
      },
      angle: {
        controlType: 'number',
        default: 0,
        minValue: -15,
        maxValue: 15,
        step: 0.01,
        label: 'Angle',
        description: '',
      },
      seed: {
        controlType: 'text',
        default: 'default-random-seed',
        label: 'Random seed string',
        description: '',
      },
      samples: {
        controlType: 'number',
        default: 14,
        minValue: 0,
        maxValue: 32,
        step: 0.01,
        label: 'Samples',
        description: '',
      },
      variation: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Variation',
        description: '',
      },
    },
  },
};

// The filterSchemas objects map directly to the Scrawl-canvas filter factory's methods
// - Object keys represent method values
// - `required` - some methods combine multiple actions, some of which can be bypassed (required: false)
// - `excludeFromUI` - some methods are convenience functions (for example: blue), which lose meaning if some controls are included in their forms
// - Overwrites - some methods set different values to the Scrawl-canvasa default value for that control
// - Combined controls - some methods allow convenience controls as attributes, for example color selectors to set the values of red, green and blue channel attributes
export const filterSchemas = {

  alphaToChannels: {
    label: 'Set alpha to channels',
    description: '',
    actions: [{
      action: 'alpha-to-channels',
      required: true,
      controls: {
        ...actionSchemas['alpha-to-channels'].controls,
      },
      excludeFromUI: [],
    }],
  },
  alphaToLuminance: {
    label: 'Alpha to luminance',
    description: '',
    actions: [{
      action: 'alpha-to-luminance',
      required: true,
      controls: {
        ...requiredControls,
      },
      excludeFromUI: [],
    }],
  },
  areaAlpha: {
    label: 'Area alpha',
    description: '',
    actions: [{
      action: 'area-alpha',
      required: true,
      controls: {
        ...actionSchemas['area-alpha'].controls,
      },
      excludeFromUI: [],
     }],
  },
  blend: {
    label: 'Blend effects',
    description: '',
    actions: [{
      action: 'blend',
      required: true,
      controls: {
        ...actionSchemas['blend'].controls,
      },
      excludeFromUI: [],
   }],
  },
  blue: {
    label: 'Blue only',
    description: '',
    actions: [{
      action: 'average-channels',
      required: true,
      controls: {
        ...actionSchemas['average-channels'].controls,

        // Overwrites
        excludeRed: {
          controlType: 'boolean',
          default: true,
        },
        excludeGreen: {
          controlType: 'boolean',
          default: true,
        },
      },
      excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    }],
  },
  blur: {
    label: 'Box blur',
    description: '',
    actions: [{
      action: 'blur',
      required: true,
      controls: {
        ...actionSchemas['blur'].controls,
      },
      excludeFromUI: [],
    }],
  },
  brightness: {
    label: 'Brightness',
    description: '',
    actions: [{
      action: 'modulate-channels',
      required: true,
      controls: {
        ...actionSchemas['modulate-channels'].controls,
      },
      excludeFromUI: ['saturation', 'alpha'],
    }],
  },
  channelLevels: {
    label: 'Posterize by channel',
    description: '',
    actions: [{
      action: 'lock-channels-to-levels',
      required: true,
      controls: {
        ...actionSchemas['lock-channels-to-levels'].controls,
      },
      excludeFromUI: [],
    }],
  },
  channels: {
    label: 'Channels modulation',
    description: '',
    actions: [{
      action: 'modulate-channels',
      required: true,
      controls: {
        ...actionSchemas['modulate-channels'].controls,
      },
      excludeFromUI: ['saturation'],
    }],
  },
  channelstep: {
    label: 'Channel step',
    description: '',
    actions: [{
      action: 'step-channels',
      required: true,
      controls: {
        ...actionSchemas['step-channels'].controls,
      },
      excludeFromUI: [],
    }],
  },
  channelsToAlpha: {
    label: 'Set channels to alpha',
    description: '',
    actions: [{
      action: 'channels-to-alpha',
      required: true,
      controls: {
        ...actionSchemas['channels-to-alpha'].controls,
      },
      excludeFromUI: [],
    }],
  },
  chroma: {
    label: 'Chroma ranges',
    description: '',
    actions: [{
      action: 'chroma',
      required: true,
      controls: {
        ...actionSchemas['chroma'].controls,

        // Combined controls
        feather: {
          controlType: 'number',
          alternativeControl: true,
          alternativeFor: ['featherRed', 'featherGreen', 'featherBlue'],
          default: 0,
          minValue: 0,
          maxValue: 255,
          step: 1,
          label: '',
          description: '',
        },
      },
      excludeFromUI: [],
    }],
  },
  chromakey: {
    label: 'Chroma key',
    description: '',
    actions: [{
      action: 'colors-to-alpha',
      required: true,
      controls: {
        ...actionSchemas['colors-to-alpha'].controls,

        // Combined controls
        reference: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['red', 'green', 'blue'],
          default: 'rgb(0 255 0)',
          label: 'Reference color',
          description: '',
        },
      },
      excludeFromUI: [],
    }],
  },
  clampChannels: {
    label: 'Clamp channels',
    description: '',
    actions: [{
      action: 'clamp-channels',
      required: true,
      controls: {
        ...actionSchemas['clamp-channels'].controls,

        // Combined controls
        lowColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['lowRed', 'lowGreen', 'lowBlue'],
          default: 'rgb(0 0 0)',
          label: 'Low color',
          description: '',
        },
        highColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['highRed', 'highGreen', 'highBlue'],
          default: 'rgb(255 255 255)',
          label: 'High color',
          description: '',
        },
      },
      excludeFromUI: [],
    }],
  },
  compose: {
    label: 'Composition effects',
    description: '',
    actions: [{
      action: 'compose',
      required: true,
      controls: {
        ...actionSchemas['compose'].controls,
      },
      excludeFromUI: [],
   }],
  },
  corrode: {
    label: 'Corrode',
    description: '',
    actions: [{
      action: 'corrode',
      required: true,
      controls: {
        ...actionSchemas['corrode'].controls,
      },
      excludeFromUI: [],
   }],
  },
  curveWeights: {
    label: 'Curve weights',
    description: '',
    actions: [{
      action: 'vary-channels-by-weights',
      required: true,
      controls: {
        ...actionSchemas['vary-channels-by-weights'].controls,
      },
      excludeFromUI: [],
   }],
  },
  cyan: {
    label: 'Cyan only',
    description: '',
    actions: [{
      action: 'average-channels',
      required: true,
      controls: {
        ...actionSchemas['average-channels'].controls,

        // Overwrites
        excludeRed: {
          controlType: 'boolean',
          default: true,
        },
        includeGreen: {
          controlType: 'boolean',
          default: true,
        },
        includeBlue: {
          controlType: 'boolean',
          default: true,
        },
      },
      excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    }],
  },
  deconvolute: {
    label: 'Deconvolute',
    description: '',
    actions: [{
      action: 'deconvolute',
      required: true,
      controls: {
        ...actionSchemas['deconvolute'].controls,
      },
      excludeFromUI: [],
   }],
  },
  displace: {
    label: 'Displace',
    description: '',
    actions: [{
      action: 'displace',
      required: true,
      controls: {
        ...actionSchemas['displace'].controls,
      },
      excludeFromUI: [],
   }],
  },
  edgeDetect: {
    label: 'Edge detect',
    description: '',
    actions: [{
      action: 'matrix',
      required: true,
      controls: {
        ...actionSchemas['matrix'].controls,

        // Overwrite
        weights: {
          controlType: 'bespoke',
          default: [0, 1, 0, 1, -4, 1, 0, 1, 0],
          label: 'Matrix weights',
          description: 'An array of matrix weights, with length = width * height',
        },
      },
      excludeFromUI: ['width', 'height', 'offsetX', 'offsetY', 'includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'weights'],
   }],
  },
  flood: {
    label: 'Flood',
    description: '',
    actions: [{
      action: 'flood',
      required: true,
      controls: {
        ...actionSchemas['flood'].controls,
      },
      excludeFromUI: [],
   }],
  },
  gaussianBlur: {
    label: 'Gaussian blur',
    description: '',
    actions: [{
      action: 'gaussian-blur',
      required: true,
      controls: {
        ...actionSchemas['gaussian-blur'].controls,
      },
      excludeFromUI: [],
   }],
  },
  glitch: {
    label: 'Glitch',
    description: '',
    actions: [{
      action: 'glitch',
      required: true,
      controls: {
        ...actionSchemas['glitch'].controls,
      },
      excludeFromUI: [],
   }],
  },
  gray: {
    label: 'Monochrome gray',
    description: '',
    actions: [{
      action: 'average-channels',
      required: true,
      controls: {
        ...actionSchemas['average-channels'].controls,

        // Overwrites
        includeRed: {
          controlType: 'boolean',
          default: true,
        },
        includeGreen: {
          controlType: 'boolean',
          default: true,
        },
        includeBlue: {
          controlType: 'boolean',
          default: true,
        },
      },
      excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    }],
  },
  grayscale: {
    label: 'Grayscale',
    description: '',
    actions: [{
      action: 'grayscale',
      required: true,
      controls: {
        ...actionSchemas['grayscale'].controls,
      },
      excludeFromUI: [],
   }],
  },
  green: {
    label: 'Green only',
    description: '',
    actions: [{
      action: 'average-channels',
      required: true,
      controls: {
        ...actionSchemas['average-channels'].controls,

        // Overwrites
        excludeRed: {
          controlType: 'boolean',
          default: true,
        },
        excludeBlue: {
          controlType: 'boolean',
          default: true,
        },
      },
      excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    }],
  },
  invert: {
    label: 'Invert channels',
    description: '',
    actions: [{
      action: 'invert-channels',
      required: true,
      controls: {
        ...actionSchemas['invert-channels'].controls,
      },
      excludeFromUI: [],
   }],
  },
  luminanceToAlpha: {
    label: 'Luminance to alpha',
    description: '',
    actions: [{
      action: 'luminance-to-alpha',
      required: true,
      controls: {
        ...actionSchemas['luminance-to-alpha'].controls,
      },
      excludeFromUI: [],
   }],
  },
  magenta: {
    label: 'Magenta only',
    description: '',
    actions: [{
      action: 'average-channels',
      required: true,
      controls: {
        ...actionSchemas['average-channels'].controls,

        // Overwrites
        includeRed: {
          controlType: 'boolean',
          default: true,
        },
        excludeGreen: {
          controlType: 'boolean',
          default: true,
        },
        includeBlue: {
          controlType: 'boolean',
          default: true,
        },
      },
      excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    }],
  },
  mapToGradient: {
    label: 'Map to gradient',
    description: '',
    actions: [{
      action: 'map-to-gradient',
      required: true,
      controls: {
        ...actionSchemas['map-to-gradient'].controls,
      },
      excludeFromUI: [],
   }],
  },
  matrix: {
    label: 'Matrix',
    description: '',
    actions: [{
      action: 'matrix',
      required: true,
      controls: {
        ...actionSchemas['matrix'].controls,
      },
      excludeFromUI: [],
   }],
  },
  modifyOk: {
    label: 'Modify OK channels',
    description: '',
    actions: [{
      action: 'modify-ok-channels',
      required: true,
      controls: {
        ...actionSchemas['modify-ok-channels'].controls,
      },
      excludeFromUI: [],
   }],
  },
  modulateOk: {
    label: 'Modulate OK channels',
    description: '',
    actions: [{
      action: 'modulate-ok-channels',
      required: true,
      controls: {
        ...actionSchemas['modulate-ok-channels'].controls,
      },
      excludeFromUI: [],
   }],
  },
  negative: {
    label: 'Negative',
    description: 'Invert OKLab channel colors',
    actions: [{
      action: 'negative',
      required: true,
      controls: {
        ...actionSchemas['negative'].controls,
      },
      excludeFromUI: [],
   }],
  },
  newsprint: {
    label: 'Newsprint',
    description: '',
    actions: [{
      action: 'newsprint',
      required: true,
      controls: {
        ...actionSchemas['newsprint'].controls,
      },
      excludeFromUI: [],
   }],
  },
  notblue: {
    label: 'Remove blue channel',
    description: '',
    actions: [{
      action: 'set-channel-to-level',
      required: true,
      controls: {
        ...actionSchemas['set-channel-to-level'].controls,

        // Overwrites
        includeBlue: {
          controlType: 'boolean',
          default: true,
          label: 'Include blue channel',
          description: '',
        },
      },
      excludeFromUI: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'level'],
   }],
  },
  notgreen: {
    label: 'Remove green channel',
    description: '',
    actions: [{
      action: 'set-channel-to-level',
      required: true,
      controls: {
        ...actionSchemas['set-channel-to-level'].controls,

        // Overwrites
        includeGreen: {
          controlType: 'boolean',
          default: true,
          label: 'Include green channel',
          description: '',
        },
      },
      excludeFromUI: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'level'],
   }],
  },
  notred: {
    label: 'Remove red channel',
    description: '',
    actions: [{
      action: 'set-channel-to-level',
      required: true,
      controls: {
        ...actionSchemas['set-channel-to-level'].controls,

        // Overwrites
        includeRed: {
          controlType: 'boolean',
          default: true,
          label: 'Include red channel',
          description: '',
        },
      },
      excludeFromUI: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'level'],
   }],
  },
  offset: {
    label: 'Offset',
    description: '',
    actions: [{
      action: 'offset',
      required: true,
      controls: {
        ...actionSchemas['offset'].controls,

        // Combined controls
        offsetX: {
          controlType: 'number',
          alternativeControl: true,
          alternativeFor: ['offsetRedX', 'offsetGreenX', 'offsetBlueX', 'offsetAlphaX'],
          default: 0,
          minValue: -500,
          maxValue: 500,
          step: 1,
          label: 'Horizontal offset',
          description: '',
        },
        offsetY: {
          controlType: 'number',
          alternativeControl: true,
          alternativeFor: ['offsetRedY', 'offsetGreenY', 'offsetBlueY', 'offsetAlphaY'],
          default: 0,
          minValue: -500,
          maxValue: 500,
          step: 1,
          label: 'Vertical offset',
          description: '',
        },
      },
      excludeFromUI: [],
   }],
  },
  okCurveWeights: {
    label: 'OK pereceptual curves',
    description: '',
    actions: [{
      action: 'ok-perceptual-curves',
      required: true,
      controls: {
        ...actionSchemas['ok-perceptual-curves'].controls,
      },
      excludeFromUI: [],
   }],
  },
  pixelate: {
    label: 'Pixelate',
    description: '',
    actions: [{
      action: 'pixelate',
      required: true,
      controls: {
        ...actionSchemas['pixelate'].controls,
      },
      excludeFromUI: [],
   }],
  },
  randomNoise: {
    label: 'Random noise',
    description: '',
    actions: [{
      action: 'random-noise',
      required: true,
      controls: {
        ...actionSchemas['random-noise'].controls,
      },
      excludeFromUI: [],
   }],
  },
  red: {
    label: 'Red only',
    description: '',
    actions: [{
      action: 'average-channels',
      required: true,
      controls: {
        ...actionSchemas['average-channels'].controls,

        // Overwrites
        excludeGreen: {
          controlType: 'boolean',
          default: true,
        },
        excludeBlue: {
          controlType: 'boolean',
          default: true,
        },
      },
      excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    }],
  },
  reducePalette: {
    label: 'Reduce palette',
    description: '',
    actions: [{
      action: 'reduce-palette',
      required: true,
      controls: {
        ...actionSchemas['reduce-palette'].controls,
      },
      excludeFromUI: [],
   }],
  },
  rotateHue: {
    label: 'Rotate hue',
    description: '',
    actions: [{
      action: 'rotate-hue',
      required: true,
      controls: {
        ...actionSchemas['rotate-hue'].controls,
      },
      excludeFromUI: [],
   }],
  },
  saturation: {
    label: 'Brightness',
    description: '',
    actions: [{
      action: 'modulate-channels',
      required: true,
      controls: {
        ...actionSchemas['modulate-channels'].controls,

        // Overwrites
        saturation: {
          controlType: 'boolean',
          default: true,
          label: 'Use gray as base',
          description: 'When false, acts as a brightness filter; when true, acts as a saturation filter',
        },
      },
      excludeFromUI: ['saturation', 'alpha'],
    }],
  },
  sepia: {
    label: 'Sepia',
    description: '',
    actions: [{
      action: 'tint',
      required: true,
      controls: {
        ...actionSchemas['tint'].controls,

        // Overwrites
        redInRed: {
          controlType: 'number',
          default: 0.393,
          minValue: 0,
          maxValue: 1,
          step: 0.001,
          label: 'Red-in-red',
          description: '',
        },
        redInGreen: {
          controlType: 'number',
          default: 0.349,
          minValue: 0,
          maxValue: 1,
          step: 0.001,
          label: 'Red-in-green',
          description: '',
        },
        redInBlue: {
          controlType: 'number',
          default: 0.272,
          minValue: 0,
          maxValue: 1,
          step: 0.001,
          label: 'Red-in-blue',
          description: '',
        },
        greenInRed: {
          controlType: 'number',
          default: 0.769,
          minValue: 0,
          maxValue: 1,
          step: 0.001,
          label: 'Green-in-red',
          description: '',
        },
        greenInGreen: {
          controlType: 'number',
          default: 0.686,
          minValue: 0,
          maxValue: 1,
          step: 0.001,
          label: 'Green-in-green',
          description: '',
        },
        greenInBlue: {
          controlType: 'number',
          default: 0.534,
          minValue: 0,
          maxValue: 1,
          step: 0.001,
          label: 'Green-in-blue',
          description: '',
        },
        blueInRed: {
          controlType: 'number',
          default: 0.189,
          minValue: 0,
          maxValue: 1,
          step: 0.001,
          label: 'Blue-in-red',
          description: '',
        },
        blueInGreen: {
          controlType: 'number',
          default: 0.168,
          minValue: 0,
          maxValue: 1,
          step: 0.001,
          label: 'Blue-in-green',
          description: '',
        },
        blueInBlue: {
          controlType: 'number',
          default: 0.131,
          minValue: 0,
          maxValue: 1,
          step: 0.001,
          label: 'Blue-in-blue',
          description: '',
        },
      },
      excludeFromUI: ['redInRed', 'redInGreen', 'redInBlue', 'greenInRed', 'greenInGreen', 'greenInBlue', 'blueInRed', 'blueInGreen', 'blueInBlue'],
   }],
  },
  sharpen: {
    label: 'Sharpen',
    description: '',
    actions: [{
      action: 'matrix',
      required: true,
      controls: {
        ...actionSchemas['matrix'].controls,

        // Overwrites
        weights: {
          controlType: 'bespoke',
          default: [0, -1, 0, -1, 5, -1, 0, -1, 0],
          label: 'Matrix weights',
          description: 'An array of matrix weights, with length = width * height',
        },
      },
      excludeFromUI: ['width', 'height', 'offsetX', 'offsetY', 'includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'weights'],
    }],
  },
  tiles: {
    label: 'Tiles',
    description: '',
    actions: [{
      action: 'tiles',
      required: true,
      controls: {
        ...actionSchemas['tiles'].controls,
      },
      excludeFromUI: [],
   }],
  },
  tint: {
    label: 'Tint',
    description: '',
    actions: [{
      action: 'tint',
      required: true,
      controls: {
        ...actionSchemas['tint'].controls,

        // Combined controls
        redColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['redInRed', 'greenInRed', 'blueInRed'],
          default: 'rgb(255 0 0)',
          label: 'Red color',
          description: '',
        },
        greenColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['redInGreen', 'greenInGreen', 'blueInGreen'],
          default: 'rgb(0 255 0)',
          label: 'Green color',
          description: '',
        },
        blueColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['redInBlue', 'greenInBlue', 'blueInBlue'],
          default: 'rgb(0 0 255)',
          label: 'Blue color',
          description: '',
        },
      },
      excludeFromUI: [],
   }],
  },
  unsharp: {
    label: 'Unsharpen',
    description: '',
    actions: [{
      action: 'unsharp',
      required: true,
      controls: {
        ...actionSchemas['unsharp'].controls,
      },
      excludeFromUI: [],
   }],
  },
  yellow: {
    label: 'Yellow only',
    description: '',
    actions: [{
      action: 'average-channels',
      required: true,
      controls: {
        ...actionSchemas['average-channels'].controls,

        // Overwrites
        includeRed: {
          controlType: 'boolean',
          default: true,
        },
        includeGreen: {
          controlType: 'boolean',
          default: true,
        },
        excludeBlue: {
          controlType: 'boolean',
          default: true,
        },
      },
      excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    }],
  },
  zoomBlur: {
    label: 'Zoom blur',
    description: '',
    actions: [{
      action: 'zoom-blur',
      required: true,
      controls: {
        ...actionSchemas['zoom-blur'].controls,
      },
      excludeFromUI: [],
   }],
  },
};

  // ['UPDATE-ME']: {
  //   label: 'CHANGE ME',
  //   description: '',
  //   controls: {
  //     ...requiredControls,
  //     NUMBER: {
  //       controlType: 'number',
  //       default: 1,
  //       minValue: 0,
  //       maxValue: 3,
  //       step: 0.01,
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     BOOLEAN: {
  //       controlType: 'boolean',
  //       default: false,
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     TEXT: {
  //       controlType: 'text',
  //       default: '',
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     SELECT: {
  //       controlType: 'select',
  //       default: 'mean',
  //       options: ['mean', 'lowest', 'highest'],
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     BESPOKE: {
  //       controlType: 'bespoke',
  //       default: [0],
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //   },
  // },

  // FIX_ME: {
  //   label: 'CHANGE ME',
  //   description: '',
  //   actions: [{
  //     action: 'UPDATE-ME',
  //     required: true,
  //     controls: {
  //       ...actionSchemas['UPDATE-ME'].controls,
  //     },
  //     excludeFromUI: [],
  //  }],
  // },


  //   emboss: {
  //       controls: [{}],
  //       action: [{
  //       }]

  //       const actions = [];
  //       if (f.useNaturalGrayscale) {
  //           actions.push({
  //               action: GRAYSCALE,
  //               lineIn: (f.lineIn != null) ? f.lineIn : '',
  //               lineOut: EMBOSS_WORK,
  //           });
  //       }
  //       else {
  //           actions.push({
  //               action: AVERAGE_CHANNELS,
  //               lineIn: (f.lineIn != null) ? f.lineIn : '',
  //               lineOut: EMBOSS_WORK,
  //               includeRed: true,
  //               includeGreen: true,
  //               includeBlue: true,
  //           });
  //       }
  //       if (f.clamp) {
  //           actions.push({
  //               action: CLAMP_CHANNELS,
  //               lineIn: EMBOSS_WORK,
  //               lineOut: EMBOSS_WORK,
  //               lowRed: 0 + f.clamp,
  //               lowGreen: 0 + f.clamp,
  //               lowBlue: 0 + f.clamp,
  //               highRed: 255 - f.clamp,
  //               highGreen: 255 - f.clamp,
  //               highBlue: 255 - f.clamp,
  //           });
  //       }
  //       if (f.smoothing) {
  //           actions.push({
  //               action: GAUSSIAN_BLUR,
  //               lineIn: EMBOSS_WORK,
  //               lineOut: EMBOSS_WORK,
  //               radius: f.smoothing,
  //           });
  //       }
  //       actions.push({
  //           action: EMBOSS,
  //           lineIn: EMBOSS_WORK,
  //           lineOut: (f.lineOut != null) ? f.lineOut : '',
  //           opacity: (f.opacity != null) ? f.opacity : 1,
  //           angle: (f.angle != null) ? f.angle : 0,
  //           strength: (f.strength != null) ? f.strength : 1,
  //           tolerance: (f.tolerance != null) ? f.tolerance : 0,
  //           keepOnlyChangedAreas: (f.keepOnlyChangedAreas != null) ? f.keepOnlyChangedAreas : false,
  //           postProcessResults: (f.postProcessResults != null) ? f.postProcessResults : true,
  //       });
  //       f.actions = actions;
  //   },












  // ['UPDATE-ME']: {
  //   label: 'CHANGE ME',
  //   description: '',
  //   controls: {
  //     ...requiredControls,
  //     NUMBER: {
  //       controlType: 'number',
  //       default: 1,
  //       minValue: 0,
  //       maxValue: 3,
  //       step: 0.01,
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     BOOLEAN: {
  //       controlType: 'boolean',
  //       default: false,
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     TEXT: {
  //       controlType: 'text',
  //       default: '',
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     SELECT: {
  //       controlType: 'select',
  //       default: 'mean',
  //       options: ['mean', 'lowest', 'highest'],
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     BESPOKE: {
  //       controlType: 'bespoke',
  //       default: [0],
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //   },
  // },

  // FIX_ME: {
  //   label: 'CHANGE ME',
  //   description: '',
  //   actions: [{
  //     action: 'UPDATE-ME',
  //     required: true,
  //     controls: {
  //       ...actionSchemas['UPDATE-ME'].controls,
  //     },
  //     excludeFromUI: [],
  //  }],
  // },


  //   image: function (f) {
  //       controls: [{
  //           isPreset: false,
  //           requiresMix: false,
  //           requiresImage: false,
  //           requiresGradient: false,
  //       }],
  //       action: [{
  //       }]


  //       const o = {
  //           action: PROCESS_IMAGE,
  //           lineIn: '',
  //           asset: (f.asset != null) ? f.asset : '',
  //           copyWidth: (f.copyWidth != null) ? f.copyWidth : 1,
  //           copyHeight: (f.copyHeight != null) ? f.copyHeight : 1,
  //           copyX: (f.copyX != null) ? f.copyX : 0,
  //           copyY: (f.copyY != null) ? f.copyY : 0,
  //       };

  //       o.identifier = `user-image-${o.asset}-${generateUuid()}`;

  //       f.actions = [o];
  //   },












  // ['UPDATE-ME']: {
  //   label: 'CHANGE ME',
  //   description: '',
  //   controls: {
  //     ...requiredControls,
  //     NUMBER: {
  //       controlType: 'number',
  //       default: 1,
  //       minValue: 0,
  //       maxValue: 3,
  //       step: 0.01,
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     BOOLEAN: {
  //       controlType: 'boolean',
  //       default: false,
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     TEXT: {
  //       controlType: 'text',
  //       default: '',
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     SELECT: {
  //       controlType: 'select',
  //       default: 'mean',
  //       options: ['mean', 'lowest', 'highest'],
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     BESPOKE: {
  //       controlType: 'bespoke',
  //       default: [0],
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //   },
  // },

  // FIX_ME: {
  //   label: 'CHANGE ME',
  //   description: '',
  //   actions: [{
  //     action: 'UPDATE-ME',
  //     required: true,
  //     controls: {
  //       ...actionSchemas['UPDATE-ME'].controls,
  //     },
  //     excludeFromUI: [],
  //  }],
  // },


  //   swirl: function (f) {
  //       controls: [{
  //           isPreset: false,
  //           requiresMix: false,
  //           requiresImage: false,
  //           requiresGradient: false,
  //       }],
  //       action: [{
  //       }]

// Check to see if startX/startY can take % values - if not, update filter to make this happen
  //       const startX = (f.startX != null) ? f.startX : PC50,
  //           startY = (f.startY != null) ? f.startY : PC50,
// Check to see if innerRadius/outerRadius can take % values - if not, update filter to make this happen
  //           innerRadius = (f.innerRadius != null) ? f.innerRadius : 0,
  //           outerRadius = (f.outerRadius != null) ? f.outerRadius : PC30,
  //           angle = (f.angle != null) ? f.angle : 0,
  //           easing = (f.easing != null) ? f.easing : LINEAR,
  //           staticSwirls = (f.staticSwirls != null) ? f.staticSwirls : [];

  //       const swirls = [...staticSwirls];
  //       swirls.push([startX, startY, innerRadius, outerRadius, angle, easing]);

  //       f.actions = [{
  //           action: SWIRL,
  //           lineIn: '',
  //           lineOut: '',
  //           opacity: 1,
  //           swirls,
  //           transparentEdges: (f.transparentEdges != null) ? f.transparentEdges : false,
  //           useInputAsMask: (f.useInputAsMask != null) ? f.useInputAsMask : false,
  //       }];
  //   },












  // ['UPDATE-ME']: {
  //   label: 'CHANGE ME',
  //   description: '',
  //   controls: {
  //     ...requiredControls,
  //     NUMBER: {
  //       controlType: 'number',
  //       default: 1,
  //       minValue: 0,
  //       maxValue: 3,
  //       step: 0.01,
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     BOOLEAN: {
  //       controlType: 'boolean',
  //       default: false,
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     TEXT: {
  //       controlType: 'text',
  //       default: '',
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     SELECT: {
  //       controlType: 'select',
  //       default: 'mean',
  //       options: ['mean', 'lowest', 'highest'],
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //     BESPOKE: {
  //       controlType: 'bespoke',
  //       default: [0],
  //       label: 'CHANGE ME',
  //       description: '',
  //     },
  //   },
  // },

  // FIX_ME: {
  //   label: 'CHANGE ME',
  //   description: '',
  //   actions: [{
  //     action: 'UPDATE-ME',
  //     required: true,
  //     controls: {
  //       ...actionSchemas['UPDATE-ME'].controls,
  //     },
  //     excludeFromUI: [],
  //  }],
  // },


  //   threshold: function (f) {
  //       controls: [{
  //           isPreset: false,
  //           requiresMix: false,
  //           requiresImage: false,
  //           requiresGradient: false,
  //       }],
  //       action: [{
  //       }]

  //       let lowRed = (f.lowRed != null) ? f.lowRed : 0,
  //           lowGreen = (f.lowGreen != null) ? f.lowGreen : 0,
  //           lowBlue = (f.lowBlue != null) ? f.lowBlue : 0,
  //           lowAlpha = (f.lowAlpha != null) ? f.lowAlpha : 255,
  //           highRed = (f.highRed != null) ? f.highRed : 255,
  //           highGreen = (f.highGreen != null) ? f.highGreen : 255,
  //           highBlue = (f.highBlue != null) ? f.highBlue : 255,
  //           highAlpha = (f.highAlpha != null) ? f.highAlpha : 255;

  //       if (f.lowColor != null) {

  //           [lowRed, lowGreen, lowBlue, lowAlpha] = colorEngine.extractRGBfromColorString(f.lowColor);

  //           lowAlpha = _round(lowAlpha * 255);

  //           f.lowRed = lowRed;
  //           f.lowGreen = lowGreen;
  //           f.lowBlue = lowBlue;
  //           f.lowAlpha = lowAlpha;

  //           f.low = [lowRed, lowGreen, lowBlue, lowAlpha];

  //           delete f.lowColor;
  //       }

  //       if (f.highColor != null) {

  //           [highRed, highGreen, highBlue, highAlpha] = colorEngine.extractRGBfromColorString(f.highColor);

  //           highAlpha = _round(highAlpha * 255);

  //           f.highRed = highRed;
  //           f.highGreen = highGreen;
  //           f.highBlue = highBlue;
  //           f.highAlpha = highAlpha;

  //           f.high = [highRed, highGreen, highBlue, highAlpha];

  //           delete f.highColor;
  //       }

  //       const low = (f.low != null) ? f.low : [lowRed, lowGreen, lowBlue, lowAlpha],
  //           high = (f.high != null) ? f.high : [highRed, highGreen, highBlue, highAlpha];

  //       f.actions = [{
  //           action: THRESHOLD,
  //           lineIn: '',
  //           lineOut: '',
  //           opacity: 1,
  //           level: (f.level != null) ? f.level : 128,
  //           red: (f.red != null) ? f.red : 128,
  //           green: (f.green != null) ? f.green : 128,
  //           blue: (f.blue != null) ? f.blue : 128,
  //           alpha: (f.alpha != null) ? f.alpha : 128,
  //           low,
  //           high,
  //           includeRed: (f.includeRed != null) ? f.includeRed : true,
  //           includeGreen: (f.includeGreen != null) ? f.includeGreen : true,
  //           includeBlue: (f.includeBlue != null) ? f.includeBlue : true,
  //           includeAlpha: (f.includeAlpha != null) ? f.includeAlpha : false,
  //           useMixedChannel: (f.useMixedChannel != null) ? f.useMixedChannel : true,
  //       }];
  //   },




// TODO: want to add functionality to allow user to define a filter that can be treated as an image asset that can then be applied to the whole image (eg blend the gradient into the image)

// TODO: something about the "https://petapixel.com/2017/02/23/orange-teal-look-popular-hollywood/" teal-and-orange contrast effect? Research if we can already achieve such an effect with existing filters (if yes, create an easy-to-apply filter to make it happen)

// TODO: would be fabulous to include a way to create repeating watermarks across an image
