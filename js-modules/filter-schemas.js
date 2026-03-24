/*
Initial thoughts on how we use the definitions in this file.

1. They are reference objects. Whenever a user adds a new filter action to the filter they are building, we can create an object for them by looking at these definitions and building a proper action object which they can then manipulate.

2. Manipulation will be done via dynamic form controls. The tool will include form building functionality to determine the fields it will add to the form to support the action being edited. We can also dynamically wire up the form to the action object with SC functionality (we can create an "actions factory" which includes a simple "set" function, which scrawl.makeUpdater can target). These definitions should include sufficient details for us to add eg limits to form input elements, etc

3. We will not show these filter definitions to the user. Instead they will select/use filters from the filter factory definitions further down the page

4. Users can download filters (as scrawl-canvas packets) and import them in a future session - thus we will need functionality to turn those packets into things we can work with

5. The user should expect to see changes they make to a filter's attributes in real time, if an image is currently being displayed in the canvas

Note that every filter created or imported needs to have a name unique to the current user session. We'll cross that bridge when we face that river.
*/

// __requiredControls__ - all filter action objects (except one) require the following controls
const requiredControls = {
  lineIn: {
    controlType: 'line-text',
    default: '',
    label: 'Line in',
    description: '',
  },
  lineOut: {
    controlType: 'line-text',
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

/*
__actionSchemas__ models the filter action objects which make up a Scrawl-canvas filter's actions array. Each filter is keyed by its filter-engine name (which often includes hyphens). Each attribute is a filter definition with the following attributes
- `label` - filter's human-readable name
- `description` - for tool tips, etc
- `actions` - the action object definition for that filter (placed in an array for compatibility with the filter factory definitions below)

We define the attributes that an individual action object takes on the actionSchemas[filter].actions.controls object
- attribute key;
- `controlType` - what sort of input best suits the attributes
- `default` - the default value
- any other value which can help us construct a form input/select for the attribute
- `label`  - suggested label for input/select control
- `description` - could be used for tool tips, etc
*/

const actionSchemas = {

  ['alpha-to-channels']: {
    label: 'Set alpha to channels',
    description: '',
    actions: [{
      action: 'alpha-to-channels',
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
    }],
  },

  ['alpha-to-luminance']: {
    label: 'Set alpha to luminance',
    description: 'alpha-to-luminance',
    actions: [{
      action: 'alpha-to-luminance',
      controls: {
        ...requiredControls,
      },
    }],
  },

  ['area-alpha']: {
    label: 'Area alpha',
    description: '',
    actions: [{
      action: 'area-alpha',
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
          controlType: 'bespoke-area-alpha',
          default: [255, 0, 0, 0],
          label: '',
          description: 'Array of four numbers, each between 0 and 255, representing the alpha values for each [?, ?, ?, ?] area',
        },
      },
    }],
  },

  ['average-channels']: {
    label: 'Average channels',
    description: '',
    actions: [{
      action: 'average-channels',
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
    }],
  },

  ['blend']: {
    label: 'Blend operations',
    description: '',
    actions: [{
      action: 'blend',
      controls: {
        ...requiredControls,
        lineMix: {
          controlType: 'line-text',
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
    }],
  },

  ['blur']: {
    label: 'Box blur',
    description: '',
    actions: [{
      action: 'blur',
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
    }],
  },

  ['channels-to-alpha']: {
    label: 'Set channels to alpha',
    description: '',
    actions: [{
      action: 'channels-to-alpha',
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
    }],
  },

  ['chroma']: {
    label: 'Chroma ranges',
    description: '',
    actions: [{
      action: 'chroma',
      controls: {
        ...requiredControls,
        ranges: {
          controlType: 'bespoke-chroma-ranges',
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
        feather: {
          controlType: 'number',
          alternativeControl: true,
          alternativeFor: ['featherRed', 'featherGreen', 'featherBlue'],
          alternativeAction: 'set-alternatives-to-this',
          default: 0,
          minValue: 0,
          maxValue: 255,
          step: 1,
          label: '',
          description: '',
        },
      },
    }],
  },

  ['clamp-channels']: {
    label: 'Clamp channels',
    description: '',
    actions: [{
      action: 'clamp-channels',
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
        lowColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['lowRed', 'lowGreen', 'lowBlue'],
          alternativeAction: 'set-color-channels-to-this',
          default: 'rgb(0 0 0)',
          label: 'Low color',
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
        highColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['highRed', 'highGreen', 'highBlue'],
          alternativeAction: 'set-color-channels-to-this',
          default: 'rgb(255 255 255)',
          label: 'High color',
          description: '',
        },
      },
    }],
  },

  ['compose']: {
    label: 'Composition operations',
    description: '',
    actions: [{
      action: 'compose',
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
    }],
  },

  ['corrode']: {
    label: 'Corrode',
    description: '',
    actions: [{
      action: 'corrode',
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
    }],
  },

  ['colors-to-alpha']: {
    label: 'Chroma key',
    description: '',
    actions: [{
      action: 'colors-to-alpha',
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
        reference: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['red', 'green', 'blue'],
          alternativeAction: 'set-color-channels-to-this',
          default: 'rgb(0 255 0)',
          label: 'Reference color',
          description: '',
        },
      },
    }],
  },

  ['deconvolute']: {
    label: 'Deconvolute',
    description: '',
    actions: [{
      action: 'deconvolute',
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
    }],
  },

  ['displace']: {
    label: 'Displace',
    description: '',
    actions: [{
      action: 'displace',
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
    }],
  },

  ['emboss']: {
    label: 'Emboss',
    description: '',
    actions: [{
      action: 'emboss',
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
        strength: {
          controlType: 'number',
          default: 3,
          minValue: 0,
          maxValue: 10,
          step: 0.1,
          label: 'Strength',
          description: '',
        },
        tolerance: {
          controlType: 'number',
          default: 1,
          minValue: 0,
          maxValue: 50,
          step: 1,
          label: 'Tolerance',
          description: '',
        },
        keepOnlyChangedAreas: {
          controlType: 'boolean',
          default: false,
          label: 'Keep only changed areas',
          description: '',
        },
        postProcessResults: {
          controlType: 'boolean',
          default: true,
          label: 'Post-process results',
          description: '',
        },
      },
    }],
  },

  ['flood']: {
    label: 'Flood',
    description: '',
    actions: [{
      action: 'flood',
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
    }],
  },

  ['gaussian-blur']: {
    label: 'Gaussian blur',
    description: '',
    actions: [{
      action: 'gaussian-blur',
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
    }],
  },

  ['glitch']: {
    label: 'Glitch',
    description: '',
    actions: [{
      action: 'glitch',
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
    }],
  },

  ['grayscale']: {
    label: 'Grayscale',
    description: '',
    actions: [{
      action: 'grayscale',
      controls: {
        ...requiredControls,
      },
    }],
  },

  ['invert-channels']: {
    label: 'Invert channels',
    description: '',
    actions: [{
      action: 'invert-channels',
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
    }],
  },

  ['lock-channels-to-levels']: {
    label: 'Posterize by channel',
    description: '',
    actions: [{
      action: 'lock-channels-to-levels',
      controls: {
        ...requiredControls,
        red: {
          controlType: 'bespoke-lock-channels-to-levels',
          default: [0],
          label: 'Red channel pins',
          description: 'An array of integer numbers, each between 0 and 255',
        },
        green: {
          controlType: 'bespoke-lock-channels-to-levels',
          default: [0],
          label: 'Green channel pins',
          description: 'An array of integer numbers, each between 0 and 255',
        },
        blue: {
          controlType: 'bespoke-lock-channels-to-levels',
          default: [0],
          label: 'Blue channel pins',
          description: 'An array of integer numbers, each between 0 and 255',
        },
        alpha: {
          controlType: 'bespoke-lock-channels-to-levels',
          default: [255],
          label: 'Alpha channel pins',
          description: 'An array of integer numbers, each between 0 and 255',
        },
      },
    }],
  },

  ['luminance-to-alpha']: {
    label: 'Luminance to alpha',
    description: '',
    actions: [{
      action: 'luminance-to-alpha',
      controls: {
        ...requiredControls,
      },
    }],
  },

  ['map-to-gradient']: {
    label: 'Map to gradient',
    description: '',
    actions: [{
      action: 'map-to-gradient',
      controls: {
        ...requiredControls,
        useNaturalGrayscale: {
          controlType: 'boolean',
          default: false,
          label: 'Use natural grayscale',
          description: 'When set to true, uses a grayscaled image rather than a simple gray image as the base for the filter\'s work',
        },
        gradient: {
          controlType: 'bespoke-map-to-gradient',
          default: null,
          label: 'Gradient',
          description: 'Expects to receive a Scrawl-canvas LinearGradient object, or the name value of the object. We need to create a gradient builder mini-tool before we can use this filter in the main tool',
        },
      },
    }],
  },

  ['matrix']: {
    label: 'Matrix',
    description: '',
    actions: [{
      action: 'matrix',
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
          controlType: 'bespoke-matrix-weights',
          default: [0, 0, 0, 0, 1, 0, 0, 0, 0],
          label: 'Matrix weights',
          description: 'An array of matrix weights, with length = width * height',
        },
      },
    }],
  },

  ['modify-ok-channels']: {
    label: 'Modify OK channels',
    description: '',
    actions: [{
      action: 'modify-ok-channels',
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
    }],
  },

  ['modulate-channels']: {
    label: 'Modulate channels',
    description: '',
    actions: [{
      action: 'modulate-channels',
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
    }],
  },

  ['modulate-ok-channels']: {
    label: 'Modulate OK channels',
    description: '',
    actions: [{
      action: 'modulate-ok-channels',
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
    }],
  },
  ['negative']: {
    label: 'Negative',
    description: 'Invert OKLab channel colors',
    actions: [{
      action: 'negative',
      controls: {
        ...requiredControls,
      },
    }],
  },

  ['newsprint']: {
    label: 'Newsprint',
    description: '',
    actions: [{
      action: 'newsprint',
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
    }],
  },

  ['offset']: {
    label: 'Offset',
    description: '',
    actions: [{
      action: 'offset',
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
        offsetX: {
          controlType: 'number',
          alternativeControl: true,
          alternativeFor: ['offsetRedX', 'offsetGreenX', 'offsetBlueX', 'offsetAlphaX'],
          alternativeAction: 'set-alternatives-to-this',
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
          alternativeAction: 'set-alternatives-to-this',
          default: 0,
          minValue: -500,
          maxValue: 500,
          step: 1,
          label: 'Vertical offset',
          description: '',
        },
        useInputAsMask: {
          controlType: 'boolean',
          default: false,
          label: 'Use input as mask',
          description: '',
        },
      },
    }],
  },

  ['ok-perceptual-curves']: {
    label: 'OK pereceptual curves',
    description: '',
    actions: [{
      action: 'ok-perceptual-curves',
      controls: {
        ...requiredControls,
        weights: {
          controlType: 'bespoke-ok-perceptual-curves',
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
    }],
  },

  ['pixelate']: {
    label: 'Pixelate',
    description: '',
    actions: [{
      action: 'pixelate',
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
    }],
  },

  ['random-noise']: {
    label: 'Random noise',
    description: '',
    actions: [{
      action: 'random-noise',
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
    }],
  },

  ['reduce-palette']: {
    label: 'Reduce palette',
    description: '',
    actions: [{
      action: 'reduce-palette',
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
          controlType: 'bespoke-reduce-palette',
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
    }],
  },

  ['rotate-hue']: {
    label: 'Rotate hue',
    description: '',
    actions: [{
      action: 'rotate-hue',
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
    }],
  },

  ['set-channel-to-level']: {
    label: 'Set channels to level',
    description: '',
    actions: [{
      action: 'set-channel-to-level',
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
    }],
  },

  ['step-channels']: {
    label: 'Channel step',
    description: '',
    actions: [{
      action: 'step-channels',
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
    }],
  },

  ['tiles']: {
    label: 'Tiles',
    description: '',
    actions: [{
      action: 'tiles',
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
          controlType: 'bespoke-tiles-points-data',
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
    }],
  },

  ['tint']: {
    label: 'Tint',
    description: '',
    actions: [{
      action: 'tint',
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
        redColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['redInRed', 'greenInRed', 'blueInRed'],
          alternativeAction: 'set-color-channels-to-this',
          default: 'rgb(255 0 0)',
          label: 'Red color',
          description: '',
        },
        greenColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['redInGreen', 'greenInGreen', 'blueInGreen'],
          alternativeAction: 'set-color-channels-to-this',
          default: 'rgb(0 255 0)',
          label: 'Green color',
          description: '',
        },
        blueColor: {
          controlType: 'color',
          alternativeControl: true,
          alternativeFor: ['redInBlue', 'greenInBlue', 'blueInBlue'],
          alternativeAction: 'set-color-channels-to-this',
          default: 'rgb(0 0 255)',
          label: 'Blue color',
          description: '',
        },
      },
    }],
  },
  ['unsharp']: {
    label: 'Unsharpen',
    description: '',
    actions: [{
      action: 'unsharp',
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
    }],
  },

  ['vary-channels-by-weights']: {
    label: 'Vary channels by weights',
    description: '',
    actions: [{
      action: 'vary-channels-by-weights',
      controls: {
        ...requiredControls,
        weights: {
          controlType: 'bespoke-vary-channel-by-weights',
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
    }],
  },

  ['zoom-blur']: {
    label: 'Zoom blur',
    description: '',
    actions: [{
      action: 'zoom-blur',
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
    }],
  },
};

/*
The __filterSchemas__ objects map directly to the Scrawl-canvas filter factory's methods. Note that they actually get their definitions from the actionSchemas object, most without changing anything. A few are variations on an action object, overriding default values. Some also populate the `excludeFromUI` array, hopefully to make the editing forms a little simpler for the user.

We will be presenting the user with this object's keys when they choose to add a new action object 
*/ 
const filterSchemaObjects = {

  alphaToChannels: {
    ...actionSchemas['alpha-to-channels'],
    excludeFromUI: [],
    kind: 'action',
  },
  alphaToLuminance: {
    ...actionSchemas['alpha-to-luminance'],
    excludeFromUI: [],
    kind: 'action',
  },
  areaAlpha: {
    ...actionSchemas['area-alpha'],
    excludeFromUI: [],
    kind: 'action',
  },
  blend: {
    ...actionSchemas['blend'],
    excludeFromUI: [],
    kind: 'action',
  },
  blur: {
    ...actionSchemas['blur'],
    excludeFromUI: [],
    kind: 'action',
  },
  channelLevels: {
    ...actionSchemas['lock-channels-to-levels'],
    excludeFromUI: [],
    kind: 'action',
  },
  channelstep: {
    ...actionSchemas['step-channels'],
    excludeFromUI: [],
    kind: 'action',
  },
  channelsToAlpha: {
    ...actionSchemas['channels-to-alpha'],
    excludeFromUI: [],
    kind: 'action',
  },
  chroma: {
    ...actionSchemas['chroma'],
    excludeFromUI: [],
    kind: 'action',
  },
  chromakey: {
    ...actionSchemas['colors-to-alpha'],
    excludeFromUI: [],
    kind: 'action',
  },
  clampChannels: {
    ...actionSchemas['clamp-channels'],
    excludeFromUI: [],
    kind: 'action',
  },
  compose: {
    ...actionSchemas['compose'],
    excludeFromUI: [],
    kind: 'action',
  },
  corrode: {
    ...actionSchemas['corrode'],
    excludeFromUI: [],
    kind: 'action',
  },
  curveWeights: {
    ...actionSchemas['vary-channels-by-weights'],
    excludeFromUI: [],
    kind: 'action',
  },
  deconvolute: {
    ...actionSchemas['deconvolute'],
    excludeFromUI: [],
    kind: 'action',
  },
  displace: {
    ...actionSchemas['displace'],
    excludeFromUI: [],
    kind: 'action',
  },
  emboss: {
    ...actionSchemas['emboss'],
    excludeFromUI: [],
    kind: 'action',
  },
  flood: {
    ...actionSchemas['flood'],
    excludeFromUI: [],
    kind: 'action',
  },
  gaussianBlur: {
    ...actionSchemas['gaussian-blur'],
    excludeFromUI: [],
    kind: 'action',
  },
  glitch: {
    ...actionSchemas['glitch'],
    excludeFromUI: [],
    kind: 'action',
  },
  grayscale: {
    ...actionSchemas['grayscale'],
    excludeFromUI: [],
    kind: 'action',
  },
  invert: {
    ...actionSchemas['invert-channels'],
    excludeFromUI: [],
    kind: 'action',
  },
  luminanceToAlpha: {
    ...actionSchemas['luminance-to-alpha'],
    excludeFromUI: [],
    kind: 'action',
  },
  mapToGradient: {
    ...actionSchemas['map-to-gradient'],
    excludeFromUI: [],
    kind: 'action',
  },
  matrix: {
    ...actionSchemas['matrix'],
    excludeFromUI: [],
    kind: 'action',
  },
  modifyOk: {
    ...actionSchemas['modify-ok-channels'],
    excludeFromUI: [],
    kind: 'action',
  },
  modulateOk: {
    ...actionSchemas['modulate-ok-channels'],
    excludeFromUI: [],
    kind: 'action',
  },
  negative: {
    ...actionSchemas['negative'],
    excludeFromUI: [],
    kind: 'action',
  },
  newsprint: {
    ...actionSchemas['newsprint'],
    excludeFromUI: [],
    kind: 'action',
  },
  offset: {
    ...actionSchemas['offset'],
    excludeFromUI: [],
    kind: 'action',
  },
  okCurveWeights: {
    ...actionSchemas['ok-perceptual-curves'],
    excludeFromUI: [],
    kind: 'action',
  },
  pixelate: {
    ...actionSchemas['pixelate'],
    excludeFromUI: [],
    kind: 'action',
  },
  randomNoise: {
    ...actionSchemas['random-noise'],
    excludeFromUI: [],
    kind: 'action',
  },
  reducePalette: {
    ...actionSchemas['reduce-palette'],
    excludeFromUI: [],
    kind: 'action',
  },
  rotateHue: {
    ...actionSchemas['rotate-hue'],
    excludeFromUI: [],
    kind: 'action',
  },
  tiles: {
    ...actionSchemas['tiles'],
    excludeFromUI: [],
    kind: 'action',
  },
  tint: {
    ...actionSchemas['tint'],
    excludeFromUI: [],
    kind: 'action',
  },
  unsharp: {
    ...actionSchemas['unsharp'],
    excludeFromUI: [],
    kind: 'action',
  },
  zoomBlur: {
    ...actionSchemas['zoom-blur'],
    excludeFromUI: [],
    kind: 'action',
  },

  blue: {
    label: 'Blue only',
    description: '',
    actions: [{
      action: 'average-channels',
      controls: {
        ...actionSchemas['average-channels'].actions[0].controls,
        excludeRed: {
          ...actionSchemas['average-channels'].actions[0].controls.excludeRed,
          default: true,
        },
        excludeGreen: {
          ...actionSchemas['average-channels'].actions[0].controls.excludeGreen,
          default: true,
        },
      },
    }],
    excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    kind: 'preset',
  },

  brightness: {
    label: 'Brightness',
    description: '',
    actions: [{
      action: 'modulate-channels',
      controls: {
        ...actionSchemas['modulate-channels'].actions[0].controls,
      },
    }],
    excludeFromUI: ['saturation', 'alpha'],
    kind: 'preset',
  },

  channels: {
    label: 'Channels modulation',
    description: '',
    actions: [{
      action: 'modulate-channels',
      controls: {
        ...actionSchemas['modulate-channels'].actions[0].controls,
      },
    }],
    excludeFromUI: ['saturation'],
    kind: 'preset',
  },

  cyan: {
    label: 'Cyan only',
    description: '',
    actions: [{
      action: 'average-channels',
      controls: {
        ...actionSchemas['average-channels'].actions[0].controls,

        // Overwrites
        excludeRed: {
          ...actionSchemas['average-channels'].actions[0].controls.excludeRed,
          default: true,
        },
        includeGreen: {
          ...actionSchemas['average-channels'].actions[0].controls.includeGreen,
          default: true,
        },
        includeBlue: {
          ...actionSchemas['average-channels'].actions[0].controls.includeBlue,
          default: true,
        },
      },
    }],
    excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    kind: 'preset',
  },

  edgeDetect: {
    label: 'Edge detect',
    description: '',
    actions: [{
      action: 'matrix',
      controls: {
        ...actionSchemas['matrix'].actions[0].controls,
        weights: {
          ...actionSchemas['matrix'].actions[0].controls.weights,
          default: [0, 1, 0, 1, -4, 1, 0, 1, 0],
        },
      },
    }],
    excludeFromUI: ['width', 'height', 'offsetX', 'offsetY', 'includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'weights'],
    kind: 'preset',
  },

  // We will need to specifically listen out for any invocation of this filter as it needs special treatment. While `helpers/filter-engine.js` does define an 'emboss' filter, the `factory/filters.js` does work to expand the user request to a set of four chained filters, each taking attributes specific to that method. The controls below are the ones listed for the method approach because: they do combine to give a more convincing "emboss" result; and the "method" approach can be used to emulate (in a very rough fashion) some SVG filter lighting effects.
  // - The best approach may be to just invoke the factory function using method, capture it and then steal its actions so we can proceed to create our dynamic actions in this tool ...?
  enhancedEmboss: {
    label: 'Enhanced emboss',
    description: '',
    actions: [{
      action: 'emboss',
      controls: {
        ...actionSchemas['emboss'].actions[0].controls,
        useNaturalGrayscale: {
          controlType: 'boolean',
          default: false,
          label: 'Use natural grayscale',
          description: 'When true, starts the action sequence by converting input to grayscale; when false, will use the simpler average-channels approach to strip away color',
        },
        clamp: {
          controlType: 'number',
          default: 0,
          minValue: 0,
          maxValue: 100,
          step: 0.01,
          label: 'Clamp',
          description: 'Applied as part of the clamp action',
        },
        smoothing: {
          controlType: 'number',
          default: 0,
          minValue: 0,
          maxValue: 12,
          step: 1,
          label: 'Smoothing',
          description: 'Applied as part of the gaussian-blur action',
        },
      },
    }],
    excludeFromUI: [],
    kind: 'method',
  },

  gray: {
    label: 'Monochrome gray',
    description: '',
    actions: [{
      action: 'average-channels',
      controls: {
        ...actionSchemas['average-channels'].actions[0].controls,
        includeRed: {
          ...actionSchemas['average-channels'].actions[0].controls.includeRed,
          default: true,
        },
        includeGreen: {
          ...actionSchemas['average-channels'].actions[0].controls.includeGreen,
          default: true,
        },
        includeBlue: {
          ...actionSchemas['average-channels'].actions[0].controls.includeBlue,
          default: true,
        },
      },
    }],
    excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    kind: 'preset',
  },

  green: {
    label: 'Green only',
    description: '',
    actions: [{
      action: 'average-channels',
      controls: {
        ...actionSchemas['average-channels'].actions[0].controls,
        excludeRed: {
          ...actionSchemas['average-channels'].actions[0].controls.excludeRed,
          default: true,
        },
        excludeBlue: {
          ...actionSchemas['average-channels'].actions[0].controls.excludeBlue,
          default: true,
        },
      },
    }],
    excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    kind: 'preset',
  },

  magenta: {
    label: 'Magenta only',
    description: '',
    actions: [{
      action: 'average-channels',
      required: true,
      controls: {
        ...actionSchemas['average-channels'].actions[0].controls,
        includeRed: {
          ...actionSchemas['average-channels'].actions[0].controls.includeRed,
          default: true,
        },
        excludeGreen: {
          ...actionSchemas['average-channels'].actions[0].controls.excludeGreen,
          default: true,
        },
        includeBlue: {
          ...actionSchemas['average-channels'].actions[0].controls.includeBlue,
          default: true,
        },
      },
    }],
    excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    kind: 'preset',
  },

  notblue: {
    label: 'Remove blue channel',
    description: '',
    actions: [{
      action: 'set-channel-to-level',
      controls: {
        ...actionSchemas['set-channel-to-level'].actions[0].controls,
        includeBlue: {
          ...actionSchemas['set-channel-to-level'].actions[0].controls.includeBlue,
          default: true,
        },
      },
    }],
    excludeFromUI: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'level'],
    kind: 'preset',
  },

  notgreen: {
    label: 'Remove green channel',
    description: '',
    actions: [{
      action: 'set-channel-to-level',
      controls: {
        ...actionSchemas['set-channel-to-level'].actions[0].controls,
        includeGreen: {
          ...actionSchemas['set-channel-to-level'].actions[0].controls.includeGreen,
          default: true,
        },
      },
    }],
    excludeFromUI: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'level'],
    kind: 'preset',
  },

  notred: {
    label: 'Remove red channel',
    description: '',
    actions: [{
      action: 'set-channel-to-level',
      controls: {
        ...actionSchemas['set-channel-to-level'].actions[0].controls,
        includeRed: {
          ...actionSchemas['set-channel-to-level'].actions[0].controls.includeRed,
          default: true,
        },
      },
   }],
    excludeFromUI: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'level'],
    kind: 'preset',
  },

  red: {
    label: 'Red only',
    description: '',
    actions: [{
      action: 'average-channels',
      controls: {
        ...actionSchemas['average-channels'].actions[0].controls,
        excludeGreen: {
          ...actionSchemas['average-channels'].actions[0].controls.excludeGreen,
          default: true,
        },
        excludeBlue: {
          ...actionSchemas['average-channels'].actions[0].controls.excludeBlue,
          default: true,
        },
      },
    }],
    excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    kind: 'preset',
  },

  saturation: {
    label: 'Saturation',
    description: '',
    actions: [{
      action: 'modulate-channels',
      controls: {
        ...actionSchemas['modulate-channels'].actions[0].controls,
        saturation: {
          ...actionSchemas['modulate-channels'].actions[0].controls.saturation,
          default: true,
        },
      },
    }],
    excludeFromUI: ['saturation', 'alpha'],
    kind: 'preset',
  },

  sepia: {
    label: 'Sepia',
    description: '',
    actions: [{
      action: 'tint',
      controls: {
        ...actionSchemas['tint'].actions[0].controls,
        redInRed: {
          ...actionSchemas['tint'].actions[0].controls.redInRed,
          default: 0.393,
        },
        redInGreen: {
          ...actionSchemas['tint'].actions[0].controls.redInGreen,
          default: 0.349,
        },
        redInBlue: {
          ...actionSchemas['tint'].actions[0].controls.redInBlue,
          default: 0.272,
        },
        greenInRed: {
          ...actionSchemas['tint'].actions[0].controls.greenInRed,
          default: 0.769,
        },
        greenInGreen: {
          ...actionSchemas['tint'].actions[0].controls.greenInGreen,
          default: 0.686,
        },
        greenInBlue: {
          ...actionSchemas['tint'].actions[0].controls.greenInBlue,
          default: 0.534,
        },
        blueInRed: {
          ...actionSchemas['tint'].actions[0].controls.blueInRed,
          default: 0.189,
        },
        blueInGreen: {
          ...actionSchemas['tint'].actions[0].controls.blueInGreen,
          default: 0.168,
        },
        blueInBlue: {
          ...actionSchemas['tint'].actions[0].controls.blueInBlue,
          default: 0.131,
        },
      },
    }],
    excludeFromUI: ['redInRed', 'redInGreen', 'redInBlue', 'greenInRed', 'greenInGreen', 'greenInBlue', 'blueInRed', 'blueInGreen', 'blueInBlue', 'redColor', 'greenColor', 'blueColor'],
    kind: 'preset',
  },

  sharpen: {
    label: 'Sharpen',
    description: '',
    actions: [{
      action: 'matrix',
      controls: {
        ...actionSchemas['matrix'].actions[0].controls,
        weights: {
          ...actionSchemas['matrix'].actions[0].controls.weights,
          default: [0, -1, 0, -1, 5, -1, 0, -1, 0],
        },
      },
    }],
    excludeFromUI: ['width', 'height', 'offsetX', 'offsetY', 'includeRed', 'includeGreen', 'includeBlue', 'includeAlpha', 'weights'],
    kind: 'preset',
  },

  yellow: {
    label: 'Yellow only',
    description: '',
    actions: [{
      action: 'average-channels',
      controls: {
        ...actionSchemas['average-channels'].actions[0].controls,
        includeRed: {
          ...actionSchemas['average-channels'].actions[0].controls.includeRed,
          default: true,
        },
        includeGreen: {
          ...actionSchemas['average-channels'].actions[0].controls.includeGreen,
          default: true,
        },
        excludeBlue: {
          ...actionSchemas['average-channels'].actions[0].controls.excludeBlue,
          default: true,
        },
      },
    }],
    excludeFromUI: ['excludeRed', 'excludeGreen', 'excludeBlue', 'includeRed', 'includeGreen', 'includeBlue'],
    kind: 'preset',
  },
};

// For protection, we'll export a JSON.stringified version of `filterSchemaObjects` - whenever code elsewhere wants to use the data, it can JSON.parse the string before doing anything. 
const FILTER_SCHEMAS_JSON = JSON.stringify(filterSchemaObjects);

// Export a function that always returns a fresh copy
export const getFilterSchemas = () => {
  try {
    return JSON.parse(FILTER_SCHEMAS_JSON);
  }
  catch (e) {
    throw new Error(`getFilterSchemas(): failed to parse FILTER_SCHEMAS_JSON - ${e?.message ?? e}`);
  }
};







/*
Below, the few remaining filters to be defined in the above system

Ignore these next few lines
  ['UPDATE-ME']: {
    label: 'CHANGE ME',
    description: '',
    controls: {
      ...requiredControls,
      NUMBER: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'CHANGE ME',
        description: '',
      },
      BOOLEAN: {
        controlType: 'boolean',
        default: false,
        label: 'CHANGE ME',
        description: '',
      },
      TEXT: {
        controlType: 'text',
        default: '',
        label: 'CHANGE ME',
        description: '',
      },
      SELECT: {
        controlType: 'select',
        default: 'mean',
        options: ['mean', 'lowest', 'highest'],
        label: 'CHANGE ME',
        description: '',
      },
      BESPOKE: {
        controlType: 'bespoke',
        default: [0],
        label: 'CHANGE ME',
        description: '',
      },
    },
  },

  FIX_ME: {
    label: 'CHANGE ME',
    description: '',
    actions: [{
      action: 'UPDATE-ME',
      required: true,
      controls: {
        ...actionSchemas['UPDATE-ME'].controls,
      },
      excludeFromUI: [],
   }],
  },
*/

  // ====================================
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
  // ====================================



  // ====================================
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
  // ====================================




  // ====================================
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
  // ====================================




/*
AFTERTHOUGHTS and DISTRACTIONS from the work in this file:

- want to add functionality to allow user to define a filter that can be treated as an image asset that can then be applied to the whole image (eg blend the gradient into the image)

- something about the "https://petapixel.com/2017/02/23/orange-teal-look-popular-hollywood/" teal-and-orange contrast effect? Research if we can already achieve such an effect with existing filters (if yes, create an easy-to-apply filter to make it happen)

- would be fabulous to include a way to create repeating watermarks across an image
*/


