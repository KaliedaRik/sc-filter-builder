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
    key: 'lineIn',
    default: '',
    label: 'Line in',
    description: 'ID string of chained filter input',
  },
  lineOut: {
    controlType: 'line-text',
    key: 'lineOut',
    default: '',
    label: 'Line out',
    description: 'ID string of chained filter output',
  },
  opacity: {
    controlType: 'number',
    key: 'opacity',
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
    label: 'Copy alpha to channels',
    description: "Copies an input's alpha channel value over to each selected channel's value or, alternatively, sets that channel's value to zero, or leaves the channel's value unchanged. Setting the appropriate 'includeChannel' flags will copy the alpha channel value to that channel; when that flag is false, setting the appropriate 'excludeChannel' flag will set that channel's value to zero.",
    action: 'alpha-to-channels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: 'Copy the alpha channel value to the red channel',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: 'Copy the alpha channel value to the green channel',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: 'Copy the alpha channel value to the blue channel',
      },
      excludeRed: {
        controlType: 'boolean',
        default: true,
        key: 'excludeRed',
        label: 'Exclude red channel',
        description: 'If includeRed is false, set the red channel\'s value to 0',
      },
      excludeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'excludeGreen',
        label: 'Exclude green channel',
        description: 'If includeGreen is false, set the green channel\'s value to 0',
      },
      excludeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'excludeBlue',
        label: 'Exclude blue channel',
        description: 'If includeBlue is false, set the blue channel\'s value to 0',
      },
    },
  },

  ['alpha-to-luminance']: {
    label: 'Copy alpha to luminance',
    description: "For each pixel in the input, where alpha is not 0: convert to OKLAB; set L to alpha value; set A and B to 0; convert back to RGB",
    action: 'alpha-to-luminance',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
    },
  },

  ['area-alpha']: {
    label: 'Area alpha',
    description: "Places a tile schema across the input, quarters each tile and then sets the alpha channels of the pixels in selected quarters of each tile to the appropriate value specified in the `areaAlphaLevels` attribute. Can be used to create horizontal or vertical bars, or chequerboard effects.",
    action: 'area-alpha',
    viewportAccuracy: 'scale-poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      tileWidth: {
        controlType: 'number',
        default: 1,
        key: 'tileWidth',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Tile width',
        description: 'Left portion width',
      },
      tileHeight: {
        controlType: 'number',
        default: 1,
        key: 'tileHeight',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Tile height',
        description: 'Top portion height',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        key: 'offsetX',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Horizontal offset',
        description: 'Shift tiles rightwards',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        key: 'offsetY',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Vertical offset',
        description: 'Shift tiles downwards',
      },
      gutterWidth: {
        controlType: 'number',
        default: 1,
        key: 'gutterWidth',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Gutter width',
        description: 'Right portion width',
      },
      gutterHeight: {
        controlType: 'number',
        default: 1,
        key: 'gutterHeight',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Gutter height',
        description: 'Bottom portion height',
      },
      areaAlphaLevels: {
        controlType: 'bespoke-area-alpha',
        default: [255, 0, 0, 0],
        key: 'areaAlphaLevels',
        label: 'Tile quadrant alpha levels',
        description: 'Array of four alpha values between 0 and 255 for each quadrant, in the order [tile-tile, tile-gutter, gutter-tile, gutter-gutter]',
      },
    },
  },

  ['average-channels']: {
    label: 'Average channels',
    description: "Calculates an average value from each pixel's included channels and applies that value to all channels that have not been specifically excluded; excluded channels have their values set to 0.",
    action: 'average-channels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      excludeRed: {
        controlType: 'boolean',
        default: false,
        key: 'excludeRed',
        label: 'Exclude red channel',
        description: 'Set red channel value to zero',
      },
      excludeGreen: {
        controlType: 'boolean',
        default: false,
        key: 'excludeGreen',
        label: 'Exclude green channel',
        description: 'Set green channel value to zero',
      },
      excludeBlue: {
        controlType: 'boolean',
        default: false,
        key: 'excludeBlue',
        label: 'Exclude blue channel',
        description: 'Set blue channel value to zero',
      },
      includeRed: {
        controlType: 'boolean',
        default: false,
        key: 'includeRed',
        label: 'Include red channel',
        description: 'Include red channel in the averaging calculation',
      },
      includeGreen: {
        controlType: 'boolean',
        default: false,
        key: 'includeGreen',
        label: 'Include green channel',
        description: 'Include green channel in the averaging calculation',
      },
      includeBlue: {
        controlType: 'boolean',
        default: false,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: 'Include blue channel in the averaging calculation',
      },
    },
  },

  ['blend']: {
    label: 'Blend operations',
    description: "Uses two inputs – 'lineIn', 'lineMix' – and combines their pixel data using various separable and non-separable blend modes. The lineMix input can be moved relative to the lineIn input using the 'offsetX' and 'offsetY' attributes.",
    action: 'blend',
    viewportAccuracy: 'poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      lineMix: {
        controlType: 'line-text',
        default: '',
        key: 'lineMix',
        label: 'Line mix',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        key: 'offsetX',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        key: 'offsetY',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
      blend: {
        controlType: 'select',
        default: 'normal',
        key: 'blend',
        options: ['normal', 'color-burn', 'color-dodge', 'darken', 'difference', 'exclusion', 'hard-light', 'lighten', 'lighter', 'multiply', 'overlay', 'screen', 'soft-light', 'color', 'hue', 'luminosity', 'saturation', 'hue-match', 'chroma-match'],
        label: 'Blend effect',
        description: '',
      },
    },
  },

  ['blur']: {
    label: 'Box blur',
    description: "A bespoke box blur function. Creates visual artefacts from various settings that might be useful.",
    action: 'blur',
    viewportAccuracy: 'scale-poor',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: '',
      },
      excludeTransparentPixels: {
        controlType: 'boolean',
        default: false,
        key: 'excludeTransparentPixels',
        label: 'Exclude transparent pixels',
        description: '',
      },
      processHorizontal: {
        controlType: 'boolean',
        default: true,
        key: 'processHorizontal',
        label: 'Process horizontal',
        description: '',
      },
      radiusHorizontal: {
        controlType: 'number',
        default: 1,
        key: 'radiusHorizontal',
        minValue: 0,
        maxValue: 60,
        step: 1,
        label: 'Horizontal radius',
        description: '',
      },
      stepHorizontal: {
        controlType: 'number',
        default: 1,
        key: 'stepHorizontal',
        minValue: 0,
        maxValue: 20,
        step: 1,
        label: 'Horizontal step',
        description: '',
      },
      passesHorizontal: {
        controlType: 'number',
        default: 1,
        key: 'passesHorizontal',
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Horizontal passes',
        description: '',
      },
      processVertical: {
        controlType: 'boolean',
        default: true,
        key: 'processVertical',
        label: 'Process vertical',
        description: '',
      },
      radiusVertical: {
        controlType: 'number',
        default: 1,
        key: 'radiusVertical',
        minValue: 0,
        maxValue: 60,
        step: 1,
        label: 'Vertical radius',
        description: '',
      },
      stepVertical: {
        controlType: 'number',
        default: 1,
        key: 'stepVertical',
        minValue: 0,
        maxValue: 20,
        step: 1,
        label: 'Vertical steps',
        description: '',
      },
      passesVertical: {
        controlType: 'number',
        default: 1,
        key: 'passesVertical',
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Vertical passes',
        description: '',
      },
    },
  },

  ['channels-to-alpha']: {
    label: 'Copy channels to alpha',
    description: "Calculates an average value from each pixel's included channels and applies that value to the pixel's alpha channel.",
    action: 'channels-to-alpha',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: 'To exclude this channel from the averaging calculation, make this flag false',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: 'To exclude this channel from the averaging calculation, make this flag false',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: 'To exclude this channel from the averaging calculation, make this flag false',
      },
    },
  },

  ['chroma']: {
    label: 'Chroma clear by ranges',
    description: "Produces a chroma key compositing effect across the input. Using an array of 'range' arrays, determines whether a pixel's values lie entirely within a range's values and, if true, sets that pixel's alpha channel value to zero. The modification to the alpha channel value can be feathered to create a more subtle effect.",
    action: 'chroma',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      ranges: {
        controlType: 'bespoke-chroma-ranges',
        default: [],
        key: 'ranges',
        label: 'Color ranges for removal',
        description: 'An array of arrays, each member array comprised of 6 integer numbers between 0 and 255 representing [lowRed, lowGreen, lowBlue, highRed, highGreen, highBlue]',
      },
      featherRed: {
        controlType: 'number',
        default: 0,
        key: 'featherRed',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Feather red channel',
        description: 'For red channel values outside of a range value, but less than the feather value\'s distance, reduce the alpha value to form a feather effect',
      },
      featherGreen: {
        controlType: 'number',
        default: 0,
        key: 'featherGreen',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Feather green channel',
        description: 'For green channel values outside of a range value, but less than the feather value\'s distance, reduce the alpha value to form a feather effect',
      },
      featherBlue: {
        controlType: 'number',
        default: 0,
        key: 'featherBlue',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Feather blue channel',
        description: 'For blue channel values outside of a range value, but less than the feather value\'s distance, reduce the alpha value to form a feather effect',
      },
    },
  },

  ['clamp-channels']: {
    label: 'Clamp channels',
    description: "Clamp each color channel to a range determined by a set of 'low' and 'high' channel values. These attributes' values should be integer Numbers between 0 and 255.",
    action: 'clamp-channels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      lowRed: {
        controlType: 'number',
        default: 0,
        key: 'lowRed',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red',
        description: '',
      },
      lowGreen: {
        controlType: 'number',
        default: 0,
        key: 'lowGreen',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green',
        description: '',
      },
      lowBlue: {
        controlType: 'number',
        default: 0,
        key: 'lowBlue',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue',
        description: '',
      },
      highRed: {
        controlType: 'number',
        default: 255,
        key: 'highRed',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red',
        description: 'Red channel\'s contribution to the filter\'s upper bound',
      },
      highGreen: {
        controlType: 'number',
        default: 255,
        key: 'highGreen',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green',
        description: 'Green channel\'s contribution to the filter\'s upper bound',
      },
      highBlue: {
        controlType: 'number',
        default: 255,
        key: 'highBlue',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue',
        description: 'Blue channel\'s contribution to the filter\'s upper bound',
      },
    },
  },

  ['colors-to-alpha']: {
    label: 'Chroma clear by reference',
    description: "Produces a chroma key compositing effect across the input. Determine the alpha channel value for each pixel depending on the closeness of that pixel's color channel values to a reference color. The sensitivity of the effect can be manipulated using the 'transparentAt' and 'opaqueAt' attributes.",
    action: 'colors-to-alpha',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 0,
        key: 'red',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red',
        description: 'Reference color red channel value',
      },
      green: {
        controlType: 'number',
        default: 255,
        key: 'green',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green',
        description: 'Reference color green channel value',
      },
      blue: {
        controlType: 'number',
        default: 0,
        key: 'blue',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue',
        description: 'Reference color blue channel value',
      },
      transparentAt: {
        controlType: 'number',
        default: 0,
        key: 'transparentAt',
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Effect transparent at',
        description: 'Manipulate the sensitivity of the chroma key effect',
      },
      opaqueAt: {
        controlType: 'number',
        default: 1,
        key: 'opaqueAt',
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Effect opaque at',
        description: 'Manipulate the sensitivity of the chroma key effect',
      },
    },
  },

  ['compose']: {
    label: 'Composition operations',
    description: "Performs a Porter-Duff compositing operation on two inputs. Note that the 'lineMix' input can be offset using the 'offsetX' and 'offsetY' attributes.",
    action: 'compose',
    viewportAccuracy: 'poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      lineMix: {
        controlType: 'line-text',
        default: '',
        key: 'lineMix',
        label: 'Line mix',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        key: 'offsetX',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        key: 'offsetY',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
      compose: {
        controlType: 'select',
        default: 'source-over',
        key: 'compose',
        options: ['source-over', 'source-in', 'source-out', 'source-atop', 'source-only', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'destination-only', 'xor', 'clear'],
        label: 'Composition effect',
        description: '',
      },
    },
  },

  ['corrode']: {
    label: 'Corrode',
    description: "Performs a special form of matrix operation on each input pixel's color and alpha channels, calculating the new value using neighbouring pixel values. This is a rough equivalent to the SVG <feMorphology> filter primitive.",
    action: 'corrode',
    viewportAccuracy: 'poor',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      width: {
        controlType: 'number',
        default: 3,
        key: 'width',
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Width',
        description: '',
      },
      height: {
        controlType: 'number',
        default: 3,
        key: 'height',
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Height',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 1,
        key: 'offsetX',
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 1,
        key: 'offsetY',
        minValue: 0,
        maxValue: 10,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
      includeRed: {
        controlType: 'boolean',
        default: false,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: false,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: false,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: true,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: '',
      },
      operation: {
        controlType: 'select',
        default: 'mean',
        key: 'operation',
        options: ['mean', 'lowest', 'highest'],
        label: 'Operation',
        description: '',
      },
    },
  },

  ['displace']: {
    label: 'Displace',
    description: "Moves pixels around the input image, based on the color channel values supplied by a displacement map image. This is the SC filter engine's attempt to reproduce the SVG <feDisplacementMap> filter primitive.",
    action: 'displace',
    viewportAccuracy: 'poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      lineMix: {
        controlType: 'line-text',
        default: '',
        key: 'lineMix',
        label: 'Line mix',
        description: '',
      },
      channelX: {
        controlType: 'select',
        default: 'red',
        key: 'channelX',
        options: ['red', 'green', 'blue', 'alpha'],
        label: 'X channel',
        description: '',
      },
      channelY: {
        controlType: 'select',
        default: 'green',
        key: 'channelY',
        options: ['red', 'green', 'blue', 'alpha'],
        label: 'Y channel',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        key: 'offsetX',
        minValue: -200,
        maxValue: 200,
        step: 1,
        label: 'X offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        key: 'offsetY',
        minValue: -200,
        maxValue: 200,
        step: 1,
        label: 'Y Offset',
        description: '',
      },
      strengthX: {
        controlType: 'number',
        default: 0,
        key: 'strengthX',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'X strength',
        description: '',
      },
      strengthY: {
        controlType: 'number',
        default: 0,
        key: 'strengthY',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Y strength',
        description: '',
      },
      transparentEdges: {
        controlType: 'boolean',
        default: false,
        key: 'transparentEdges',
        label: 'Transparent edges',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        key: 'useInputAsMask',
        label: 'Use input as mask',
        description: '',
      },
    },
  },

  ['emboss']: {
    label: 'Emboss',
    description: "Performs a directional difference filter across the input, using a 3x3 weighted matrix. The 'angle' and 'strength' attributes contribute to the weights used in the matrix. The function also handles some post-processing effects, controlled by the 'postProcessResults' and 'keepOnlyChangedAreas' flags, and the 'tolerance' attribute.",
    action: 'emboss',
    viewportAccuracy: 'poor',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      angle: {
        controlType: 'number',
        default: 0,
        key: 'angle',
        minValue: 0,
        maxValue: 360,
        step: 0.1,
        label: 'Angle',
        description: '',
      },
      strength: {
        controlType: 'number',
        default: 3,
        key: 'strength',
        minValue: 0,
        maxValue: 10,
        step: 0.1,
        label: 'Strength',
        description: '',
      },
      tolerance: {
        controlType: 'number',
        default: 1,
        key: 'tolerance',
        minValue: 0,
        maxValue: 50,
        step: 1,
        label: 'Tolerance',
        description: '',
      },
      keepOnlyChangedAreas: {
        controlType: 'boolean',
        default: false,
        key: 'keepOnlyChangedAreas',
        label: 'Keep only changed areas',
        description: '',
      },
      postProcessResults: {
        controlType: 'boolean',
        default: true,
        key: 'postProcessResults',
        label: 'Post-process results',
        description: '',
      },
    },
  },

  ['flood']: {
    label: 'Flood',
    description: "Creates a uniform sheet of the required color, which can then be used by other filter actions. The color are set through the red, green, blue and alpha attributes; these attribute values should be integer Numbers between 0 and 255. The flood can be restricted to only apply to non-transparent input pixels using the excludeAlpha flag.",
    action: 'flood',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 0,
        key: 'red',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Red',
        description: 'Red channel value of the flood color',
      },
      green: {
        controlType: 'number',
        default: 0,
        key: 'green',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Green',
        description: 'Green channel value of the flood color',
      },
      blue: {
        controlType: 'number',
        default: 0,
        key: 'blue',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Blue',
        description: 'Blue channel value of the flood color',
      },
      alpha: {
        controlType: 'number',
        default: 255,
        key: 'alpha',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Alpha channel',
        description: 'Alpha channel value of the flood color',
      },
      excludeAlpha: {
        controlType: 'boolean',
        default: true,
        key: 'excludeAlpha',
        label: 'Exclude transparent pixels',
        description: '',
      },
    },
  },

  ['gaussian-blur']: {
    label: 'Gaussian blur',
    description: "Generates a gaussian blur effect from the input. The code behind the action uses an infinite impulse response algorithm to produce the blur. The horizontal and vertical parts of the blur can be separately set. Channels can also be excluded from the blur calculations, and the blur effect can be restricted to just the non-transparent parts of the input.",
    action: 'gaussian-blur',
    viewportAccuracy: 'scale-poor',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: true,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: '',
      },
      excludeTransparentPixels: {
        controlType: 'boolean',
        default: false,
        key: 'excludeTransparentPixels',
        label: 'Exclude transparent pixels',
        description: '',
      },
      premultiply: {
        controlType: 'boolean',
        default: false,
        key: 'premultiply',
        label: 'Premultiply',
        description: '',
      },
      radiusHorizontal: {
        controlType: 'number',
        default: 1,
        key: 'radiusHorizontal',
        minValue: 0,
        maxValue: 200,
        step: 0.5,
        label: 'Horizontal radius',
        description: '',
      },
      radiusVertical: {
        controlType: 'number',
        default: 1,
        key: 'radiusVertical',
        minValue: 0,
        maxValue: 200,
        step: 0.5,
        label: 'Vertical radius',
        description: '',
      },
      angle: {
        controlType: 'number',
        default: 1,
        key: 'angle',
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
    description: "Generates a semi-random shift across the input's horizontal rows.",
    action: 'glitch',
    viewportAccuracy: 'poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      useMixedChannel: {
        controlType: 'boolean',
        default: true,
        key: 'useMixedChannel',
        label: 'Use mixed channel',
        description: 'When true, all channels use the same offset levels',
      },
      seed: {
        controlType: 'text',
        default: 'default-seed',
        key: 'seed',
        label: 'Random engine seed',
        description: '',
      },
      step: {
        controlType: 'number',
        default: 1,
        key: 'step',
        minValue: 1,
        maxValue: 50,
        step: 1,
        label: 'Step',
        description: '',
      },
      offsetMin: {
        controlType: 'number',
        default: 0,
        key: 'offsetMin',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum offset',
        description: '',
      },
      offsetMax: {
        controlType: 'number',
        default: 0,
        key: 'offsetMax',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum offset',
        description: '',
      },
      offsetRedMin: {
        controlType: 'number',
        default: 0,
        key: 'offsetRedMin',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum red channel offset',
        description: '',
      },
      offsetRedMax: {
        controlType: 'number',
        default: 0,
        key: 'offsetRedMax',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum red channel offset',
        description: '',
      },
      offsetGreenMin: {
        controlType: 'number',
        default: 0,
        key: 'offsetGreenMin',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum green channel offset',
        description: '',
      },
      offsetGreenMax: {
        controlType: 'number',
        default: 0,
        key: 'offsetGreenMax',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum green channel offset',
        description: '',
      },
      offsetBlueMin: {
        controlType: 'number',
        default: 0,
        key: 'offsetBlueMin',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum blue channel offset',
        description: '',
      },
      offsetBlueMax: {
        controlType: 'number',
        default: 0,
        key: 'offsetBlueMax',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum blue channel offset',
        description: '',
      },
      offsetAlphaMin: {
        controlType: 'number',
        default: 0,
        key: 'offsetAlphaMin',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Minimum alpha channel offset',
        description: '',
      },
      offsetAlphaMax: {
        controlType: 'number',
        default: 0,
        key: 'offsetAlphaMax',
        minValue: -100,
        maxValue: 100,
        step: 1,
        label: 'Maximum alpha channel offset',
        description: '',
      },
      transparentEdges: {
        controlType: 'boolean',
        default: false,
        key: 'transparentEdges',
        label: 'Transparent edges',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        key: 'useInputAsMask',
        label: 'Use input as mask',
        description: '',
      },
      level: {
        controlType: 'number',
        default: 0,
        key: 'level',
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Intensity level',
        description: '',
      },
    },
  },

  ['grayscale']: {
    label: 'Desaturate',
    description: "Averages the input's appropriately weighted color channel values for each pixel, to produce a more realistic black-and-white monochrome effect.",
    action: 'grayscale',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
    },
  },

  ['invert-channels']: {
    label: 'Invert colors',
    description: "Inverts the color channel values in the input, producing an effect similar to a photograph negative. Color channels can be excluded from the calculation using the 'include' flags.",
    action: 'invert-channels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
    },
  },

  ['lock-channels-to-levels']: {
    label: 'Posterize by value',
    description: "Produces a posterization effect on the input. Takes in four arguments – 'red', 'green', 'blue' and 'alpha' – each of which is an Array of zero or more integer Numbers (between 0 and 255). The filter works by looking at each pixel's channel value and determines which of the corresponding Array's Number values it is closest to; it then sets the channel value to that Number value.",
    action: 'lock-channels-to-levels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      red: {
        controlType: 'bespoke-channel-levels',
        default: [0],
        key: 'red',
        label: 'Red channel pins',
        description: 'Integer numbers 0-255, separated by commas',
      },
      green: {
        controlType: 'bespoke-channel-levels',
        default: [0],
        key: 'green',
        label: 'Green channel pins',
        description: 'Integer numbers 0-255, separated by commas',
      },
      blue: {
        controlType: 'bespoke-channel-levels',
        default: [0],
        key: 'blue',
        label: 'Blue channel pins',
        description: 'Integer numbers 0-255, separated by commas',
      },
      alpha: {
        controlType: 'bespoke-channel-levels',
        default: [255],
        key: 'alpha',
        label: 'Alpha channel pins',
        description: 'Integer numbers 0-255, separated by commas',
      },
    },
  },

  ['luminance-to-alpha']: {
    label: 'Copy luminance to alpha',
    description: "For each pixel in the input: calculate OKLAB luminance from RGB colors; set alpha to luminance; set color channels to 0",
    action: 'luminance-to-alpha',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
    },
  },

  ['map-to-gradient']: {
    label: 'Map to gradient',
    description: "Applies a gradient to a grayscaled input. The type of grayscale can be set using the 'useNaturalGrayscale' flag. The grayscale is applied as part of the action and does not need to be created in a prior chained action.",
    action: 'map-to-gradient',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      useNaturalGrayscale: {
        controlType: 'boolean',
        default: false,
        key: 'useNaturalGrayscale',
        label: 'Use natural grayscale',
        description: 'When set to true, uses a grayscaled image rather than a simple gray image as the base for the filter\'s work',
      },
      gradient: {
        controlType: 'bespoke-map-to-gradient',
        default: null,
        key: 'gradient',
        label: 'Gradient',
        description: '',
      },
    },
  },

  ['matrix']: {
    label: 'Matrix',
    description: "Applies a convolution matrix (also known as a kernel, or mask) operation to the input. The matrix dimensions must be set using the 'width' and 'height' attributes, and the weights for the matrix supplied in the 'weights' attribute's Array. The matrix does not need to be centered.",
    action: 'matrix',
    viewportAccuracy: 'scale-poor',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: '',
      },
      width: {
        controlType: 'number',
        default: 3,
        key: 'width',
        minValue: 1,
        maxValue: 20,
        step: 1,
        label: 'Matrix width',
        description: '',
      },
      height: {
        controlType: 'number',
        default: 3,
        key: 'height',
        minValue: 1,
        maxValue: 20,
        step: 1,
        label: 'Matrix height',
        description: '',
      },
      premultiply: {
        controlType: 'boolean',
        default: false,
        key: 'premultiply',
        label: 'Premultiply',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        key: 'useInputAsMask',
        label: 'Use input as mask',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 1,
        key: 'offsetX',
        minValue: 0,
        maxValue: 19,
        step: 1,
        label: 'Width offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 1,
        key: 'offsetY',
        minValue: 0,
        maxValue: 19,
        step: 1,
        label: 'Height offset',
        description: '',
      },
      weights: {
        controlType: 'bespoke-matrix-weights',
        default: [0, 0, 0, 0, 1, 0, 0, 0, 0],
        key: 'weights',
        label: 'Matrix weights',
        description: 'An array of matrix weights, with length = width * height',
      },
    },
  },

  ['modify-ok-channels']: {
    label: 'Modify OK channels',
    description: "For each pixel in the input: convert to OKLAB; add a value to each of the OKLAB channels; convert back to RGB.",
    action: 'modify-ok-channels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      channelL: {
        controlType: 'number',
        default: 0,
        key: 'channelL',
        minValue: -1,
        maxValue: 1,
        step: 0.01,
        label: 'Luminance channel',
        description: '',
      },
      channelA: {
        controlType: 'number',
        default: 0,
        key: 'channelA',
        minValue: -0.4,
        maxValue: 0.4,
        step: 0.005,
        label: 'OKLAB A channel',
        description: '',
      },
      channelB: {
        controlType: 'number',
        default: 0,
        key: 'channelB',
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
    description: "Multiplies each channel's value by the supplied argument value. A channel-argument's value of 0 will set that channel's value to zero; a value of 1 will leave the channel value unchanged. If the 'saturation' flag is set to true the calculation changes to start at that pixel's grayscale values.",
    action: 'modulate-channels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 1,
        key: 'red',
        minValue: 0,
        maxValue: 5,
        step: 0.01,
        label: 'Red',
        description: '',
      },
      green: {
        controlType: 'number',
        default: 1,
        key: 'green',
        minValue: 0,
        maxValue: 5,
        step: 0.01,
        label: 'Green',
        description: '',
      },
      blue: {
        controlType: 'number',
        default: 1,
        key: 'blue',
        minValue: 0,
        maxValue: 5,
        step: 0.01,
        label: 'Blue',
        description: '',
      },
      alpha: {
        controlType: 'number',
        default: 1,
        key: 'alpha',
        minValue: 0,
        maxValue: 5,
        step: 0.01,
        label: 'Alpha channel',
        description: '',
      },
      saturation: {
        controlType: 'boolean',
        default: false,
        key: 'saturation',
        label: 'Use gray as base',
        description: 'When false, acts as a brightness filter; when true, acts as a saturation filter',
      },
    },
  },

  ['modulate-ok-channels']: {
    label: 'Modulate OK channels',
    description: "For each pixel in the input: convert to OKLAB; multiplies a value to each of the OKLAB channels; convert back to RGB.",
    action: 'modulate-ok-channels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      channelL: {
        controlType: 'number',
        default: 1,
        key: 'channelL',
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'Luminance channel',
        description: '',
      },
      channelA: {
        controlType: 'number',
        default: 1,
        key: 'channelA',
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'OKLAB A channel',
        description: '',
      },
      channelB: {
        controlType: 'number',
        default: 1,
        key: 'channelB',
        minValue: 0,
        maxValue: 3,
        step: 0.01,
        label: 'OKLAB B channel',
        description: '',
      },
    },
  },

  ['negative']: {
    label: 'OK Negative',
    description: "For each pixel in the input: convert to OKLCH; rotate hue value 180deg; subtract luminance from 1; convert back to RGB.",
    action: 'negative',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
    },
  },

  ['newsprint']: {
    label: 'Newsprint',
    description: "A crude (but interesting) black-white pseudo-dither effect.",
    action: 'newsprint',
    viewportAccuracy: 'poor',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      width: {
        controlType: 'number',
        default: 1,
        key: 'width',
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
    description: "Moves each channel input by an offset set for that channel.",
    action: 'offset',
    viewportAccuracy: 'poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      offsetRedX: {
        controlType: 'number',
        default: 0,
        key: 'offsetRedX',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Red channel horizontal offset',
        description: '',
      },
      offsetRedY: {
        controlType: 'number',
        default: 0,
        key: 'offsetRedY',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Red channel vertical offset',
        description: '',
      },
      offsetGreenX: {
        controlType: 'number',
        default: 0,
        key: 'offsetGreenX',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Green channel horizontal offset',
        description: '',
      },
      offsetGreenY: {
        controlType: 'number',
        default: 0,
        key: 'offsetGreenY',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Green channel vertical offset',
        description: '',
      },
      offsetBlueX: {
        controlType: 'number',
        default: 0,
        key: 'offsetBlueX',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Blue channel horizontal offset',
        description: '',
      },
      offsetBlueY: {
        controlType: 'number',
        default: 0,
        key: 'offsetBlueY',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Blue channel vertical offset',
        description: '',
      },
      offsetAlphaX: {
        controlType: 'number',
        default: 0,
        key: 'offsetAlphaX',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Alpha channel horizontal offset',
        description: '',
      },
      offsetAlphaY: {
        controlType: 'number',
        default: 0,
        key: 'offsetAlphaY',
        minValue: -500,
        maxValue: 500,
        step: 1,
        label: 'Alpha channel vertical offset',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        key: 'useInputAsMask',
        label: 'Use input as mask',
        description: '',
      },
    },
  },

  ['ok-perceptual-curves']: {
    label: 'Tone curve',
    description: "Apply a set of ok-channel-based curve weightings to the input image.",
    action: 'ok-perceptual-curves',
    viewportAccuracy: 'good',
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
        key: 'weights',
        label: 'Curve weights',
        description: '',
      },
    },
  },

  ['pixelate']: {
    label: 'Pixelate',
    description: "Averages the colors within a set of rectangular blocks across the input to produce a series of obscuring tiles. Individual channels can be included in the calculation by setting their respective 'include' flags.",
    action: 'pixelate',
    viewportAccuracy: 'scale-poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      tileWidth: {
        controlType: 'number',
        default: 1,
        key: 'tileWidth',
        minValue: 1,
        maxValue: 200,
        step: 1,
        label: 'Tile width',
        description: '',
      },
      tileHeight: {
        controlType: 'number',
        default: 1,
        key: 'tileHeight',
        minValue: 1,
        maxValue: 200,
        step: 1,
        label: 'Tile height',
        description: '',
      },
      offsetX: {
        controlType: 'number',
        default: 0,
        key: 'offsetX',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Horizontal offset',
        description: '',
      },
      offsetY: {
        controlType: 'number',
        default: 0,
        key: 'offsetY',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Vertical offset',
        description: '',
      },
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: '',
      },
    },
  },

  ['process-image']: {
    label: 'Image asset',
    description: "Loads an image into the filter engine, where it can then be used by other filter actions. Useful for effects such as watermarking an image. Used with blend, compose and displace actions.",
    action: 'process-image',
    viewportAccuracy: 'poor',
    hasOrigin: true,
    controls: {
      lineOut: {
        controlType: 'line-text',
        default: '',
        key: 'lineOut',
        label: 'Line out',
        description: 'ID string of asset',
      },
      copyWidth: {
        controlType: 'percentage-number',
        default: 100,
        key: 'copyWidth',
        minValue: 0.05,
        maxValue: 100,
        step: 0.05,
        label: 'Copy width',
        description: '',
        connectingClass: 'process-image-connected-inputs'
      },
      copyHeight: {
        controlType: 'percentage-number',
        default: 100,
        key: 'copyHeight',
        minValue: 0.05,
        maxValue: 100,
        step: 0.05,
        label: 'Copy height',
        description: '',
        connectingClass: 'process-image-connected-inputs'
      },
      copyStartX: {
        controlType: 'percentage-number',
        default: 0,
        key: 'copyStartX',
        minValue: 0,
        maxValue: 99.95,
        step: 0.05,
        label: 'Copy X start',
        description: '',
        connectingClass: 'process-image-connected-inputs'
      },
      copyStartY: {
        controlType: 'percentage-number',
        default: 0,
        key: 'copyStartY',
        minValue: 0,
        maxValue: 99.95,
        step: 0.05,
        label: 'Copy Y start',
        description: '',
        connectingClass: 'process-image-connected-inputs'
      },
      scale: {
        controlType: 'number',
        default: 1,
        key: 'scale',
        minValue: 0.1,
        maxValue: 10,
        step: 0.01,
        label: 'Paste scale',
        description: '',
        connectingClass: 'process-image-connected-inputs'
      },
      offsetX: {
        controlType: 'percentage-number',
        default: 0,
        key: 'offsetX',
        minValue: -100,
        maxValue: 100,
        step: 0.05,
        label: 'Paste offset X',
        description: '',
        connectingClass: 'process-image-connected-inputs'
      },
      offsetY: {
        controlType: 'percentage-number',
        default: 0,
        key: 'offsetY',
        minValue: -100,
        maxValue: 100,
        step: 0.05,
        label: 'Paste offset Y',
        description: '',
        connectingClass: 'process-image-connected-inputs'
      },
      positionX: {
        controlType: 'select',
        default: 'center',
        key: 'positionX',
        options: ['left', 'center', 'right'],
        label: 'Paste position X',
        description: '',
        connectingClass: 'process-image-connected-inputs'
      },
      positionY: {
        controlType: 'select',
        default: 'center',
        key: 'positionY',
        options: ['top', 'center', 'bottom'],
        label: 'Paste position Y',
        description: '',
        connectingClass: 'process-image-connected-inputs'
      },
    },
  },

  ['random-noise']: {
    label: 'Random noise',
    description: "Creates a stippling effect across the image. The spread of the effect can be controlled using the 'width' and 'height' attributes (which can be negative).",
    action: 'random-noise',
    viewportAccuracy: 'poor',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      width: {
        controlType: 'number',
        default: 1,
        key: 'width',
        minValue: -200,
        maxValue: 200,
        step: 1,
        label: 'Width',
        description: '',
      },
      height: {
        controlType: 'number',
        default: 1,
        key: 'height',
        minValue: -200,
        maxValue: 200,
        step: 1,
        label: 'Height',
        description: '',
      },
      seed: {
        controlType: 'text',
        default: 'default-random-seed',
        key: 'seed',
        label: 'Random seed string',
        description: '',
      },
      noiseType: {
        controlType: 'select',
        default: 'random',
        key: 'noiseType',
        options: ['random', 'ordered', 'bluenoise'],
        label: 'Noise type',
        description: '',
      },
      level: {
        controlType: 'number',
        default: 0.5,
        key: 'level',
        minValue: 0,
        maxValue: 1,
        step: 0.01,
        label: 'Noise level',
        description: '',
      },
      noWrap: {
        controlType: 'boolean',
        default: false,
        key: 'noWrap',
        label: 'No wrap',
        description: '',
      },
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: true,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: '',
      },
      excludeTransparentPixels: {
        controlType: 'boolean',
        default: true,
        key: 'excludeTransparentPixels',
        label: 'Exclude transparent pixels',
        description: '',
      },
    },
  },

  ['reduce-palette']: {
    label: 'Reduce palette',
    description: "Analyses the input and, dependent on settings, either calculates a 'commonest colors' reduced palette based on the input colors; or uses a predefined palette. It then applies that palette to the input.",
    action: 'reduce-palette',
    viewportAccuracy: 'poor',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      seed: {
        controlType: 'text',
        default: 'default-random-seed',
        key: 'seed',
        label: 'Random seed string',
        description: '',
      },
      minimumColorDistance: {
        controlType: 'number',
        default: 1000,
        key: 'minimumColorDistance',
        minValue: 10,
        maxValue: 5000,
        step: 10,
        label: 'Minimum color distance',
        description: '',
      },
      palette: {
        controlType: 'bespoke-reduce-palette',
        default: 'black-white',
        key: 'palette',
        label: 'Palette',
        description: 'Use string for: monochrome or defined palettes. Use number for: commonest colors palette',
      },
      noiseType: {
        controlType: 'select',
        default: 'random',
        key: 'noiseType',
        options: ['random', 'ordered', 'bluenoise'],
        label: 'Noise type',
        description: '',
      },
    },
  },

  ['rotate-hue']: {
    label: 'Rotate hue',
    description: "For each pixel in the input: convert to OKLCH; rotate hue value by given angle (measured in degrees); convert back to RGB.",
    action: 'rotate-hue',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      angle: {
        controlType: 'number',
        default: 0,
        key: 'angle',
        minValue: 0,
        maxValue: 360,
        step: 0.1,
        label: 'Angle',
        description: '',
      },
    },
  },

  ['set-channel-to-level']: {
    label: 'Set channel to level',
    description: "Sets the value of each pixel's included channel to the value supplied in the 'level' attribute.",
    action: 'set-channel-to-level',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: false,
        key: 'includeRed',
        label: 'Include red channel',
        description: 'Set the red channel to the value of the level attribute',
      },
      includeGreen: {
        controlType: 'boolean',
        default: false,
        key: 'includeGreen',
        label: 'Include green channel',
        description: 'Set the green channel to the value of the level attribute',
      },
      includeBlue: {
        controlType: 'boolean',
        default: false,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: 'Set the blue channel to the value of the level attribute',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: 'Set the alpha channel to the value of the level attribute',
      },
      level: {
        controlType: 'number',
        default: 0,
        key: 'level',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Level',
        description: 'The value to which any included channel\'s pixel values should be set',
      },
    },
  },

  ['step-channels']: {
    label: 'Posterize by step',
    description: "Restricts the number of color values that each channel can set by imposing regular bands on each channel. This produces a posterization effect on the input. Takes three divisor values – 'red', 'green', 'blue'; for each pixel, its color channel values are divided by the corresponding color divisor, floored to the integer value and then multiplied by the divisor.",
    action: 'step-channels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      red: {
        controlType: 'number',
        default: 1,
        key: 'red',
        minValue: 1,
        maxValue: 255,
        step: 1,
        label: 'Red channel',
        description: '',
      },
      green: {
        controlType: 'number',
        default: 1,
        key: 'green',
        minValue: 1,
        maxValue: 255,
        step: 1,
        label: 'Green channel',
        description: '',
      },
      blue: {
        controlType: 'number',
        default: 1,
        key: 'blue',
        minValue: 1,
        maxValue: 255,
        step: 1,
        label: 'Blue channel',
        description: '',
      },
      clamp: {
        controlType: 'select',
        default: 'down',
        key: 'clamp',
        options: ['down', 'round', 'up'],
        label: 'Clamp results',
        description: '',
      },
    },
  },

  ['swirl']: {
    label: 'Swirl',
    description: "For each input pixel, move the pixel radially according to its distance from a given coordinate and associated angle for that coordinate. This filter can handle multiple swirls in a single pass.",
    action: 'swirl',
    viewportAccuracy: 'poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      swirls: {
        controlType: 'bespoke-swirl',
        default: [],
        key: 'swirls',
        label: 'Swirls array',
        description: '',
      },
      transparentEdges: {
        controlType: 'boolean',
        default: false,
        key: 'transparentEdges',
        label: 'Transparent edges',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        key: 'useInputAsMask',
        label: 'Use input as mask',
        description: '',
      },
    },
  },

  ['threshold']: {
    label: 'Threshold',
    description: "Creates a duotone effect across the input by: grayscaling the input. then, for each pixel, checks the color channel values against a 'level' argument: pixels with channel values above the level value are assigned to the 'high' color; otherwise they are updated to the 'low' color.",
    action: 'threshold',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      low: {
        controlType: 'color-array',
        default: [0, 0, 0, 255],
        key: 'low',
        minValues: 0,
        maxValues: 255,
        step: 1,
        label: 'Low color',
        description: '',
      },
      high: {
        controlType: 'color-array',
        default: [255, 255, 255, 255],
        key: 'high',
        minValues: 0,
        maxValues: 255,
        step: 1,
        label: 'High color',
        description: '',
      },
      red: {
        controlType: 'number',
        default: 128,
        key: 'red',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Ref red',
        description: '',
      },
      green: {
        controlType: 'number',
        default: 128,
        key: 'green',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Ref green',
        description: '',
      },
      blue: {
        controlType: 'number',
        default: 128,
        key: 'blue',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Ref blue',
        description: '',
      },
      alpha: {
        controlType: 'number',
        default: 1,
        key: 'alpha',
        minValue: 0,
        maxValue: 1,
        step: 0.005,
        label: 'Ref alpha',
        description: '',
      },
      level: {
        controlType: 'number',
        default: 127,
        key: 'level',
        minValue: 0,
        maxValue: 255,
        step: 1,
        label: 'Threshold level',
        description: '',
      },
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: '',
      },
      useMixedChannel: {
        controlType: 'boolean',
        default: true,
        key: 'useMixedChannel',
        label: 'Use mixed channels',
        description: '',
      },
    },
  },

  ['tiles']: {
    label: 'Tiles',
    description: "Covers the input with tiles whose color matches the average channel values for the pixels included in each tile. Has a similarity to the pixelate filter action, but uses a set of coordinate points to generate the tiles which results in a more Delaunay-like output. The filter has a number of modes, set on the 'mode' attribute: 'rect', 'hex', 'random'. Each mode has its own set of attributes.",
    action: 'tiles',
    viewportAccuracy: 'scale-poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      mode: {
        controlType: 'select',
        default: 'rect',
        key: 'mode',
        options: ['rect', 'hex', 'random'],
        label: 'Tile mode',
        description: '',
      },
      originX: {
        controlType: 'percentage-number',
        default: 50,
        key: 'originX',
        minValue: -20,
        maxValue: 120,
        step: 0.1,
        label: 'Origin X [rect, hex]',
        description: '',
      },
      originY: {
        controlType: 'percentage-number',
        default: 50,
        key: 'originY',
        minValue: -20,
        maxValue: 120,
        step: 0.1,
        label: 'Origin Y [rect, hex]',
        description: '',
      },
      rectWidth: {
        controlType: 'number',
        default: 10,
        key: 'rectWidth',
        minValue: 1,
        maxValue: 100,
        step: 1,
        label: 'Width [rect]',
        description: '',
      },
      rectHeight: {
        controlType: 'number',
        default: 10,
        key: 'rectHeight',
        minValue: 1,
        maxValue: 100,
        step: 1,
        label: 'Height [rect]',
        description: '',
      },
      hexRadius: {
        controlType: 'number',
        default: 5,
        key: 'hexRadius',
        minValue: 1,
        maxValue: 50,
        step: 1,
        label: 'Radius [hex]',
        description: '',
      },
      density: {
        controlType: 'percentage-number',
        default: 1,
        key: 'density',
        minValue: 0,
        maxValue: 8,
        step: 0.005,
        label: 'Density [random]',
        description: '',
      },
      pointsData: {
        controlType: 'bespoke-tiles-points-data',
        default: [],
        key: 'pointsData',
        label: 'Points data',
        description: 'An array of arrays whose members consist of integer [x, y] coordinate pairs',
      },
      angle: {
        controlType: 'number',
        default: 0,
        key: 'angle',
        minValue: 0,
        maxValue: 360,
        step: 0.1,
        label: 'Rotation angle [rect, hex]',
        description: '',
      },
      spiralStrength: {
        controlType: 'number',
        default: 0,
        key: 'spiralStrength',
        minValue: -0.005,
        maxValue: 0.005,
        step: 0.00005,
        label: 'Spiral strength [rect, hex]',
        description: '',
      },
      seed: {
        controlType: 'text',
        default: 'default-random-seed',
        key: 'seed',
        label: 'Random seed string',
        description: '',
      },
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: false,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: '',
      },
      premultiply: {
        controlType: 'boolean',
        default: false,
        key: 'premultiply',
        label: 'Premultiply',
        description: '',
      },
      useInputAsMask: {
        controlType: 'boolean',
        default: false,
        key: 'useInputAsMask',
        label: 'Use input as mask',
        description: '',
      },
    },
  },

  ['tint-channels']: {
    label: 'Tint',
    description: "Transforms an input's pixel values based on an interplay between the values of each pixel's red, green and blue channel values.",
    action: 'tint-channels',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      redInRed: {
        controlType: 'number',
        default: 1,
        key: 'redInRed',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Red',
        description: 'Red contribution to red channel',
      },
      redInGreen: {
        controlType: 'number',
        default: 0,
        key: 'redInGreen',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Red',
        description: 'Red contribution to green channel',
      },
      redInBlue: {
        controlType: 'number',
        default: 0,
        key: 'redInBlue',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Red',
        description: 'Red contribution to blue channel',
      },
      greenInRed: {
        controlType: 'number',
        default: 0,
        key: 'greenInRed',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Green',
        description: 'Green contribution to red channel',
      },
      greenInGreen: {
        controlType: 'number',
        default: 1,
        key: 'greenInGreen',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Green',
        description: 'Green contribution to green channel',
      },
      greenInBlue: {
        controlType: 'number',
        default: 0,
        key: 'greenInBlue',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Green',
        description: 'Green contribution to blue channel',
      },
      blueInRed: {
        controlType: 'number',
        default: 0,
        key: 'blueInRed',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Blue',
        description: 'Blue contribution to red channel',
      },
      blueInGreen: {
        controlType: 'number',
        default: 0,
        key: 'blueInGreen',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Blue',
        description: 'Blue contribution to green channel',
      },
      blueInBlue: {
        controlType: 'number',
        default: 1,
        key: 'blueInBlue',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Blue',
        description: 'Blue contribution to blue channel',
      },
    },
  },

  ['unsharp']: {
    label: 'Unsharp',
    description: "Applies an edge-aware unsharp mask in OKLab space, sharpening only the lightness (L) channel while leaving chroma (a/b) intact. The filter converts each non-transparent pixel from RGB to OKLab, then applies a separable recursive (IIR) Gaussian blur to the L channel only. A 'detail' layer is formed by subtracting the blurred L from the original L. In parallel, a Sobel magnitude is computed on the same L channel and mapped through a smoothstep curve to produce an edge mask, ensuring that sharpening is concentrated around genuine edges.",
    action: 'unsharp',
    viewportAccuracy: 'poor',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      strength: {
        controlType: 'number',
        default: 0.8,
        key: 'strength',
        minValue: 0,
        maxValue: 2,
        step: 0.01,
        label: 'Strength',
        description: '',
      },
      radius: {
        controlType: 'number',
        default: 2,
        key: 'radius',
        minValue: 0,
        maxValue: 10,
        step: 0.1,
        label: 'Radius',
        description: '',
      },
      level: {
        controlType: 'number',
        default: 0.015,
        key: 'level',
        minValue: 0,
        maxValue: 0.05,
        step: 0.001,
        label: 'Level',
        description: '',
      },
      smoothing: {
        controlType: 'number',
        default: 0.015,
        key: 'smoothing',
        minValue: 0,
        maxValue: 0.05,
        step: 0.001,
        label: 'Smoothing',
        description: '',
      },
      clamp: {
        controlType: 'number',
        default: 0.08,
        key: 'clamp',
        minValue: 0,
        maxValue: 0.2,
        step: 0.001,
        label: 'Clamp',
        description: '',
      },
      useEdgeMask: {
        controlType: 'boolean',
        default: true,
        key: 'useEdgeMask',
        label: 'Use edge mask',
        description: '',
      },
    },
  },

  ['vary-channels-by-weights']: {
    label: 'Color curve',
    description: "Applies an array of weights values to the input's pixel data. This represents a form of tone mapping.",
    action: 'vary-channels-by-weights',
    viewportAccuracy: 'good',
    hasOrigin: false,
    controls: {
      ...requiredControls,
      weights: {
        controlType: 'bespoke-vary-channel-by-weights',
        default: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        key: 'weights',
        label: 'Weights',
        description: 'An array of 1024 integers (256 * 4) where each four-integer group represents the deviation from the expected value for [red-channel, green-channel, blue-channel, combined-channels], with the reference being channel values [0, 0, 0, 0, 1, 1, 1, 1, ...etc]',
      },
      useMixedChannel: {
        controlType: 'boolean',
        default: true,
        key: 'useMixedChannel',
        label: 'Use mixed channel',
        description: 'Switch between weighting against a grayscaled image (default) and weighting on a per-channel basis',
      },
    },
  },

  ['zoom-blur']: {
    label: 'Zoom blur',
    description: "Applies a bespoke ease-weighted radial (zoom) blur with optional angle and jitter variation. Parameters such as strength, samples, variation (per-pixel jitter driven by a seed), and angle (for an optional spin component) shape the overall character of the blur.",
    action: 'zoom-blur',
    viewportAccuracy: 'poor',
    hasOrigin: true,
    controls: {
      ...requiredControls,
      includeRed: {
        controlType: 'boolean',
        default: true,
        key: 'includeRed',
        label: 'Include red channel',
        description: '',
      },
      includeGreen: {
        controlType: 'boolean',
        default: true,
        key: 'includeGreen',
        label: 'Include green channel',
        description: '',
      },
      includeBlue: {
        controlType: 'boolean',
        default: true,
        key: 'includeBlue',
        label: 'Include blue channel',
        description: '',
      },
      includeAlpha: {
        controlType: 'boolean',
        default: true,
        key: 'includeAlpha',
        label: 'Include alpha channel',
        description: '',
      },
      excludeTransparentPixels: {
        controlType: 'boolean',
        default: true,
        key: 'excludeTransparentPixels',
        label: 'Exclude transparent pixels',
        description: '',
      },
      startX: {
        controlType: 'percentage-number',
        default: 50,
        key: 'startX',
        minValue: 0,
        maxValue: 100,
        step: 0.1,
        label: 'Horizontal origin',
        description: '',
      },
      startY: {
        controlType: 'percentage-number',
        default: 50,
        key: 'startY',
        minValue: 0,
        maxValue: 100,
        step: 0.1,
        label: 'Vertical origin',
        description: '',
      },
      innerRadius: {
        controlType: 'number',
        default: 0,
        key: 'innerRadius',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Inner radius',
        description: '',
      },
      outerRadius: {
        controlType: 'number',
        default: 0,
        key: 'outerRadius',
        minValue: 0,
        maxValue: 200,
        step: 1,
        label: 'Outer radius',
        description: '',
      },
      easing: {
        controlType: 'select',
        default: 'linear',
        key: 'easing',
        options: ['linear', 'easeOut', 'easeOutIn', 'easeInOut', 'easeIn'],
        label: 'Easing',
        description: '',
      },
      premultiply: {
        controlType: 'boolean',
        default: false,
        key: 'premultiply',
        label: 'Premultiply',
        description: '',
      },
      multiscale: {
        controlType: 'boolean',
        default: true,
        key: 'multiscale',
        label: 'Multiscale',
        description: '',
      },
      strength: {
        controlType: 'number',
        default: 0.35,
        key: 'strength',
        minValue: 0,
        maxValue: 1,
        step: 0.001,
        label: 'Strength',
        description: '',
      },
      angle: {
        controlType: 'number',
        default: 0,
        key: 'angle',
        minValue: -15,
        maxValue: 15,
        step: 0.01,
        label: 'Angle',
        description: '',
      },
      seed: {
        controlType: 'text',
        default: 'default-random-seed',
        key: 'seed',
        label: 'Random seed string',
        description: '',
      },
      samples: {
        controlType: 'number',
        default: 14,
        key: 'samples',
        minValue: 0,
        maxValue: 32,
        step: 1,
        label: 'Samples',
        description: '',
      },
      variation: {
        controlType: 'number',
        default: 0,
        key: 'variation',
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

const defaultPresentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];

const filterSchemas = {};

let F;


// alphaToChannels
F = filterSchemas.alphaToChannels = structuredClone(actionSchemas['alpha-to-channels']);
F.actionString = '{"action":"alpha-to-channels","lineIn":"","lineOut":"","opacity":0.2,"includeRed":true,"includeGreen":true,"includeBlue":true,"excludeRed":true,"excludeGreen":true,"excludeBlue":true}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Included channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue'],
  },{
    header: 'Excluded channels',
    openOnLoad: false,
    inputs: ['excludeRed', 'excludeGreen', 'excludeBlue'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// alphaToLuminance
F = filterSchemas.alphaToLuminance = structuredClone(actionSchemas['alpha-to-luminance']);
F.actionString = '{"action":"alpha-to-luminance","lineIn":"","lineOut":"","opacity":0.4}';
F.presentation = [...defaultPresentation];


// areaAlpha
F = filterSchemas.areaAlpha = structuredClone(actionSchemas['area-alpha']);
F.actionString = '{"action":"area-alpha","lineIn":"","lineOut":"","opacity":1,"tileWidth":8,"tileHeight":8,"offsetX":0,"offsetY":0,"gutterWidth":8,"gutterHeight":8,"areaAlphaLevels":[255,215,175,135]}';
F.presentation = [{
  header: 'Connections',
  openOnLoad: false,
  inputs: ['lineIn', 'lineOut'],
},{
  header: 'Tile section dimensions',
  openOnLoad: true,
  inputs: ['tileWidth', 'tileHeight', 'gutterWidth', 'gutterHeight'],
},{
  header: 'Tile section alphas',
  openOnLoad: true,
  inputs: ['areaAlphaLevels'],

// I'm pretty convinced the offset calculations in the area-alpha filter are incorrect
// - Suppress this option for now
// },{
//   header: 'Tile offset',
//   openOnLoad: false,
//   inputs: ['offsetX', 'offsetY'],

},{
  header: 'Impact',
  openOnLoad: true,
  inputs: ['opacity'],
}];


// averageChannels
F = filterSchemas.averageChannels = structuredClone(actionSchemas['average-channels']);
F.actionString = '{"action":"average-channels","lineIn":"","lineOut":"","opacity":1}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Included channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue'],
  },{
    header: 'Excluded channels',
    openOnLoad: false,
    inputs: ['excludeRed', 'excludeGreen', 'excludeBlue'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// blend
F = filterSchemas.blend = structuredClone(actionSchemas['blend']);
F.actionString = '{"action":"blend","lineIn":"","lineOut":"","lineMix":"","blend":"normal","offsetX":0,"offsetY":0,"opacity":1}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: true,
    inputs: ['lineIn', 'lineMix', 'lineOut'],
  },{
    header: 'Mix input offset',
    openOnLoad: false,
    inputs: ['offsetX', 'offsetY'],
  },{
    header: 'Blend operation',
    openOnLoad: true,
    inputs: ['blend'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// blue ('average-channels' variant)
F = filterSchemas.blue = structuredClone(actionSchemas['average-channels']);
F.actionString = '{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"excludeRed":true,"excludeGreen":true}';
F.label = 'Blue channel';
F.viewportAccuracy = 'good';
F.description = 'An average-channels action variant, preset to remove red and green channels.';
F.controls.excludeRed.default = true;
F.controls.excludeGreen.default = true;
F.presentation = [...defaultPresentation];


// blur
F = filterSchemas.blur = structuredClone(actionSchemas['blur']);
F.actionString = '{"action":"blur","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"excludeTransparentPixels":true,"processHorizontal":true,"radiusHorizontal":1,"stepHorizontal":1,"passesHorizontal":1,"processVertical":true,"radiusVertical":1,"stepVertical":1,"passesVertical":1}';
F.controls.radius = {
  controlType: 'number',
  alternativeFor: ['radiusHorizontal', 'radiusVertical'],
  default: 1,
  minValue: 0,
  maxValue: 60,
  step: 1,
  key: 'radius',
  label: 'Radius',
  description: '',
};
F.controls.step = {
  controlType: 'number',
  alternativeFor: ['stepHorizontal', 'stepVertical'],
  default: 1,
  minValue: 0,
  maxValue: 20,
  step: 1,
  key: 'step',
  label: 'Step',
  description: '',
};
F.controls.passes = {
  controlType: 'number',
  alternativeFor: ['passesHorizontal', 'passesVertical'],
  default: 1,
  minValue: 0,
  maxValue: 10,
  step: 1,
  key: 'passes',
  label: 'Passes',
  description: ''
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Quick inputs',
    openOnLoad: true,
    inputs: ['radius', 'step', 'passes'],
  },{
    header: 'Horizontal',
    openOnLoad: false,
    inputs: ['processHorizontal', 'radiusHorizontal', 'stepHorizontal', 'passesHorizontal'],
  },{
    header: 'Vertical',
    openOnLoad: false,
    inputs: ['processVertical', 'radiusVertical', 'stepVertical', 'passesVertical'],
  },{
    header: 'Inclusions',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha'],
  },{
    header: 'Exclusions',
    openOnLoad: false,
    inputs: ['excludeTransparentPixels'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// brightness ('modulate-channels' variant)
F = filterSchemas.brightness = structuredClone(actionSchemas['modulate-channels']);
F.actionString = '{"action":"modulate-channels","lineIn":"","lineOut":"","opacity":1,"red":0.8,"green":0.8,"blue":0.8}';
F.label = 'Brightness';
F.viewportAccuracy = 'good';
F.description = 'A modulate-channels action variant, preset to the brightness setting.';
F.controls.level = {
  controlType: 'number',
  alternativeFor: ['red', 'green', 'blue'],
  default: 1,
  key: 'level',
  minValue: 0,
  maxValue: 5,
  step: 0.01,
  label: 'Level',
  description: ''
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Modulation',
    openOnLoad: true,
    inputs: ['level'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// channelLevels
F = filterSchemas.channelLevels = structuredClone(actionSchemas['lock-channels-to-levels']);
F.actionString = '{"action":"lock-channels-to-levels","lineIn":"","lineOut":"","opacity":1,"red":[50,200],"green":[60,150,220],"blue":[40,180],"alpha":[]}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Reference values',
    openOnLoad: true,
    inputs: ['red', 'green', 'blue', 'alpha'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// channels ('modulate-channels' variant)
F = filterSchemas.channels = structuredClone(actionSchemas['modulate-channels']);
F.actionString = '{"action":"modulate-channels","lineIn":"","lineOut":"","opacity":1,"red":1,"green":1,"blue":1,"alpha":1}';
F.label = 'Modulate channels';
F.viewportAccuracy = 'good';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Flags',
    openOnLoad: true,
    inputs: ['saturation'],
  },{
    header: 'Channels',
    openOnLoad: true,
    inputs: ['red', 'green', 'blue', 'alpha'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// channelstep
F = filterSchemas.channelstep = structuredClone(actionSchemas['step-channels']);
F.actionString = '{"action":"step-channels","lineIn":"","lineOut":"","opacity":1,"clamp":"down","red":64,"green":64,"blue":64}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Effect',
    openOnLoad: true,
    inputs: ['red', 'green', 'blue', 'clamp'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// channelsToAlpha
F = filterSchemas.channelsToAlpha = structuredClone(actionSchemas['channels-to-alpha']);
F.actionString = '{"action":"channels-to-alpha","lineIn":"","lineOut":"","opacity":1,"includeRed":false,"includeGreen":false,"includeBlue":true}';
F.presentation = [...defaultPresentation];


// chroma
F = filterSchemas.chroma = structuredClone(actionSchemas['chroma']);
F.actionString = '{"action":"chroma","lineIn":"","lineOut":"","opacity":1,"ranges":[[0,0,0,152,185,152]],"featherRed":0,"featherGreen":0,"featherBlue":0}';
F.controls.feather = {
  controlType: 'number',
  alternativeFor: ['featherRed', 'featherGreen', 'featherBlue'],
  default: 0,
  key: 'feather',
  minValue: 0,
  maxValue: 255,
  step: 1,
  label: 'Feather',
  description: '',
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Reference colors',
    openOnLoad: true,
    inputs: ['ranges'],
  },{
    header: 'Feathering',
    openOnLoad: false,
    inputs: ['feather', 'featherRed', 'featherGreen', 'featherBlue'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// chromakey
F = filterSchemas.chromakey = structuredClone(actionSchemas['colors-to-alpha']);
F.actionString = '{"action":"colors-to-alpha","lineIn":"","lineOut":"","opacity":1,"red":190,"green":129,"blue":223,"transparentAt":0.32,"opaqueAt":0.39}';
F.controls.reference = {
  controlType: 'color',
  alternativeFor: ['red', 'green', 'blue'],
  default: 'rgb(0 255 0)',
  key: 'reference',
  label: 'Reference color',
  description: 'Color string value of the reference color',
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Reference color',
    openOnLoad: true,
    inputs: ['reference'],
  },{
    header: 'Effect controls',
    openOnLoad: true,
    inputs: ['transparentAt', 'opaqueAt'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// clampChannels
F = filterSchemas.clampChannels = structuredClone(actionSchemas['clamp-channels']);
F.actionString = '{"action":"clamp-channels","lineIn":"","lineOut":"","opacity":1,"lowRed":23,"lowGreen":0,"lowBlue":120,"highRed":255,"highGreen":216,"highBlue":0}';
F.controls.lowColor = {
  controlType: 'color',
  alternativeFor: ['lowRed', 'lowGreen', 'lowBlue'],
  default: 'rgb(0 0 0)',
  key: 'lowColor',
  label: 'Low color',
  description: 'Color string value of the lower bound color',
};
F.controls.highColor = {
  controlType: 'color',
  alternativeFor: ['highRed', 'highGreen', 'highBlue'],
  default: 'rgb(255 255 255)',
  key: 'highColor',
  label: 'High color',
  description: 'Color string value of the upper bound color',
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Low color',
    openOnLoad: true,
    inputs: ['lowColor'],
  },{
    header: 'High color',
    openOnLoad: true,
    inputs: ['highColor'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// compose
F = filterSchemas.compose = structuredClone(actionSchemas['compose']);
F.actionString = '{"action":"compose","lineIn":"","lineOut":"","lineMix":"","compose":"source-over","offsetX":0,"offsetY":0,"opacity":1}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: true,
    inputs: ['lineIn', 'lineMix', 'lineOut'],
  },{
    header: 'Mix input offset',
    openOnLoad: false,
    inputs: ['offsetX', 'offsetY'],
  },{
    header: 'Compose operation',
    openOnLoad: true,
    inputs: ['compose'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// corrode
F = filterSchemas.corrode = structuredClone(actionSchemas['corrode']);
F.actionString = '{"action":"corrode","lineIn":"","lineOut":"","width":3,"height":3,"offsetX":1,"offsetY":1,"includeRed":false,"includeGreen":false,"includeBlue":false,"includeAlpha":true,"operation":"mean","opacity":1}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Matrix',
    openOnLoad: true,
    inputs: ['width', 'height', 'offsetX', 'offsetY'],
  },{
    header: 'Included channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['operation', 'opacity'],
}];


// curveWeights
F = filterSchemas.curveWeights = structuredClone(actionSchemas['vary-channels-by-weights']);
F.actionString = '{"action":"vary-channels-by-weights","lineIn":"","lineOut":"","opacity":1,"weights":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"useMixedChannel":true}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Flags',
    openOnLoad: true,
    inputs: ['useMixedChannel'],
  },{
    header: 'Weights',
    openOnLoad: true,
    inputs: ['weights'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// cyan ('average-channels' variant)
F = filterSchemas.cyan = structuredClone(actionSchemas['average-channels']);
F.actionString = '{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"includeGreen":true,"includeBlue":true,"excludeRed":true}';
F.label = 'Cyan mix';
F.viewportAccuracy = 'good';
F.description =  'An average-channels action variant, preset to remove red channel.';
F.controls.excludeRed.default = true;
F.controls.includeGreen.default = true;
F.controls.includeBlue.default = true;
F.presentation = [...defaultPresentation];


// displace
F = filterSchemas.displace = structuredClone(actionSchemas['displace']);
F.actionString = '{"action":"displace","lineIn":"","lineOut":"","lineMix":"","opacity":1,"channelX":"red","channelY":"green","offsetX":0,"offsetY":0,"scaleX":1,"scaleY":1,"transparentEdges":false,"useInputAsMask":false}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: true,
    inputs: ['lineIn', 'lineMix', 'lineOut'],
  },{
    header: 'Offset and strength',
    openOnLoad: true,
    inputs: ['offsetX', 'offsetY', 'strengthX', 'strengthY'],
  },{
    header: 'Channels and flags',
    openOnLoad: false,
    inputs: ['channelX', 'channelY', 'transparentEdges', 'useInputAsMask'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// edgeDetect ('matrix' variant)
F = filterSchemas.edgeDetect = structuredClone(actionSchemas['matrix']);
F.actionString = '{"action":"matrix","lineIn":"","lineOut":"","opacity":1,"width":3,"height":3,"offsetX":1,"offsetY":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"weights":[0,1,0,1,-4,1,0,1,0]}';
F.label = 'Edge detect';
F.viewportAccuracy = 'scale-poor';
F.description = 'A matrix action variant, preset to create an edge detect effect.';
F.controls.weights.default = [0, 1, 0, 1, -4, 1, 0, 1, 0];
F.presentation = [...defaultPresentation];


// emboss
F = filterSchemas.emboss = structuredClone(actionSchemas['emboss']);
F.actionString = '{"action":"emboss","lineIn":"","lineOut":"","opacity":1,"angle":0,"strength":1,"tolerance":0,"keepOnlyChangedAreas":false,"postProcessResults":true}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Control values',
    openOnLoad: true,
    inputs: ['angle', 'strength'],
  },{
    header: 'Post-processing',
    openOnLoad: false,
    inputs: ['postProcessResults', 'keepOnlyChangedAreas', 'tolerance'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// flood
F = filterSchemas.flood = structuredClone(actionSchemas['flood']);
F.actionString = '{"action":"flood","lineIn":"","lineOut":"","opacity":1,"red":0,"green":0,"blue":0,"alpha":255,"excludeAlpha":false}';
F.controls.reference = {
  controlType: 'color',
  alternativeFor: ['red', 'green', 'blue', 'alpha'],
  default: 'rgb(0 0 0 / 255)',
  key: 'reference',
  label: 'Reference color',
  description: 'Color string value of the flood color',
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Flood color',
    openOnLoad: true,
    inputs: ['reference'],
  },{
    header: 'Alpha management',
    openOnLoad: false,
    inputs: ['alpha', 'excludeAlpha'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// gaussianBlur
F = filterSchemas.gaussianBlur = structuredClone(actionSchemas['gaussian-blur']);
F.actionString = '{"action":"gaussian-blur","lineIn":"","lineOut":"","includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"excludeTransparentPixels":false,"opacity":1,"premultiply":true,"radiusHorizontal":4,"radiusVertical":4,"angle":0}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Radius + angle',
    openOnLoad: true,
    inputs: ['radiusHorizontal', 'radiusVertical', 'angle'],
  },{
    header: 'Inclusions',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha'],
  },{
    header: 'Flags',
    openOnLoad: false,
    inputs: ['excludeTransparentPixels', 'premultiply'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}],


// glitch
F = filterSchemas.glitch = structuredClone(actionSchemas['glitch']);
F.actionString = '{"action":"glitch","lineIn":"","lineOut":"","opacity":1,"useMixedChannel":true,"seed":"default-seed","step":1,"offsetMin":0,"offsetMax":0,"offsetRedMin":0,"offsetRedMax":0,"offsetGreenMin":0,"offsetGreenMax":0,"offsetBlueMin":0,"offsetBlueMax":0,"offsetAlphaMin":0,"offsetAlphaMax":0,"transparentEdges":false,"useInputAsMask":false,"level":0}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Banding',
    openOnLoad: true,
    inputs: ['step', 'seed', 'offsetMin', 'offsetMax'],
  },{
    header: 'Banding by channel',
    openOnLoad: false,
    inputs: ['useMixedChannel', 'offsetRedMin', 'offsetRedMax', 'offsetGreenMin', 'offsetGreenMax', 'offsetBlueMin', 'offsetBlueMax'],
  },{
    header: 'Alpha controls',
    openOnLoad: false,
    inputs: ['transparentEdges', 'useInputAsMask', 'offsetAlphaMin', 'offsetAlphaMax'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['level', 'opacity'],
}];


// gray ('average-channels' variant)
F = filterSchemas.gray = structuredClone(actionSchemas['average-channels']);
F.actionString = '{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"includeBlue":true}';
F.label = 'Gray monochrome';
F.viewportAccuracy = 'good';
F.description = 'An average-channels action variant, preset to perform an averaging calculation across channels.';
F.controls.includeRed.default = true;
F.controls.includeGreen.default = true;
F.controls.includeBlue.default = true;
F.presentation = [...defaultPresentation];


// grayscale
F = filterSchemas.grayscale = structuredClone(actionSchemas['grayscale']);
F.actionString = '{"action":"grayscale","lineIn":"","lineOut":"","opacity":1}';
F.presentation = [...defaultPresentation];


// green ('average-channels' variant)
F = filterSchemas.green = structuredClone(actionSchemas['average-channels']);
F.actionString = '{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"excludeRed":true,"excludeBlue":true}';
F.label = 'Green channel';
F.viewportAccuracy = 'good';
F.description = 'An average-channels action variant, preset to remove red and blue channels.';
F.controls.excludeRed.default = true;
F.controls.excludeBlue.default = true;
F.presentation = [...defaultPresentation];


// image
F = filterSchemas.image = structuredClone(actionSchemas['process-image']);
F.actionString = '{"action":"process-image","lineOut":"","asset":"","copyWidth":"100%","copyHeight":"100%","copyStartX":0,"copyStartY":0,"backgroundColor":"rgb(0 0 0 / 0)","fit":"none","scale":1,"smoothing":false,"positionX":"center","positionY":"center","offsetX":0,"offsetY":0}';
F.controls.import = {
  controlType: 'bespoke-file-loader',
  default: '',
  key: 'import',
  label: 'Current asset',
  description: '',
};
F.controls.assetPresentation = {
  controlType: 'bespoke-process-asset-presentation',
  default: '',
  key: 'assetPresentation',
  label: 'Asset presentation',
  description: '',
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: true,
    inputs: ['import', 'lineOut'],
  },{
    header: 'Copy region',
    openOnLoad: false,
    inputs: ['copyStartX', 'copyStartY', 'copyWidth', 'copyHeight'],
  },{
    header: 'Paste position and scale',
    openOnLoad: false,
    inputs: ['positionX', 'positionY', 'offsetX', 'offsetY', 'scale'],
  },{
    header: 'Asset presentation',
    openOnLoad: true,
    inputs: ['assetPresentation'],
}];


// invert
F = filterSchemas.invert = structuredClone(actionSchemas['invert-channels']);
F.actionString = '{"action":"invert-channels","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"includeBlue":true}';
F.presentation = [...defaultPresentation];


// luminanceToAlpha
F = filterSchemas.luminanceToAlpha = structuredClone(actionSchemas['luminance-to-alpha']);
F.actionString = '{"action":"luminance-to-alpha","lineIn":"","lineOut":"","opacity":1}';
F.presentation = [...defaultPresentation];


// magenta ('average-channels' variant)
F = filterSchemas.magenta = structuredClone(actionSchemas['average-channels']);
F.actionString = '{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeBlue":true,"excludeGreen":true}';
F.label = 'Magenta mix';
F.viewportAccuracy = 'good';
F.description =  'An average-channels action variant, preset to remove green channel.';
F.controls.includeRed.default = true;
F.controls.excludeGreen.default = true;
F.controls.includeBlue.default = true;
F.presentation = [...defaultPresentation];


// mapToGradient
F = filterSchemas.mapToGradient = structuredClone(actionSchemas['map-to-gradient']);
F.actionString = '{"action":"map-to-gradient","lineIn":"","lineOut":"","opacity":1,"useNaturalGrayscale":false,"gradient":""}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Gradient controls',
    openOnLoad: true,
    inputs: ['useNaturalGrayscale', 'gradient'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// matrix
F = filterSchemas.matrix = structuredClone(actionSchemas['matrix']);
F.actionString = '{"action":"matrix","lineIn":"","lineOut":"","opacity":1,"width":3,"height":3,"offsetX":1,"offsetY":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"weights":[0,0,0,0,1,0,0,0,0],"premultiply":false,"useInputAsMask":false}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Matrix controls',
    openOnLoad: true,
    inputs: ['width', 'height', 'offsetX', 'offsetY', 'weights'],
  },{
    header: 'Included channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue'],
  },{
    header: 'Flags',
    openOnLoad: false,
    inputs: ['includeAlpha', 'useInputAsMask', 'premultiply'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// modifyOk
F = filterSchemas.modifyOk = structuredClone(actionSchemas['modify-ok-channels']);
F.actionString = '{"action":"modify-ok-channels","lineIn":"","lineOut":"","opacity":1,"channelL":0.3,"channelA":0,"channelB":0}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Channel values',
    openOnLoad: true,
    inputs: ['channelL', 'channelA', 'channelB'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// modulateOk
F = filterSchemas.modulateOk = structuredClone(actionSchemas['modulate-ok-channels']);
F.actionString = '{"action":"modulate-ok-channels","lineIn":"","lineOut":"","opacity":1,"channelL":0.8,"channelA":1,"channelB":1}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Channel values',
    openOnLoad: true,
    inputs: ['channelL', 'channelA', 'channelB'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// negative
F = filterSchemas.negative = structuredClone(actionSchemas['negative']);
F.actionString = '{"action":"negative","lineIn":"","lineOut":"","opacity":1}';
F.presentation = [...defaultPresentation];


// newsprint
F = filterSchemas.newsprint = structuredClone(actionSchemas['newsprint']);
F.actionString = '{"action":"newsprint","lineIn":"","lineOut":"","opacity":1,"width":1}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Control values',
    openOnLoad: true,
    inputs: ['width'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// notblue ('set-channel-to-level' variant)
F = filterSchemas.notblue = structuredClone(actionSchemas['set-channel-to-level']);
F.actionString = '{"action":"set-channel-to-level","lineIn":"","lineOut":"","opacity":1,"includeBlue":true,"level":0}';
F.label = 'Exclude blue channel';
F.viewportAccuracy = 'good';
F.description =  'A set-channel-to-level variant, preset to remove blue channel.';
F.controls.includeBlue.default = true;
F.presentation = [...defaultPresentation];


// notgreen ('set-channel-to-level' variant)
F = filterSchemas.notgreen = structuredClone(actionSchemas['set-channel-to-level']);
F.actionString = '{"action":"set-channel-to-level","lineIn":"","lineOut":"","opacity":1,"includeGreen":true,"level":0}';
F.label = 'Exclude green channel';
F.viewportAccuracy = 'good';
F.description = 'A set-channel-to-level variant, preset to remove green channel.';
F.controls.includeGreen.default = true;
F.presentation = [...defaultPresentation];


// notred ('set-channel-to-level' variant)
F = filterSchemas.notred = structuredClone(actionSchemas['set-channel-to-level']);
F.actionString = '{"action":"set-channel-to-level","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"level":0}';
F.label = 'Exclude red channel';
F.viewportAccuracy = 'good';
F.description = 'A set-channel-to-level variant, preset to remove red channel.';
F.controls.includeRed.default = true;
F.presentation = [...defaultPresentation];


// offset
F = filterSchemas.offset = structuredClone(actionSchemas['offset']);
F.actionString = '{"action":"offset","lineIn":"","lineOut":"","opacity":1,"offsetRedX":0,"offsetRedY":0,"offsetGreenX":0,"offsetGreenY":0,"offsetBlueX":0,"offsetBlueY":0,"offsetAlphaX":0,"offsetAlphaY":0,"useInputAsMask":false}';
F.controls.offsetX = {
  controlType: 'number',
  alternativeFor: ['offsetRedX', 'offsetGreenX', 'offsetBlueX', 'offsetAlphaX'],
  default: 0,
  key: 'offsetX',
  minValue: -500,
  maxValue: 500,
  step: 1,
  label: 'Horizontal offset',
  description: '',
};
F.controls.offsetY = {
  controlType: 'number',
  alternativeFor: ['offsetRedY', 'offsetGreenY', 'offsetBlueY', 'offsetAlphaY'],
  default: 0,
  key: 'offsetY',
  minValue: -500,
  maxValue: 500,
  step: 1,
  label: 'Vertical offset',
  description: '',
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Offset values',
    openOnLoad: true,
    inputs: ['offsetX', 'offsetY'],
  },{
    header: 'Channel offset values',
    openOnLoad: false,
    inputs: ['offsetRedX', 'offsetRedY', 'offsetGreenX', 'offsetGreenY', 'offsetBlueX', 'offsetBlueY'],
  },{
    header: 'Alpha controls',
    openOnLoad: false,
    inputs: ['offsetAlphaX', 'offsetAlphaY', 'useInputAsMask'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// okCurveWeights
F = filterSchemas.okCurveWeights = structuredClone(actionSchemas['ok-perceptual-curves']);
F.actionString = '{"action":"ok-perceptual-curves","lineIn":"","lineOut":"","opacity":1,"curves":{"luminance":[],"chroma":[],"aChannel":[],"bChannel":[]}}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Weights',
    openOnLoad: true,
    inputs: ['weights'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// pixelate
F = filterSchemas.pixelate = structuredClone(actionSchemas['pixelate']);
F.actionString = '{"action":"pixelate","lineIn":"","lineOut":"","opacity":1,"tileWidth":10,"tileHeight":10,"offsetX":0,"offsetY":0,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Tiles',
    openOnLoad: true,
    // inputs: ['tileWidth', 'tileHeight', 'offsetX', 'offsetY'],
    inputs: ['tileWidth', 'tileHeight'],
  },{
    header: 'Channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}],


// randomNoise
F = filterSchemas.randomNoise = structuredClone(actionSchemas['random-noise']);
F.actionString = '{"action":"random-noise","lineIn":"","lineOut":"","opacity":1,"width":50,"height":50,"seed":"any_random_string_will_do","noiseType":"random","level":0.5,"noWrap":false,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":true,"excludeTransparentPixels":true}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Noise type',
    openOnLoad: true,
    inputs: ['noiseType', 'seed'],
  },{
    header: 'Noise dimensions',
    openOnLoad: true,
    inputs: ['width', 'height', 'level', 'noWrap'],
  },{
    header: 'Included channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue'],
  },{
    header: 'Alpha controls',
    openOnLoad: false,
    inputs: ['includeAlpha', 'excludeTransparentPixels'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// red ('average-channels' variant)
F = filterSchemas.red = structuredClone(actionSchemas['average-channels']);
F.actionString = '{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"excludeGreen":true,"excludeBlue":true}';
F.label = 'Red channel';
F.viewportAccuracy = 'good';
F.description = 'An average-channels action variant, preset to remove green and blue channels.';
F.controls.excludeGreen.default = true;
F.controls.excludeBlue.default = true;
F.presentation = [...defaultPresentation];


// reducePalette
F = filterSchemas.reducePalette = structuredClone(actionSchemas['reduce-palette']);
F.actionString = '{"action":"reduce-palette","lineIn":"","lineOut":"","seed":"any_random_string_will_do","minimumColorDistance":1000,"palette":16,"noiseType":"bluenoise","opacity":1}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Palette controls',
    openOnLoad: true,
    inputs: ['palette', 'minimumColorDistance', 'noiseType', 'seed'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// rotateHue
F = filterSchemas.rotateHue = structuredClone(actionSchemas['rotate-hue']);
F.actionString = '';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Angle',
    openOnLoad: true,
    inputs: ['angle'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// saturation  ('modulate-channels' variant)
F = filterSchemas.saturation = structuredClone(actionSchemas['modulate-channels']);
F.actionString = '{"action":"modulate-channels","lineIn":"","lineOut":"","opacity":1,"red":2,"green":2,"blue":2,"saturation":true}';
F.label = 'Saturation';
F.viewportAccuracy = 'good';
F.description = 'A modulate-channels action variant, preset to the saturation setting.';
F.controls.saturation.default = true;
F.controls.level = {
  controlType: 'number',
  alternativeFor: ['red', 'green', 'blue'],
  default: 1,
  key: 'level',
  minValue: 0,
  maxValue: 5,
  step: 0.01,
  label: 'Level',
  description: ''
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Modulation',
    openOnLoad: true,
    inputs: ['level'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// sepia ('tint' variant)
F = filterSchemas.sepia = structuredClone(actionSchemas['tint-channels']);
F.actionString = '{"action":"tint-channels","lineIn":"","lineOut":"","opacity":1,"redInRed":0.393,"redInGreen":0.349,"redInBlue":0.272,"greenInRed":0.769,"greenInGreen":0.686,"greenInBlue":0.534,"blueInRed":0.189,"blueInGreen":0.168,"blueInBlue":0.131}';
F.label = 'Sepia tint';
F.viewportAccuracy = 'good';
F.description = 'A tint action variant, preset to create a sepia effect.';
F.controls.redInRed.default = 0.393;
F.controls.redInGreen.default = 0.349;
F.controls.redInBlue.default = 0.272;
F.controls.greenInRed.default = 0.769;
F.controls.greenInGreen.default = 0.686;
F.controls.greenInBlue.default = 0.534;
F.controls.blueInRed.default = 0.189;
F.controls.blueInGreen.default = 0.168;
F.controls.blueInBlue.default = 0.131;
F.presentation = [...defaultPresentation];


// setChannelsToLevel
F = filterSchemas.setChannelToLevel = structuredClone(actionSchemas['set-channel-to-level']);
F.actionString = '{"action":"set-channel-to-level","lineIn":"","lineOut":"","opacity":1,"includeRed":false,"includeGreen":false,"includeBlue":false,"includeAlpha":false,"level":0}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Level',
    openOnLoad: true,
    inputs: ['level'],
  },{
    header: 'Included channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// sharpen ('matrix' variant)
F = filterSchemas.sharpen = structuredClone(actionSchemas['matrix']);
F.actionString = '{"action":"matrix","lineIn":"","lineOut":"","opacity":1,"width":3,"height":3,"offsetX":1,"offsetY":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"weights":[0,-1,0,-1,5,-1,0,-1,0]}';
F.label = 'Sharpen';
F.viewportAccuracy = 'scale-poor';
F.description = 'A matrix action variant, preset to create a sharpen effect.';
F.controls.weights.default = [0, -1, 0, -1, 5, -1, 0, -1, 0];
F.presentation = [...defaultPresentation];


// swirl
F = filterSchemas.swirl = structuredClone(actionSchemas['swirl']);
F.actionString = '{"action":"swirl","lineIn":"","lineOut":"","opacity":1,"swirls":[["50%","50%",0,"30%",90,"linear"]],"transparentEdges":false,"useInputAsMask":false}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Swirls',
    openOnLoad: true,
    inputs: ['swirls'],
  },{
    header: 'Alpha management',
    openOnLoad: false,
    inputs: ['useInputAsMask', 'transparentEdges'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// threshold
F = filterSchemas.threshold = structuredClone(actionSchemas['threshold']);
F.actionString = '{"action":"threshold","lineIn":"","lineOut":"","opacity":1,"level":128,"red":128,"green":128,"blue":128,"alpha":128,"low":[0,0,0,255],"high":[255,255,255,255],"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"useMixedChannel":true}';
F.controls.referenceColor = {
  controlType: 'color',
  alternativeFor: ['red', 'green', 'blue'],
  default: 'rgb(127 127 127 / 1)',
  key: 'referenceColor',
  label: 'Reference',
  description: 'Color string value for the level reference color',
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Mixed channels controls',
    openOnLoad: true,
    inputs: ['useMixedChannel', 'level'],
  },{
    header: 'Per-channel threshold color',
    openOnLoad: false,
    inputs: ['referenceColor', 'alpha'],
  },{
    header: 'Low color',
    openOnLoad: true,
    inputs: ['low'],
  },{
    header: 'High color',
    openOnLoad: true,
    inputs: ['high'],
  },{
    header: 'Included channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// tiles
F = filterSchemas.tiles = structuredClone(actionSchemas['tiles']);
F.actionString = '{"action":"tiles","lineIn":"","lineOut":"","opacity":1,"mode":"hex","originX":"50%","originY":"50%","rectWidth":10,"rectHeight":10,"hexRadius":5,"density":"1%","pointsData":[],"angle":0,"spiralStrength":0,"seed":"any_random_string_will_do","includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"premultiply":true,"useInputAsMask":false}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Mode',
    openOnLoad: true,
    inputs: ['mode', 'premultiply', 'useInputAsMask'],
  },{
    header: 'Origin',
    openOnLoad: true,
    inputs: ['originX', 'originY'],
  },{
    header: 'Rect controls',
    openOnLoad: false,
    inputs: ['rectWidth', 'rectHeight'],
  },{
    header: 'Hex controls',
    openOnLoad: false,
    inputs: ['hexRadius'],
  },{
    header: 'Random controls',
    openOnLoad: false,
    inputs: ['density', 'seed'],
  },{
    header: 'Spiral controls',
    openOnLoad: false,
    inputs: ['angle', 'spiralStrength'],
  },{
    header: 'Included channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue', 'includeAlpha'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// tint
F = filterSchemas.tint = structuredClone(actionSchemas['tint-channels']);
F.actionString = '{"action":"tint-channels","lineIn":"","lineOut":"","opacity":1,"redInRed":1,"redInGreen":0,"redInBlue":0,"greenInRed":0,"greenInGreen":1,"greenInBlue":0,"blueInRed":0,"blueInGreen":0,"blueInBlue":1}';
F.controls.redColor = {
  controlType: 'unit-color',
  alternativeFor: ['redInRed', 'greenInRed', 'blueInRed'],
  default: 'rgb(255 0 0)',
  key: 'redColor',
  label: 'Red color',
  description: 'Color string value of the red colors reference',
};
F.controls.greenColor = {
  controlType: 'unit-color',
  alternativeFor: ['redInGreen', 'greenInGreen', 'blueInGreen'],
  default: 'rgb(0 255 0)',
  key: 'greenColor',
  label: 'Green color',
  description: 'Color string value of the green colors reference',
};
F.controls.blueColor = {
  controlType: 'unit-color',
  alternativeFor: ['redInBlue', 'greenInBlue', 'blueInBlue'],
  default: 'rgb(0 0 255)',
  key: 'blueColor',
  label: 'Blue color',
  description: 'Color string value of the blue colors reference',
};
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Red colors',
    openOnLoad: false,
    inputs: ['redColor'],

  },{
    header: 'Green colors',
    openOnLoad: false,
    inputs: ['greenColor'],

  },{
    header: 'Blue colors',
    openOnLoad: false,
    inputs: ['blueColor'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// unsharp
F = filterSchemas.unsharp = structuredClone(actionSchemas['unsharp']);
F.actionString = '{"action":"unsharp","lineIn":"","lineOut":"","opacity":1,"strength":0.8,"radius":2,"level":0.015,"smoothing":0.015,"clamp":0.08,"useEdgeMask":true}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Control values',
    openOnLoad: true,
    inputs: ['strength', 'radius', 'level', 'smoothing', 'clamp'],
  },{
    header: 'Alpha management',
    openOnLoad: true,
    inputs: ['useEdgeMask'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


// yellow ('average-channels' variant)
F = filterSchemas.yellow = structuredClone(actionSchemas['average-channels']);
F.actionString = '{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"excludeBlue":true}';
F.label = 'Yellow mix';
F.viewportAccuracy = 'good';
F.description = 'An average-channels action variant, preset to remove blue channel.';
F.controls.includeRed.default = true;
F.controls.includeGreen.default = true;
F.controls.excludeBlue.default = true;
F.presentation = [...defaultPresentation];


// zoomBlur
F = filterSchemas.zoomBlur = structuredClone(actionSchemas['zoom-blur']);
F.actionString = '{"action":"zoom-blur","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"excludeTransparentPixels":true,"startX":"50%","startY":"50%","innerRadius":0,"outerRadius":0,"easing":"linear","premultiply":false,"multiscale":true,"strength":0.35,"angle":0,"seed":"any_random_string_will_do","samples":14,"variation":0}';
F.presentation = [{
    header: 'Connections',
    openOnLoad: false,
    inputs: ['lineIn', 'lineOut'],
  },{
    header: 'Control values',
    openOnLoad: true,
    inputs: ['strength', 'angle', 'samples', 'variation', 'seed'],
  },{
    header: 'Flags',
    openOnLoad: false,
    inputs: ['premultiply', 'multiscale'],
  },{
    header: 'Radius and Origin',
    openOnLoad: false,
    inputs: ['startX', 'startY', 'innerRadius', 'outerRadius', 'easing'],
  },{
    header: 'Included channels',
    openOnLoad: false,
    inputs: ['includeRed', 'includeGreen', 'includeBlue'],
  },{
    header: 'Alpha management',
    openOnLoad: false,
    inputs: ['includeAlpha', 'excludeTransparentPixels'],
  },{
    header: 'Impact',
    openOnLoad: true,
    inputs: ['opacity'],
}];


export const getFilterSchema = (name) => {

  if (filterSchemas[name]) return structuredClone(filterSchemas[name]);
  return null;
};

export const filterSchemaKeys = Object.keys(filterSchemas).sort((a, b) => {

  const A = getFilterSchema(a),
    B = getFilterSchema(b);

    if (A.label > B.label) return 1;
    return -1;
});

export const getActionSchema = (name) => {

  if (actionSchemas[name]) return structuredClone(actionSchemas[name]);
  return null;
};

const reconciliation = {
  ['alpha-to-channels']: 'alphaToChannels',
  ['alpha-to-luminance']: 'alphaToLuminance',
  ['area-alpha']: 'areaAlpha',
  ['average-channels']: 'averageChannels',
  ['blend']: 'blend',
  ['blur']: 'blur',
  ['lock-channels-to-levels']: 'channelLevels',
  ['modulate-channels']: 'channels',
  ['step-channels']: 'channelstep',
  ['channels-to-alpha']: 'channelsToAlpha',
  ['chroma']: 'chroma',
  ['colors-to-alpha']: 'chromakey',
  ['clamp-channels']: 'clampChannels',
  ['compose']: 'compose',
  ['corrode']: 'corrode',
  ['vary-channels-by-weights']: 'curveWeights',
  ['displace']: 'displace',
  ['emboss']: 'emboss',
  ['flood']: 'flood',
  ['gaussian-blur']: 'gaussianBlur',
  ['glitch']: 'glitch',
  ['grayscale']: 'grayscale',
  ['process-image']: 'image',
  ['invert-channels']: 'invert',
  ['luminance-to-alpha']: 'luminanceToAlpha',
  ['map-to-gradient']: 'mapToGradient',
  ['matrix']: 'matrix',
  ['modify-ok-channels']: 'modifyOk',
  ['modulate-ok-channels']: 'modulateOk',
  ['negative']: 'negative',
  ['newsprint']: 'newsprint',
  ['offset']: 'offset',
  ['ok-perceptual-curves']: 'okCurveWeights',
  ['pixelate']: 'pixelate',
  ['random-noise']: 'randomNoise',
  ['reduce-palette']: 'reducePalette',
  ['rotate-hue']: 'rotateHue',
  ['set-channel-to-level']: 'setChannelsToLevel',
  ['swirl']: 'swirl',
  ['threshold']: 'threshold',
  ['tiles']: 'tiles',
  ['tint-channels']: 'tint',
  ['unsharp']: 'unsharp',
  ['zoom-blur']: 'zoomBlur',
};

export const getFormSchemaFromAction = (item) => {

  const action = item.action;

  // We need to capture variants of several filter actions
  switch (action) {

    case 'average-channels': {

      const {
        excludeRed, excludeGreen, excludeBlue,
        includeRed, includeGreen, includeBlue
      } = item;

      // blue
      if (excludeRed && excludeGreen && !excludeBlue &&
        !includeRed && !includeGreen && !includeBlue) return 'blue'

      // cyan
      if (excludeRed && !excludeGreen && !excludeBlue &&
        !includeRed && includeGreen && includeBlue) return 'cyan'

      // gray
      if (!excludeRed && !excludeGreen && !excludeBlue &&
        includeRed && includeGreen && includeBlue) return 'gray'

      // green
      if (excludeRed && !excludeGreen && excludeBlue &&
        !includeRed && !includeGreen && !includeBlue) return 'green'

      // magenta
      if (!excludeRed && excludeGreen && !excludeBlue &&
        includeRed && !includeGreen && includeBlue) return 'magenta'

      // red
      if (!excludeRed && excludeGreen && excludeBlue &&
        !includeRed && !includeGreen && !includeBlue) return 'red'

      // yellow
      if (!excludeRed && !excludeGreen && excludeBlue &&
        includeRed && includeGreen && !includeBlue) return 'yellow'

      return 'averageChannels'
    }

    case 'set-channel-to-level': {

      const {includeRed, includeGreen, includeBlue, includeAlpha, level} = item

      // notBlue
      if (!includeRed && !includeGreen && includeBlue &&
        !includeAlpha && !level) return 'notBlue';

      // notGreen
      if (!includeRed && includeGreen && !includeBlue &&
        !includeAlpha && !level) return 'notGreen';

      // notRed
      if (includeRed && !includeGreen && !includeBlue &&
        !includeAlpha && !level) return 'notRed';

      return 'setChannelsToLevel';
    }

    case 'matrix': {

      const {
        includeRed, includeGreen, includeBlue, includeAlpha,
        width, height, offsetX, offsetY,
        premultiply, useInputAsMask, weights
      } = item;

      if (!includeRed || !includeGreen || !includeBlue || includeAlpha || width !== 3 || height !== 3 || premultiply || useInputAsMask || offsetX !== 1 || offsetY !== 1) return 'matrix';

      // edgeDetect
      if (weights.length === 9 &&
        weights[0] === 0 && weights[1] === 1 && weights[2] === 0 &&
        weights[3] === 1 && weights[4] === -4 && weights[5] === 1 &&
        weights[6] === 0 && weights[7] === 1 && weights[8] === 0
      ) return 'edgeDetect';

      // sharpen
      if (weights.length === 9 &&
        weights[0] === 0 && weights[1] === -1 && weights[2] === 0 &&
        weights[3] === -1 && weights[4] === 5 && weights[5] === -1 &&
        weights[6] === 0 && weights[7] === -1 && weights[8] === 0
      ) return 'sharpen';

      return 'matrix';
    }

    case 'tint': {

      const {
        redInRed, redInGreen, redInBlue,
        greenInRed, greenInGreen, greenInBlue,
        blueInRed, blueInGreen, blueInBlue,
      } = item;

      // sepia
      if (
        redInRed === 0.393 && redInGreen === 0.349 && redInBlue === 0.272 &&
        greenInRed === 0.769 && greenInGreen === 0.686 && greenInBlue === 0.534 &&
        blueInRed === 0.189 && blueInGreen === 0.168 && blueInBlue === 0.131
      ) return 'sepia';

      return 'tint';
    }

    default: {
      return reconciliation[action];
    }
  }
};

export const IN_OUT = 'in-out';
export const IN_MIX_OUT = 'in-mix-out';
export const OUT_ONLY = 'out-only';

export const socketDetails = {
  ['alpha-to-channels']: IN_OUT,
  ['alpha-to-luminance']: IN_OUT,
  ['area-alpha']: IN_OUT,
  ['blend']: IN_MIX_OUT,
  ['blur']: IN_OUT,
  ['lock-channels-to-levels']: IN_OUT,
  ['modulate-channels']: IN_OUT,
  ['step-channels']: IN_OUT,
  ['channels-to-alpha']: IN_OUT,
  ['chroma']: IN_OUT,
  ['colors-to-alpha']: IN_OUT,
  ['clamp-channels']: IN_OUT,
  ['compose']: IN_MIX_OUT,
  ['corrode']: IN_OUT,
  ['vary-channels-by-weights']: IN_OUT,
  ['displace']: IN_MIX_OUT,
  ['emboss']: IN_OUT,
  ['flood']: IN_OUT,
  ['gaussian-blur']: IN_OUT,
  ['glitch']: IN_OUT,
  ['grayscale']: IN_OUT,
  ['invert-channels']: IN_OUT,
  ['luminance-to-alpha']: IN_OUT,
  ['map-to-gradient']: IN_OUT,
  ['matrix']: IN_OUT,
  ['modify-ok-channels']: IN_OUT,
  ['modulate-ok-channels']: IN_OUT,
  ['negative']: IN_OUT,
  ['newsprint']: IN_OUT,
  ['offset']: IN_OUT,
  ['ok-perceptual-curves']: IN_OUT,
  ['pixelate']: IN_OUT,
  ['process-image']: OUT_ONLY,
  ['random-noise']: IN_OUT,
  ['reduce-palette']: IN_OUT,
  ['rotate-hue']: IN_OUT,
  ['set-channel-to-level']: IN_OUT,
  ['swirl']: IN_OUT,
  ['threshold']: IN_OUT,
  ['tiles']: IN_OUT,
  ['tint-channels']: IN_OUT,
  ['unsharp']: IN_OUT,
  ['zoom-blur']: IN_OUT,
};
