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

  ['process-image']: {
    label: 'Image asset',
    description: 'Upload an image asset for use in other actions.',
    group: 'Asset',
    action: 'process-image',
    hasOrigin: false,
    controls: {
      lineOut: {
        controlType: 'line-text',
        default: '',
        label: 'Line out',
        description: 'ID string of asset',
      },
      identifier: {
        controlType: 'text',
        default: '',
        label: 'Asset identifier',
        description: 'Acts as the `lineIn` alternative for the action',
      },
      copyWidth: {
        controlType: 'number',
        default: 1,
        minValue: 1,
        maxValue: 4092,
        step: 1,
        label: 'Copy width',
        description: '',
      },
      copyHeight: {
        controlType: 'number',
        default: 1,
        minValue: 1,
        maxValue: 4092,
        step: 1,
        label: 'Copy height',
        description: '',
      },
      copyX: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 4091,
        step: 1,
        label: 'Copy horizontal start',
        description: '',
      },
      copyHeight: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 4091,
        step: 1,
        label: 'Copy vertical start',
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

  // For the tool, we shall allow the user to define just one swirl per action
  // - To make the UI easier to manage/navigate
  // - Each swirl is defined by an array in the form `[startX, startY, innerRadius, outerRadius, angle, easing]`
  // - swirl arrays then get pushed into the `swirls` attribute
  // - Might be easier to just feed the arguments into the `makeFilter({method: 'swirl'}) function and extract what we need`
  ['swirl']: {
    label: 'Swirl',
    description: '',
    group: 'Displacement filter',
    action: 'swirl',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      swirls: {
        controlType: 'bespoke-swirl',
        default: [],
        label: 'Swirls array',
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

  ['threshold']: {
    label: 'Threshold',
    description: '',
    group: 'Color channel filter',
    action: 'threshold',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      lowRed: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Low color red channel',
        description: '',
      },
      lowGreen: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Low color green channel',
        description: '',
      },
      lowBlue: {
        controlType: 'number',
        default: 0,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Low color blue channel',
        description: '',
      },
      lowAlpha: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 1,
        step: 0.005,
        label: 'Low color alpha channel',
        description: '',
      },
      highRed: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'High color red channel',
        description: '',
      },
      highGreen: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'High color green channel',
        description: '',
      },
      highBlue: {
        controlType: 'number',
        default: 255,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'High color blue channel',
        description: '',
      },
      highAlpha: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 1,
        step: 0.005,
        label: 'High color alpha channel',
        description: '',
      },
      red: {
        controlType: 'number',
        default: 128,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Level reference color red channel',
        description: '',
      },
      green: {
        controlType: 'number',
        default: 128,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Level reference color green channel',
        description: '',
      },
      blue: {
        controlType: 'number',
        default: 128,
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Level reference color blue channel',
        description: '',
      },
      alpha: {
        controlType: 'number',
        default: 1,
        minValue: 0,
        maxValue: 1,
        step: 0.005,
        label: 'Level reference color alpha channel',
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
      useMixedChannel: {
        controlType: 'boolean',
        default: true,
        label: 'Use mixed channels',
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
The __filterSchemas__ object defines objects which either:
- Port through the related actionSchema object, adding presentation details and (sometimes) convenience controls; or
- Create a variant of an actionSchema object as a convenience filter, overwriting some of the actionSchema object's controls attribute default values
*/ 
const filterSchemas = {};

let F;

// alphaToChannels
F = filterSchemas.alphaToChannels = structuredClone(actionSchemas['alpha-to-channels']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// alphaToLuminance
F = filterSchemas.alphaToLuminance = structuredClone(actionSchemas['alpha-to-luminance']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// areaAlpha
F = filterSchemas.areaAlpha = structuredClone(actionSchemas['area-alpha']);
F.presentation = [{
  header: 'Connections',
  inputs: ['lineIn', 'lineOut'],
},{
  header: 'Impact',
  inputs: ['opacity'],
}];

// blend
F = filterSchemas.blend = structuredClone(actionSchemas['blend']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineMix', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// blue ('average-channels' variant)
F = filterSchemas.blue = structuredClone(actionSchemas['average-channels']);
F.label = 'Blue channel',
F.description = '';
F.controls.excludeRed.default = true;
F.controls.excludeGreen.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// blur
F = filterSchemas.blur = structuredClone(actionSchemas['blur']);
F.controls.radius = {
  controlType: 'number',
  alternativeControl: true,
  alternativeFor: ['radiusHorizontal', 'radiusVertical'],
  alternativeAction: 'set-alternatives-to-this',
  sync: 'down-only',
  default: 1,
  label: 'Radius',
  description: '',
};
F.controls.step = {
  controlType: 'number',
  alternativeControl: true,
  alternativeFor: ['stepHorizontal', 'stepVertical'],
  alternativeAction: 'set-alternatives-to-this',
  sync: 'down-only',
  default: 1,
  label: 'Step',
  description: '',
};
F.controls.passes = {
  controlType: 'number',
  alternativeControl: true,
  alternativeFor: ['passesHorizontal', 'passesVertical'],
  alternativeAction: 'set-alternatives-to-this',
  sync: 'down-only',
  default: 1,
  label: 'Passes',
  description: ''
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// brightness ('modulate-channels' variant)
F = filterSchemas.brightness = structuredClone(actionSchemas['modulate-channels']);
F.label = 'Brightness',
F.description = '';
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// channelLevels
F = filterSchemas.channelLevels = structuredClone(actionSchemas['lock-channels-to-levels']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// channels ('modulate-channels' variant)
F = filterSchemas.channels = structuredClone(actionSchemas['modulate-channels']);
F.label = 'Channels modulation',
F.description = '';
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    title: 'Channels',
    inputs: ['red', 'green', 'blue', 'alpha'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// channelstep
F = filterSchemas.channelstep = structuredClone(actionSchemas['step-channels']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
  inputs: ['opacity'],
}];

// channelsToAlpha
F = filterSchemas.channelsToAlpha = structuredClone(actionSchemas['channels-to-alpha']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// chroma
F = filterSchemas.chroma = structuredClone(actionSchemas['chroma']);
F.controls.feather = {
  controlType: 'number',
  alternativeControl: true,
  alternativeFor: ['featherRed', 'featherGreen', 'featherBlue'],
  alternativeAction: 'set-alternatives-to-this',
  sync: 'down-only',
  default: 0,
  minValue: 0,
  maxValue: 255,
  step: 1,
  label: 'Feather',
  description: '',
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// chromakey
F = filterSchemas.chromakey = structuredClone(actionSchemas['colors-to-alpha']);
F.controls.reference = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['red', 'green', 'blue'],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(0 255 0)',
  label: 'Reference color',
  description: 'Color string value of the reference color',
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// clampChannels
F = filterSchemas.clampChannels = structuredClone(actionSchemas['clamp-channels']);
F.controls.lowColor = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['lowRed', 'lowGreen', 'lowBlue'],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(0 0 0)',
  label: 'Low color reference',
  description: 'Color string value of the lower bound color',
};
F.controls.highColor = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['highRed', 'highGreen', 'highBlue'],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(255 255 255)',
  label: 'High color reference',
  description: 'Color string value of the upper bound color',
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// compose
F = filterSchemas.compose = structuredClone(actionSchemas['compose']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineMix', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// corrode
F = filterSchemas.corrode = structuredClone(actionSchemas['corrode']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
  inputs: ['opacity'],
}];

// curveWeights
F = filterSchemas.curveWeights = structuredClone(actionSchemas['vary-channels-by-weights']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// cyan ('average-channels' variant)
F = filterSchemas.cyan = structuredClone(actionSchemas['average-channels']);
F.label = 'Cyan channels',
F.description = '';
F.controls.excludeRed.default = true;
F.controls.includeGreen.default = true;
F.controls.includeBlue.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// deconvolute
F = filterSchemas.deconvolute = structuredClone(actionSchemas['deconvolute']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// displace
F = filterSchemas.displace = structuredClone(actionSchemas['displace']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// edgeDetect ('matrix' variant)
F = filterSchemas.edgeDetect = structuredClone(actionSchemas['matrix']);
F.label = 'Edge detect',
F.description = '';
F.controls.weights.default = [0, 1, 0, 1, -4, 1, 0, 1, 0];
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// emboss
F = filterSchemas.emboss = structuredClone(actionSchemas['emboss']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// enhancedEmboss ('emboss' variant)
// - This filter can have 1-3 action objects, thus cannot build in the normal way.
// - Instead, invoke `scrawl.makeFilter()` with the supplied arguments and extract the action objects it creates and then bring them into alignment with the system
F = filterSchemas.enhancedEmboss = structuredClone(actionSchemas['emboss']);
F.label = 'Enhanced emboss',
F.description = '';
F.controls.useNaturalGrayscale = {
  controlType: 'boolean',
  default: false,
  label: 'Use natural grayscale',
  description: 'When true, starts the action sequence by converting input to grayscale; when false, will use the simpler average-channels approach to strip away color',
};
F.controls.clamp = {
  controlType: 'number',
  default: 0,
  minValue: 0,
  maxValue: 100,
  step: 0.01,
  label: 'Clamp',
  description: 'Applied as part of the clamp action',
};
F.controls.smoothing = {
  controlType: 'number',
  default: 0,
  minValue: 0,
  maxValue: 12,
  step: 1,
  label: 'Smoothing',
  description: 'Applied as part of the gaussian-blur action',
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// flood
F = filterSchemas.flood = structuredClone(actionSchemas['flood']);
F.controls.reference = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['red', 'green', 'blue', 'alpha'],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(0 0 0 / 255)',
  label: 'Reference color',
  description: 'Color string value of the flood color',
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// gaussianBlur
F = filterSchemas.gaussianBlur = structuredClone(actionSchemas['gaussian-blur']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// glitch
F = filterSchemas.glitch = structuredClone(actionSchemas['glitch']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// gray ('average-channels' variant)
F = filterSchemas.gray = structuredClone(actionSchemas['average-channels']);
F.label = 'Desaturate',
F.description = '';
F.controls.includeRed.default = true;
F.controls.includeGreen.default = true;
F.controls.includeBlue.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// grayscale
F = filterSchemas.grayscale = structuredClone(actionSchemas['grayscale']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// green ('average-channels' variant)
F = filterSchemas.green = structuredClone(actionSchemas['average-channels']);
F.label = 'Green channel',
F.description = '';
F.controls.excludeRed.default = true;
F.controls.excludeBlue.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// image
F = filterSchemas.image = structuredClone(actionSchemas['process-image']);
F.controls.import = {
  controlType: 'bespoke-file-loader',
  default: '',
  label: 'Select image to import',
  description: '',
},
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// invert
F = filterSchemas.invert = structuredClone(actionSchemas['invert-channels']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// luminanceToAlpha
F = filterSchemas.luminanceToAlpha = structuredClone(actionSchemas['luminance-to-alpha']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// magenta ('average-channels' variant)
F = filterSchemas.magenta = structuredClone(actionSchemas['average-channels']);
F.label = 'Magenta channels',
F.description = '';
F.controls.includeRed.default = true;
F.controls.excludeGreen.default = true;
F.controls.includeBlue.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// mapToGradient
F = filterSchemas.mapToGradient = structuredClone(actionSchemas['map-to-gradient']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// matrix
F = filterSchemas.matrix = structuredClone(actionSchemas['matrix']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// modifyOk
F = filterSchemas.modifyOk = structuredClone(actionSchemas['modify-ok-channels']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// modulateOk
F = filterSchemas.modulateOk = structuredClone(actionSchemas['modulate-ok-channels']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// negative
F = filterSchemas.negative = structuredClone(actionSchemas['negative']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// newsprint
F = filterSchemas.newsprint = structuredClone(actionSchemas['newsprint']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// setChannelsToLevel
F = filterSchemas.setChannelsToLevel = structuredClone(actionSchemas['set-channel-to-level']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// notblue ('set-channel-to-level' variant)
F = filterSchemas.notblue = structuredClone(actionSchemas['set-channel-to-level']);
F.label = 'Remove blue channel';
F.description = '';
F.controls.includeBlue.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// notgreen ('set-channel-to-level' variant)
F = filterSchemas.notgreen = structuredClone(actionSchemas['set-channel-to-level']);
F.label = 'Remove green channel';
F.description = '';
F.controls.includeGreen.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// notred ('set-channel-to-level' variant)
F = filterSchemas.notred = structuredClone(actionSchemas['set-channel-to-level']);
F.label = 'Remove red channel';
F.description = '';
F.controls.includeRed.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// offset
F = filterSchemas.offset = structuredClone(actionSchemas['offset']);
F.controls.offsetX = {
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
};
F.controls.offsetY = {
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
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// okCurveWeights
F = filterSchemas.okCurveWeights = structuredClone(actionSchemas['ok-perceptual-curves']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// pixelate
F = filterSchemas.pixelate = structuredClone(actionSchemas['pixelate']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// randomNoise
F = filterSchemas.randomNoise = structuredClone(actionSchemas['random-noise']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// red ('average-channels' variant)
F = filterSchemas.red = structuredClone(actionSchemas['average-channels']);
F.label = 'Red channel',
F.description = '';
F.controls.excludeGreen.default = true;
F.controls.excludeBlue.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// reducePalette
F = filterSchemas.reducePalette = structuredClone(actionSchemas['reduce-palette']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// rotateHue
F = filterSchemas.rotateHue = structuredClone(actionSchemas['rotate-hue']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// saturation  ('modulate-channels' variant)
F = filterSchemas.saturation = structuredClone(actionSchemas['modulate-channels']);
F.label = 'Saturation',
F.description = '';
F.controls.saturation.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// sepia ('tint' variant)
F = filterSchemas.sepia = structuredClone(actionSchemas['tint-channels']);
F.label = 'Sepia',
F.description = '';
F.controls.redInRed.default = 0.393;
F.controls.redInGreen.default = 0.349;
F.controls.redInBlue.default = 0.272;
F.controls.greenInRed.default = 0.769;
F.controls.greenInGreen.default = 0.686;
F.controls.greenInBlue.default = 0.534;
F.controls.blueInRed.default = 0.189;
F.controls.blueInGreen.default = 0.168;
F.controls.blueInBlue.default = 0.131;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// setChannelsToLevel
F = filterSchemas.setChannelsToLevel = structuredClone(actionSchemas['set-channel-to-level']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// sharpen ('matrix' variant)
F = filterSchemas.sharpen = structuredClone(actionSchemas['matrix']);
F.label = 'Sharpen',
F.description = '';
F.controls.weights.default = [0, -1, 0, -1, 5, -1, 0, -1, 0];
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// swirl
// For the tool, we shall allow the user to define just one swirl per action
// - To make the UI easier to manage/navigate
// - Each swirl is defined by an array in the form `[startX, startY, innerRadius, outerRadius, angle, easing]`
// - swirl arrays then get pushed into the `swirls` attribute
// - Might be easier to just feed the arguments into the `makeFilter({method: 'swirl'}) function and extract what we need`
F = filterSchemas.swirl = structuredClone(actionSchemas['swirl']);
F.controls.startX = {
  controlType: 'percentage-number',
  default: '50',
  minValue: 0,
  maxValue: 1,
  step: 0.001,
  label: 'Horizontal start',
  description: '',
};
F.controls.startY = {
  controlType: 'percentage-number',
  default: '50',
  minValue: '-20',
  maxValue: '120',
  step: 1,
  label: 'Vertical start',
  description: '',
};
F.controls.innerRadius = {
  controlType: 'percentage-number',
  default: '0',
  minValue: '0',
  maxValue: '120',
  step: 1,
  label: 'Inner radius',
  description: '',
};
F.controls.outerRadius = {
  controlType: 'percentage-number',
  default: '30',
  minValue: '0',
  maxValue: '120',
  step: 1,
  label: 'Outer radius',
  description: '',
};
F.controls.angle = {
  controlType: 'number',
  default: 0,
  minValue: 0,
  maxValue: 360,
  step: 0.1,
  label: 'Angle',
  description: '',
};
F.controls.easing = {
  controlType: 'select',
  default: 'linear',
  options: ['linear', 'easeOut', 'easeOutIn', 'easeInOut', 'easeIn'],
  label: 'Easing',
  description: '',
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// threshold
F = filterSchemas.threshold = structuredClone(actionSchemas['threshold']);
F.controls.lowColor = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['lowRed', 'lowGreen', 'lowBlue', lowAlpha],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(0 0 0 / 1)',
  label: 'Low color reference',
  description: 'Color string value for the low color',
};
F.controls.highColor = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['highRed', 'highGreen', 'highBlue', highAlpha],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(255 255 255 / 1)',
  label: 'High color reference',
  description: 'Color string value for the high color',
};
F.controls.referenceColor = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['red', 'green', 'blue', 'alpha'],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(128 128 128 / 1)',
  label: 'High color reference',
  description: 'Color string value for the level reference color',
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// tiles
F = filterSchemas.tiles = structuredClone(actionSchemas['tiles']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// tint
F = filterSchemas.tint = structuredClone(actionSchemas['tint-channels']);
F.controls.redColor = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['redInRed', 'greenInRed', 'blueInRed'],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(255 0 0)',
  label: 'Red color',
  description: 'Color string value of the red colors reference',
};
F.controls.greenColor = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['redInGreen', 'greenInGreen', 'blueInGreen'],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(0 255 0)',
  label: 'Green color',
  description: 'Color string value of the green colors reference',
};
F.controls.blueColor = {
  controlType: 'color',
  alternativeControl: true,
  alternativeFor: ['redInBlue', 'greenInBlue', 'blueInBlue'],
  alternativeAction: 'set-color-channels-to-this',
  sync: 'down-and-up',
  default: 'rgb(0 0 255)',
  label: 'Blue color',
  description: 'Color string value of the blue colors reference',
};
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// unsharp
F = filterSchemas.unsharp = structuredClone(actionSchemas['unsharp']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// yellow ('average-channels' variant)
F = filterSchemas.yellow = structuredClone(actionSchemas['average-channels']);
F.label = 'Magenta channels',
F.description = '';
F.controls.includeRed.default = true;
F.controls.includeGreen.default = true;
F.controls.excludeBlue.default = true;
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

// zoomBlur
F = filterSchemas.zoomBlur = structuredClone(actionSchemas['zoom-blur']);
F.presentation = [{
    header: 'Connections',
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    inputs: ['opacity'],
}];

export const getDefinedFilterSchema = (name) => {

  if (filterSchemas[name]) return structuredClone(filterSchemas[name]);
  return null;
};

// Temporary, just to test there's no code mistakes in the schemas while developing them
export const getFilterSchemas = () => JSON.parse(JSON.stringify(filterSchemas));
