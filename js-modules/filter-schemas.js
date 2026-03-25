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
    description: 'ID string of chained filter input',
  },
  lineOut: {
    controlType: 'line-text',
    default: '',
    label: 'Line out',
    description: 'ID string of chained filter output',
  },
  opacity: {
    controlType: 'number',
    default: 1,
    minValue: 0,
    maxValue: 1,
    step: 0.01,
    label: 'Opacity',
    description: 'Float number between 0 and 1',
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
    description: 'Copies an input\'s alpha channel value over to each selected channel\'s value or, alternatively, sets that channel\'s value to zero, or leaves the channel\'s value unchanged. Setting the appropriate includeChannel flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate excludeChannel flag will set that channel\'s value to zero.',
    group: 'Color channel filter',
    action: 'alpha-to-channels',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: 'Copy the alpha channel value to the red channel',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: 'Copy the alpha channel value to the green channel',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: 'Copy the alpha channel value to the blue channel',
      },
      excludeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Exclude red channel',
        description: 'If includeRed is false, set the red channel\'s value to 0',
      },
      excludeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Exclude green channel',
        description: 'If includeGreen is false, set the green channel\'s value to 0',
      },
      excludeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Exclude blue channel',
        description: 'If includeBlue is false, set the blue channel\'s value to 0',
      },
    },
  },

  ['alpha-to-luminance']: {
    label: 'Set alpha to luminance',
    description: '',
    group: 'OK color space filter',
    action: 'alpha-to-luminance',
    hasOrigin: false,
    controls: {
      ...requiredControls,
    },
  },

  ['area-alpha']: {
    label: 'Area alpha',
    description: 'Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to the appropriate value specified in the areaAlphaLevels attribute.',
    group: 'Alpha channel filter',
    action: 'area-alpha',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      tileWidth: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Tile width',
        description: 'Left portion width',
      },
      tileHeight: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Tile height',
        description: 'Top portion height',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Horizontal offset',
        description: 'Shift tiles rightwards',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Vertical offset',
        description: 'Shift tiles downwards',
      },
      gutterWidth: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Gutter width',
        description: 'Right portion width',
      },
      gutterHeight: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Gutter height',
        description: 'Bottom portion height',
      },
      areaAlphaLevels: {
        controlType: 'bespoke-area-alpha',
        default: [255, 0, 0, 0],
        label: 'Tile quadrant alpha levels',
        description: 'Array of four alpha values between 0 and 255 for each quadrant, in the order [tile-tile, tile-gutter, gutter-tile, gutter-gutter]',
      },
    },
  },

  ['average-channels']: {
    label: 'Average channels',
    description: 'Calculates an average value from each pixel\'s included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to 0.',
    group: 'Color channel filter',
    action: 'average-channels',
    hasOrigin: false,
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
    group: 'Composition filter',
    action: 'blend',
    hasOrigin: true,
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
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
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
    group: 'Convolution filter',
    action: 'blur',
    hasOrigin: false,
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
        maxValue: 60,
        step: 1,
        label: 'Horizontal radius',
        description: '',
      },
      stepHorizontal: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 20,
        step: 1,
        label: 'Horizontal step',
        description: '',
      },
      passesHorizontal: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 10,
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
        maxValue: 60,
        step: 1,
        label: 'Vertical radius',
        description: '',
      },
      stepVertical: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 20,
        step: 1,
        label: 'Vertical steps',
        description: '',
      },
      passesVertical: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Vertical passes',
        description: '',
      },
    },
  },

  ['channels-to-alpha']: {
    label: 'Set channels to alpha',
    description: 'Calculates an average value from each pixel\'s included channels and applies that value to the pixel\'s alpha channel.',
    group: 'Alpha channel filter',
    action: 'channels-to-alpha',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        label: 'Include red channel',
        description: 'To exclude this channel from the averaging calculation, make this flag false',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        label: 'Include green channel',
        description: 'To exclude this channel from the averaging calculation, make this flag false',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        label: 'Include blue channel',
        description: 'To exclude this channel from the averaging calculation, make this flag false',
      },
    },
  },

  ['chroma']: {
    label: 'Chroma ranges',
    description: 'Produces a chroma key compositing effect across the input, using an array of range arrays to determine whether a pixel\'s values lie entirely within a range\'s values and, if true, sets that pixel\'s alpha channel value to zero.',
    group: 'Alpha channel filter',
    action: 'chroma',
    hasOrigin: false,
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
        description: 'For red channel values outside of a range value, but less than the feather value\s distance, reduce the alpha value to form a feather effect',
      },
      featherGreen: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Feather green channel',
        description: 'For green channel values outside of a range value, but less than the feather value\s distance, reduce the alpha value to form a feather effect',
      },
      featherBlue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Feather blue channel',
        description: 'For blue channel values outside of a range value, but less than the feather value\s distance, reduce the alpha value to form a feather effect',
      },
    },
  },

  ['clamp-channels']: {
    label: 'Clamp channels',
    description: 'Clamp each color channel to a range determined by a set of low and high channel values.',
    group: 'Color channel filter',
    action: 'clamp-channels',
    hasOrigin: false,
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
        description: 'Red channel\'s contribution to the filter\'s upper bound',
      },
      highGreen: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green channel high bound',
        description: 'Green channel\'s contribution to the filter\'s upper bound',
      },
      highBlue: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue channel high bound',
        description: 'Blue channel\'s contribution to the filter\'s upper bound',
      },
    },
  },

  ['colors-to-alpha']: {
    label: 'Chroma key',
    description: 'Produces a chroma key compositing effect across the input by determining the alpha channel value for each pixel depending on the closeness to that pixel\'s color channel values to a reference color supplied in the red, green and blue arguments.',
    group: 'Alpha channel filter',
    action: 'colors-to-alpha',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red channel',
        description: 'Reference color red channel value',
      },
      green: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green channel',
        description: 'Reference color green channel value',
      },
      blue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue channel',
        description: 'Reference color blue channel value',
      },
      transparentAt: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Effect transparent at',
        description: 'Manipulate the sensitivity of thge chroma key effect',
      },
      opaqueAt: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Effect opaque at',
        description: 'Manipulate the sensitivity of thge chroma key effect',
      },
    },
  },

  ['compose']: {
    label: 'Composition operations',
    description: '',
    group: 'Composition filter',
    action: 'compose',
    hasOrigin: true,
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
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        minValue: -500,
        maxValue: 500,
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
    group: 'Convolution filter',
    action: 'corrode',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      width: {
        controlType: 'number',
        default: 3,
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Width',
        description: '',
      },
      height: {
        controlType: 'number',
        default: 3,
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Height',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 10,
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

  ['deconvolute']: {
    label: 'Deconvolute',
    description: '',
    group: 'OK color space filter',
    action: 'deconvolute',
    hasOrigin: false,
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
    group: 'Displacement filter',
    action: 'displace',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      lineMix: {
        controlType: 'line-text',
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

  ['emboss']: {
    label: 'Emboss',
    description: '',
    group: 'Convolution filter',
    action: 'emboss',
    hasOrigin: false,
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
  },

  ['flood']: {
    label: 'Flood',
    description: 'Creates a uniform sheet of the required color, which can then be used by other filter actions.',
    group: 'Color channel filter',
    action: 'flood',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red channel',
        description: 'Red channel value of the flood color',
      },
      green: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green channel',
        description: 'Green channel value of the flood color',
      },
      blue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue channel',
        description: 'Blue channel value of the flood color',
      },
      alpha: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Alpha channel',
        description: 'Alpha channel value of the flood color',
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
    group: 'Convolution filter',
    action: 'gaussian-blur',
    hasOrigin: false,
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
    group: 'Displacement filter',
    action: 'glitch',
    hasOrigin: true,
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
    group: 'Color channel filter',
    action: 'grayscale',
    hasOrigin: false,
    controls: {
      ...requiredControls,
    },
  },

  ['invert-channels']: {
    label: 'Invert channels',
    description: '',
    group: 'Color channel filter',
    action: 'invert-channels',
    hasOrigin: false,
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
    group: 'Color channel filter',
    action: 'lock-channels-to-levels',
    hasOrigin: false,
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
  },

  ['luminance-to-alpha']: {
    label: 'Luminance to alpha',
    description: '',
    group: 'OK color space filter',
    action: 'luminance-to-alpha',
    hasOrigin: false,
    controls: {
      ...requiredControls,
    },
  },

  ['map-to-gradient']: {
    label: 'Map to gradient',
    description: '',
    group: 'Color channel filter',
    action: 'map-to-gradient',
    hasOrigin: false,
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
  },

  ['matrix']: {
    label: 'Matrix',
    description: '',
    group: 'Convolution filter',
    action: 'matrix',
    hasOrigin: false,
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
  },

  ['modify-ok-channels']: {
    label: 'Modify OK channels',
    description: '',
    group: 'OK color space filter',
    action: 'modify-ok-channels',
    hasOrigin: false,
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
    group: 'Color channel filter',
    action: 'modulate-channels',
    hasOrigin: false,
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
    group: 'OK color space filter',
    action: 'modulate-ok-channels',
    hasOrigin: false,
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
    group: 'OK color space filter',
    action: 'negative',
    hasOrigin: false,
    controls: {
      ...requiredControls,
    },
  },

  ['newsprint']: {
    label: 'Newsprint',
    description: '',
    group: 'Convolution filter',
    action: 'newsprint',
    hasOrigin: false,
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
    group: 'Displacement filter',
    action: 'offset',
    hasOrigin: true,
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
    group: 'OK color space filter',
    action: 'ok-perceptual-curves',
    hasOrigin: false,
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
  },

  ['pixelate']: {
    label: 'Pixelate',
    description: '',
    group: 'Convolution filter',
    action: 'pixelate',
    hasOrigin: true,
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
    group: 'Displacement filter',
    action: 'random-noise',
    hasOrigin: false,
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
    group: 'OK color space filter',
    action: 'reduce-palette',
    hasOrigin: false,
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
  },

  ['rotate-hue']: {
    label: 'Rotate hue',
    description: '',
    group: 'OK color space filter',
    action: 'rotate-hue',
    hasOrigin: false,
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
    group: 'Color channel filter',
    action: 'set-channel-to-level',
    hasOrigin: false,
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
    group: 'Color channel filter',
    action: 'step-channels',
    hasOrigin: false,
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
    group: 'Convolution filter',
    action: 'tiles',
    hasOrigin: true,
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
  },

  ['tint-channels']: {
    label: 'Tint',
    description: '',
    group: 'Color channel filter',
    action: 'tint-channels',
    hasOrigin: false,
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
    group: 'OK color space filter',
    action: 'unsharp',
    hasOrigin: false,
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
    group: 'Color channel filter',
    action: 'vary-channels-by-weights',
    hasOrigin: false,
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
  },

  ['zoom-blur']: {
    label: 'Zoom blur',
    description: '',
    group: 'Convolution filter',
    action: 'zoom-blur',
    hasOrigin: true,
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

/*
The __filterSchemas__ objects map directly to the Scrawl-canvas filter factory's methods. Note that they actually get their definitions from the actionSchemas object, most without changing anything. A few are variations on an action object, overriding default values.

We will be presenting the user with this object's keys when they choose to add a new action object. The `presentation object details how controls should be grouped together in the form`
*/ 
const filterSchemas = {

  alphaToChannels: {
    ...actionSchemas['alpha-to-channels'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  alphaToLuminance: {
    ...actionSchemas['alpha-to-luminance'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  areaAlpha: {
    ...actionSchemas['area-alpha'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  blend: {
    ...actionSchemas['blend'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  channelLevels: {
    ...actionSchemas['lock-channels-to-levels'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  channelstep: {
    ...actionSchemas['step-channels'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  channelsToAlpha: {
    ...actionSchemas['channels-to-alpha'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  chromakey: {
    ...actionSchemas['colors-to-alpha'],
    controls: {
      ...actionSchemas['colors-to-alpha'].controls,
      reference: {
        controlType: 'color',
        alternativeControl: true,
        alternativeFor: ['red', 'green', 'blue'],
        alternativeAction: 'set-color-channels-to-this',
        sync: 'down-and-up',
        default: 'rgb(0 255 0)',
        label: 'Reference color',
        description: 'Color string value of the reference color',
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  clampChannels: {
    ...actionSchemas['clamp-channels'],
    controls: {
      ...actionSchemas['clamp-channels'].controls,
      lowColor: {
        controlType: 'color',
        alternativeControl: true,
        alternativeFor: ['lowRed', 'lowGreen', 'lowBlue'],
        alternativeAction: 'set-color-channels-to-this',
        sync: 'down-and-up',
        default: 'rgb(0 0 0)',
        label: 'Low color',
        description: 'Color string value of the lower bound color',
      },
      highColor: {
        controlType: 'color',
        alternativeControl: true,
        alternativeFor: ['highRed', 'highGreen', 'highBlue'],
        alternativeAction: 'set-color-channels-to-this',
        sync: 'down-and-up',
        default: 'rgb(255 255 255)',
        label: 'High color',
        description: 'Color string value of the upper bound color',
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  compose: {
    ...actionSchemas['compose'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  corrode: {
    ...actionSchemas['corrode'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  curveWeights: {
    ...actionSchemas['vary-channels-by-weights'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  deconvolute: {
    ...actionSchemas['deconvolute'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  displace: {
    ...actionSchemas['displace'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  emboss: {
    ...actionSchemas['emboss'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  flood: {
    ...actionSchemas['flood'],
    controls: {
      reference: {
        controlType: 'color',
        alternativeControl: true,
        alternativeFor: ['red', 'green', 'blue', 'alpha'],
        alternativeAction: 'set-color-channels-to-this',
        sync: 'down-and-up',
        default: 'rgb(0 0 0 / 255)',
        label: 'Reference color',
        description: 'Color string value of the flood color',
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  gaussianBlur: {
    ...actionSchemas['gaussian-blur'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  glitch: {
    ...actionSchemas['glitch'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  grayscale: {
    ...actionSchemas['grayscale'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  invert: {
    ...actionSchemas['invert-channels'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  luminanceToAlpha: {
    ...actionSchemas['luminance-to-alpha'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  mapToGradient: {
    ...actionSchemas['map-to-gradient'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  matrix: {
    ...actionSchemas['matrix'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  modifyOk: {
    ...actionSchemas['modify-ok-channels'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  modulateOk: {
    ...actionSchemas['modulate-ok-channels'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  negative: {
    ...actionSchemas['negative'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  newsprint: {
    ...actionSchemas['newsprint'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  offset: {
    ...actionSchemas['offset'],
    controls: {
      offsetX: {
        controlType: 'number',
        alternativeControl: true,
        alternativeFor: ['offsetRedX', 'offsetGreenX', 'offsetBlueX', 'offsetAlphaX'],
        alternativeAction: 'set-alternatives-to-this',
        sync: 'down-only',
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
        sync: 'down-only',
        default: 0,
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  okCurveWeights: {
    ...actionSchemas['ok-perceptual-curves'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  pixelate: {
    ...actionSchemas['pixelate'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  randomNoise: {
    ...actionSchemas['random-noise'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  reducePalette: {
    ...actionSchemas['reduce-palette'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  rotateHue: {
    ...actionSchemas['rotate-hue'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  tiles: {
    ...actionSchemas['tiles'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  tint: {
    ...actionSchemas['tint-channels'],
    controls: {
      redColor: {
        controlType: 'color',
        alternativeControl: true,
        alternativeFor: ['redInRed', 'greenInRed', 'blueInRed'],
        alternativeAction: 'set-color-channels-to-this',
        sync: 'down-and-up',
        default: 'rgb(255 0 0)',
        label: 'Red color',
        description: 'Color string value of the red colors reference',
      },
      greenColor: {
        controlType: 'color',
        alternativeControl: true,
        alternativeFor: ['redInGreen', 'greenInGreen', 'blueInGreen'],
        alternativeAction: 'set-color-channels-to-this',
        sync: 'down-and-up',
        default: 'rgb(0 255 0)',
        label: 'Green color',
        description: 'Color string value of the green colors reference',
      },
      blueColor: {
        controlType: 'color',
        alternativeControl: true,
        alternativeFor: ['redInBlue', 'greenInBlue', 'blueInBlue'],
        alternativeAction: 'set-color-channels-to-this',
        sync: 'down-and-up',
        default: 'rgb(0 0 255)',
        label: 'Blue color',
        description: 'Color string value of the blue colors reference',
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  unsharp: {
    ...actionSchemas['unsharp'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  zoomBlur: {
    ...actionSchemas['zoom-blur'],
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  blue: {
    label: 'Blue only',
    description: '',
    action: 'average-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['average-channels'].controls,
      excludeRed: {
        ...actionSchemas['average-channels'].controls.excludeRed,
        default: true,
      },
      excludeGreen: {
        ...actionSchemas['average-channels'].controls.excludeGreen,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  blur: {
    ...actionSchemas['blur'],
    controls: {
      ...actionSchemas['blur'].controls,
      radius: {
        controlType: 'number',
        alternativeControl: true,
        alternativeFor: ['radiusHorizontal', 'radiusVertical'],
        alternativeAction: 'set-alternatives-to-this',
        sync: 'down-only',
        default: 1,
        label: 'Radius',
        description: '',
      },
      step: {
        controlType: 'number',
        alternativeControl: true,
        alternativeFor: ['stepHorizontal', 'stepVertical'],
        alternativeAction: 'set-alternatives-to-this',
        sync: 'down-only',
        default: 1,
        label: 'Step',
        description: '',
      },
      passes: {
        controlType: 'number',
        alternativeControl: true,
        alternativeFor: ['passesHorizontal', 'passesVertical'],
        alternativeAction: 'set-alternatives-to-this',
        sync: 'down-only',
        default: 1,
        label: 'Passes',
        description: '',
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  brightness: {
    label: 'Brightness',
    description: '',
    action: 'modulate-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['modulate-channels'].controls,
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  channels: {
    label: 'Channels modulation',
    description: '',
    action: 'modulate-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['modulate-channels'].controls,
    },
    presentation: [
      {
        title: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        title: 'Channels',
        inputs: ['red', 'green', 'blue', 'alpha'],
      },{
        title: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  chroma: {
    ...actionSchemas['blur'],
    controls: {
      ...actionSchemas['average-channels'].controls,
      feather: {
        controlType: 'number',
        alternativeControl: true,
        alternativeFor: ['featherRed', 'featherGreen', 'featherBlue'],
        alternativeAction: 'set-alternatives-to-this',
        sync: 'down-only',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: '',
        description: '',
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
  cyan: {
    label: 'Cyan only',
    description: '',
    action: 'average-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['average-channels'].controls,
      excludeRed: {
        ...actionSchemas['average-channels'].controls.excludeRed,
        default: true,
      },
      includeGreen: {
        ...actionSchemas['average-channels'].controls.includeGreen,
        default: true,
      },
      includeBlue: {
        ...actionSchemas['average-channels'].controls.includeBlue,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  edgeDetect: {
    label: 'Edge detect',
    description: '',
    action: 'matrix',
    hasOrigin: false,
    controls: {
      ...actionSchemas['matrix'].controls,
      weights: {
        ...actionSchemas['matrix'].controls.weights,
        default: [0, 1, 0, 1, -4, 1, 0, 1, 0],
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  // We will need to specifically listen out for any invocation of this filter as it needs special treatment. While `helpers/filter-engine.js` does define an 'emboss' filter, the `factory/filters.js` does work to expand the user request to a set of four chained filters, each taking attributes specific to that method. The controls below are the ones listed for the method approach because: they do combine to give a more convincing "emboss" result; and the "method" approach can be used to emulate (in a very rough fashion) some SVG filter lighting effects.
  // - The best approach may be to just invoke the factory function using method, capture it and then steal its actions so we can proceed to create our dynamic actions in this tool ...?
  enhancedEmboss: {
    label: 'Enhanced emboss',
    description: '',
    action: 'emboss',
    hasOrigin: false,
    controls: {
      ...actionSchemas['emboss'].controls,
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
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  gray: {
    label: 'Monochrome gray',
    description: '',
    action: 'average-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['average-channels'].controls,
      includeRed: {
        ...actionSchemas['average-channels'].controls.includeRed,
        default: true,
      },
      includeGreen: {
        ...actionSchemas['average-channels'].controls.includeGreen,
        default: true,
      },
      includeBlue: {
        ...actionSchemas['average-channels'].controls.includeBlue,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  green: {
    label: 'Green only',
    description: '',
    action: 'average-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['average-channels'].controls,
      excludeRed: {
        ...actionSchemas['average-channels'].controls.excludeRed,
        default: true,
      },
      excludeBlue: {
        ...actionSchemas['average-channels'].controls.excludeBlue,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  magenta: {
    label: 'Magenta only',
    description: '',
    action: 'average-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['average-channels'].controls,
      includeRed: {
        ...actionSchemas['average-channels'].controls.includeRed,
        default: true,
      },
      excludeGreen: {
        ...actionSchemas['average-channels'].controls.excludeGreen,
        default: true,
      },
      includeBlue: {
        ...actionSchemas['average-channels'].controls.includeBlue,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  notblue: {
    label: 'Remove blue channel',
    description: '',
    action: 'set-channel-to-level',
    hasOrigin: false,
    controls: {
      ...actionSchemas['set-channel-to-level'].controls,
      includeBlue: {
        ...actionSchemas['set-channel-to-level'].controls.includeBlue,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  notgreen: {
    label: 'Remove green channel',
    description: '',
    action: 'set-channel-to-level',
    hasOrigin: false,
    controls: {
      ...actionSchemas['set-channel-to-level'].controls,
      includeGreen: {
        ...actionSchemas['set-channel-to-level'].controls.includeGreen,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  notred: {
    label: 'Remove red channel',
    description: '',
    action: 'set-channel-to-level',
    hasOrigin: false,
    controls: {
      ...actionSchemas['set-channel-to-level'].controls,
      includeRed: {
        ...actionSchemas['set-channel-to-level'].controls.includeRed,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  red: {
    label: 'Red only',
    description: '',
    action: 'average-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['average-channels'].controls,
      excludeGreen: {
        ...actionSchemas['average-channels'].controls.excludeGreen,
        default: true,
      },
      excludeBlue: {
        ...actionSchemas['average-channels'].controls.excludeBlue,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  saturation: {
    label: 'Saturation',
    description: '',
    action: 'modulate-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['modulate-channels'].controls,
      saturation: {
        ...actionSchemas['modulate-channels'].controls.saturation,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  sepia: {
    label: 'Sepia',
    description: '',
    action: 'tint-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['tint-channels'].controls,
      redInRed: {
        ...actionSchemas['tint-channels'].controls.redInRed,
        default: 0.393,
      },
      redInGreen: {
        ...actionSchemas['tint-channels'].controls.redInGreen,
        default: 0.349,
      },
      redInBlue: {
        ...actionSchemas['tint-channels'].controls.redInBlue,
        default: 0.272,
      },
      greenInRed: {
        ...actionSchemas['tint-channels'].controls.greenInRed,
        default: 0.769,
      },
      greenInGreen: {
        ...actionSchemas['tint-channels'].controls.greenInGreen,
        default: 0.686,
      },
      greenInBlue: {
        ...actionSchemas['tint-channels'].controls.greenInBlue,
        default: 0.534,
      },
      blueInRed: {
        ...actionSchemas['tint-channels'].controls.blueInRed,
        default: 0.189,
      },
      blueInGreen: {
        ...actionSchemas['tint-channels'].controls.blueInGreen,
        default: 0.168,
      },
      blueInBlue: {
        ...actionSchemas['tint-channels'].controls.blueInBlue,
        default: 0.131,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  sharpen: {
    label: 'Sharpen',
    description: '',
    action: 'matrix',
    hasOrigin: false,
    controls: {
      ...actionSchemas['matrix'].controls,
      weights: {
        ...actionSchemas['matrix'].controls.weights,
        default: [0, -1, 0, -1, 5, -1, 0, -1, 0],
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },

  yellow: {
    label: 'Yellow only',
    description: '',
    action: 'average-channels',
    hasOrigin: false,
    controls: {
      ...actionSchemas['average-channels'].controls,
      includeRed: {
        ...actionSchemas['average-channels'].controls.includeRed,
        default: true,
      },
      includeGreen: {
        ...actionSchemas['average-channels'].controls.includeGreen,
        default: true,
      },
      excludeBlue: {
        ...actionSchemas['average-channels'].controls.excludeBlue,
        default: true,
      },
    },
    presentation: [
      {
        header: 'Connections',
        inputs: ['lineIn', 'lineOut'],
      },{
        header: 'Impact',
        inputs: ['opacity'],
      }
    ],
  },
};

export const getActionSchema = (name) => {

  if (filterSchemas[name]) return structuredClone(filterSchemas[name]);
  return null;
};

// Temporary, just to test there's no code mistakes in the schemas while developing them
export const getFilterSchemas = () => JSON.parse(JSON.stringify(filterSchemas));



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
      presentation: {},
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


