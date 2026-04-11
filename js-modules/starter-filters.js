// ------------------------------------------------------------------------
// Starter filter packets
// ------------------------------------------------------------------------

export const starterFilters = {

  ['SC-starter-filter_blank']: {
    title: 'Blank',
    readableName: 'Blank starter',
    formSchemaName: '',
    packet: `["SC-starter-filter_blank","Filter","filter",{"name":"SC-starter-filter_blank","actions":[]}]`,
    imageSource: 'assets/thumb/starter-thumb_blank.png',
  },

  ['SC-starter-filter_desaturate']: {
    title: 'Desaturate',
    readableName: 'Desaturate starter',
    formSchemaName: 'grayscale',
    packet: `["SC-starter-filter_desaturate","Filter","filter",{"name":"SC-starter-filter_desaturate","actions":[{"action":"grayscale","lineIn":"","lineOut":"","opacity":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_desaturate.png',
  },

  ['SC-starter-filter_gray-monochrome']: {
    title: 'Gray monochrome',
    readableName: 'Gray monochrome starter',
    formSchemaName: 'gray',
    packet: `["SC-starter-filter_gray-monochrome","Filter","filter",{"name":"SC-starter-filter_gray-monochrome","actions":[{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"includeBlue":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_gray-monochrome.png',
  },

  ['SC-starter-filter_gaussian-blur']: {
    title: 'Gaussian blur',
    readableName: 'Gaussian blur starter',
    formSchemaName: 'gaussianBlur',
    packet: `["SC-starter-filter_gaussian-blur","Filter","filter",{"name":"SC-starter-filter_gaussian-blur","actions":[{"action":"gaussian-blur","lineIn":"","lineOut":"","includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"excludeTransparentPixels":false,"opacity":1,"premultiply":true,"radiusHorizontal":4,"radiusVertical":4,"angle":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_gaussian-blur.png',
  },

  ['SC-starter-filter_sepia-tint']: {
    title: 'Sepia tint',
    readableName: 'Sepia tint starter',
    formSchemaName: 'sepia',
    packet: `["SC-starter-filter_sepia-tint","Filter","filter",{"name":"SC-starter-filter_sepia-tint","actions":[{"action":"tint-channels","lineIn":"","lineOut":"","opacity":1,"redInRed":0.393,"redInGreen":0.349,"redInBlue":0.272,"greenInRed":0.769,"greenInGreen":0.686,"greenInBlue":0.534,"blueInRed":0.189,"blueInGreen":0.168,"blueInBlue":0.131}]}]`,
    imageSource: 'assets/thumb/starter-thumb_sepia-tint.png',
  },

  ['SC-starter-filter_pixelate']: {
    title: 'Pixelate',
    readableName: 'Pixelate starter',
    formSchemaName: 'pixelate',
    packet: `["SC-starter-filter_pixelate","Filter","filter",{"name":"SC-starter-filter_pixelate","actions":[{"action":"pixelate","lineIn":"","lineOut":"","opacity":1,"tileWidth":10,"tileHeight":10,"offsetX":0,"offsetY":0,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false}]}]`,
    imageSource: 'assets/thumb/starter-thumb_pixelate.png',
  },

  ['SC-starter-filter_red-channel']: {
    title: 'Red channel',
    readableName: 'Red channel starter',
    formSchemaName: 'red',
    packet: `["SC-starter-filter_red-channel","Filter","filter",{"name":"SC-starter-filter_red-channel","actions":[{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"excludeGreen":true,"excludeBlue":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_red-channel.png',
  },

  ['SC-starter-filter_green-channel']: {
    title: 'Green channel',
    readableName: 'Green channel starter',
    formSchemaName: 'green',
    packet: `["SC-starter-filter_green-channel","Filter","filter",{"name":"SC-starter-filter_green-channel","actions":[{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"excludeRed":true,"excludeBlue":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_green-channel.png',
  },

  ['SC-starter-filter_blue-channel']: {
    title: 'Blue channel',
    readableName: 'Blue channel starter',
    formSchemaName: 'blue',
    packet: `["SC-starter-filter_blue-channel","Filter","filter",{"name":"SC-starter-filter_blue-channel","actions":[{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"excludeRed":true,"excludeGreen":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_blue-channel.png',
  },

  ['SC-starter-filter_cyan-mix']: {
    title: 'Cyan mix',
    readableName: 'Cyan mix starter',
    formSchemaName: 'cyan',
    packet: `["SC-starter-filter_cyan-mix","Filter","filter",{"name":"SC-starter-filter_cyan-mix","actions":[{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"includeGreen":true,"includeBlue":true,"excludeRed":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_cyan-mix.png',
  },

  ['SC-starter-filter_magenta-mix']: {
    title: 'Magenta mix',
    readableName: 'Magenta mix starter',
    formSchemaName: 'magenta',
    packet: `["SC-starter-filter_magenta-mix","Filter","filter",{"name":"SC-starter-filter_magenta-mix","actions":[{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeBlue":true,"excludeGreen":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_magenta-mix.png',
  },

  ['SC-starter-filter_yellow-mix']: {
    title: 'Yellow mix',
    readableName: 'Yellow mix starter',
    formSchemaName: 'yellow',
    packet: `["SC-starter-filter_yellow-mix","Filter","filter",{"name":"SC-starter-filter_yellow-mix","actions":[{"action":"average-channels","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"excludeBlue":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_yellow-mix.png',
  },

  ['SC-starter-filter_exclude-red-channel']: {
    title: 'Exclude red channel',
    readableName: 'Exclude red channel starter',
    formSchemaName: 'notred',
    packet: `["SC-starter-filter_exclude-red-channel","Filter","filter",{"name":"SC-starter-filter_exclude-red-channel","actions":[{"action":"set-channel-to-level","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"level":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_exclude-red-channel.png',
  },

  ['SC-starter-filter_exclude-green-channel']: {
    title: 'Exclude green channel',
    readableName: 'Exclude green channel starter',
    formSchemaName: 'notgreen',
    packet: `["SC-starter-filter_exclude-green-channel","Filter","filter",{"name":"SC-starter-filter_exclude-green-channel","actions":[{"action":"set-channel-to-level","lineIn":"","lineOut":"","opacity":1,"includeGreen":true,"level":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_exclude-green-channel.png',
  },

  ['SC-starter-filter_exclude-blue-channel']: {
    title: 'Exclude blue channel',
    readableName: 'Exclude blue channel starter',
    formSchemaName: 'notblue',
    packet: `["SC-starter-filter_exclude-blue-channel","Filter","filter",{"name":"SC-starter-filter_exclude-blue-channel","actions":[{"action":"set-channel-to-level","lineIn":"","lineOut":"","opacity":1,"includeBlue":true,"level":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_exclude-blue-channel.png',
  },

  ['SC-starter-filter_invert-colors']: {
    title: 'Invert colors',
    readableName: 'Invert colors starter',
    formSchemaName: 'invert',
    packet: `["SC-starter-filter_invert-colors","Filter","filter",{"name":"SC-starter-filter_invert-colors","actions":[{"action":"invert-channels","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"includeBlue":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_invert-colors.png',
  },

  ['SC-starter-filter_ok-negative']: {
    title: 'OK Negative',
    readableName: 'OK Negative starter',
    formSchemaName: 'negative',
    packet: `["SC-starter-filter_ok-negative","Filter","filter",{"name":"SC-starter-filter_ok-negative","actions":[{"action":"negative","lineIn":"","lineOut":"","opacity":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_ok-negative.png',
  },

  ['SC-starter-filter_brightness']: {
    title: 'Brightness',
    readableName: 'Brightness starter',
    formSchemaName: 'brightness',
    packet: `["SC-starter-filter_brightness","Filter","filter",{"name":"SC-starter-filter_brightness","actions":[{"action":"modulate-channels","lineIn":"","lineOut":"","opacity":1,"red":0.8,"green":0.8,"blue":0.8}]}]`,
    imageSource: 'assets/thumb/starter-thumb_brightness.png',
  },

  ['SC-starter-filter_saturation']: {
    title: 'Saturation',
    readableName: 'Saturation starter',
    formSchemaName: 'saturation',
    packet: `["SC-starter-filter_saturation","Filter","filter",{"name":"SC-starter-filter_saturation","actions":[{"action":"modulate-channels","lineIn":"","lineOut":"","opacity":1,"red":2,"green":2,"blue":2,"saturation":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_saturation.png',
  },

  ['SC-starter-filter_copy-alpha-to-channels']: {
    title: 'Copy alpha to channels',
    readableName: 'Copy alpha to channels starter',
    formSchemaName: 'alphaToChannels',
    packet: `["SC-starter-filter_copy-alpha-to-channels","Filter","filter",{"name":"SC-starter-filter_copy-alpha-to-channels","actions":[{"action":"alpha-to-channels","lineIn":"","lineOut":"","opacity":0.2,"includeRed":true,"includeGreen":true,"includeBlue":true,"excludeRed":true,"excludeGreen":true,"excludeBlue":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_copy-alpha-to-channels.png',
  },

  ['SC-starter-filter_copy-alpha-to-luminance']: {
    title: 'Copy alpha to luminance',
    readableName: 'Copy alpha to luminance starter',
    formSchemaName: 'alphaToLuminance',
    packet: `["SC-starter-filter_copy-alpha-to-luminance","Filter","filter",{"name":"SC-starter-filter_copy-alpha-to-luminance","actions":[{"action":"alpha-to-luminance","lineIn":"","lineOut":"","opacity":0.4}]}]`,
    imageSource: 'assets/thumb/starter-thumb_copy-alpha-to-luminance.png',
  },

  ['SC-starter-filter_area-alpha']: {
    title: 'Area alpha',
    readableName: 'Area alpha starter',
    formSchemaName: 'areaAlpha',
    packet: `["SC-starter-filter_area-alpha","Filter","filter",{"name":"SC-starter-filter_area-alpha","actions":[{"action":"area-alpha","lineIn":"","lineOut":"","opacity":1,"tileWidth":8,"tileHeight":8,"offsetX":0,"offsetY":0,"gutterWidth":8,"gutterHeight":8,"areaAlphaLevels":[255,215,175,135]}]}]`,
    imageSource: 'assets/thumb/starter-thumb_area-alpha.png',
  },

  ['SC-starter-filter_box-blur']: {
    title: 'Box blur',
    readableName: 'Box blur starter',
    formSchemaName: 'blur',
    packet: `["SC-starter-filter_box-blur","Filter","filter",{"name":"SC-starter-filter_box-blur","actions":[{"action":"blur","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"excludeTransparentPixels":true,"processHorizontal":true,"radiusHorizontal":1,"stepHorizontal":1,"passesHorizontal":1,"processVertical":true,"radiusVertical":1,"stepVertical":1,"passesVertical":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_box-blur.png',
  },

  ['SC-starter-filter_posterize-by-value']: {
    title: 'Posterize by value',
    readableName: 'Posterize by value starter',
    formSchemaName: 'channelLevels',
    packet: `["SC-starter-filter_posterize-by-value","Filter","filter",{"name":"SC-starter-filter_posterize-by-value","actions":[{"action":"lock-channels-to-levels","lineIn":"","lineOut":"","opacity":1,"red":[50,200],"green":[60,150,220],"blue":[40,180],"alpha":[]}]}]`,
    imageSource: 'assets/thumb/starter-thumb_posterize-by-value.png',
  },

  ['SC-starter-filter_posterize-by-step']: {
    title: 'Posterize by step',
    readableName: 'Posterize by step starter',
    formSchemaName: 'channelstep',
    packet: `["SC-starter-filter_posterize-by-step","Filter","filter",{"name":"SC-starter-filter_posterize-by-step","actions":[{"action":"step-channels","lineIn":"","lineOut":"","opacity":1,"clamp":"down","red":64,"green":64,"blue":64}]}]`,
    imageSource: 'assets/thumb/starter-thumb_posterize-by-step.png',
  },

  ['SC-starter-filter_modulate-channels']: {
    title: 'Modulate channels',
    readableName: 'Modulate channels starter',
    formSchemaName: 'channels',
    packet: `["SC-starter-filter_modulate-channels","Filter","filter",{"name":"SC-starter-filter_modulate-channels","actions":[{"action":"modulate-channels","lineIn":"","lineOut":"","opacity":1,"red":1,"green":1,"blue":1,"alpha":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_modulate-channels.png',
  },

  ['SC-starter-filter_copy-channels-to-alpha']: {
    title: 'Copy channels to alpha',
    readableName: 'Copy channels to alpha starter',
    formSchemaName: 'channelsToAlpha',
    packet: `["SC-starter-filter_copy-channels-to-alpha","Filter","filter",{"name":"SC-starter-filter_copy-channels-to-alpha","actions":[{"action":"channels-to-alpha","lineIn":"","lineOut":"","opacity":1,"includeRed":false,"includeGreen":false,"includeBlue":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_copy-channels-to-alpha.png',
  },

  ['SC-starter-filter_chroma-clear-by-ranges']: {
    title: 'Chroma clear by ranges',
    readableName: 'Chroma clear by ranges starter',
    formSchemaName: 'chroma',
    packet: `["SC-starter-filter_chroma-clear-by-ranges","Filter","filter",{"name":"SC-starter-filter_chroma-clear-by-ranges","actions":[{"action":"chroma","lineIn":"","lineOut":"","opacity":1,"ranges":[[0,0,0,152,185,152]],"featherRed":0,"featherGreen":0,"featherBlue":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_chroma-clear-by-ranges.png',
  },

  ['SC-starter-filter_chroma-clear-by-reference']: {
    title: 'Chroma clear by reference',
    readableName: 'Chroma clear by reference starter',
    formSchemaName: 'chromakey',
    packet: `["SC-starter-filter_chroma-clear-by-reference","Filter","filter",{"name":"SC-starter-filter_chroma-clear-by-reference","actions":[{"action":"colors-to-alpha","lineIn":"","lineOut":"","opacity":1,"red":190,"green":129,"blue":223,"transparentAt":0.32,"opaqueAt":0.39}]}]`,
    imageSource: 'assets/thumb/starter-thumb_chroma-clear-by-reference.png',
  },

  ['SC-starter-filter_clamp-channels']: {
    title: 'Clamp chanels',
    readableName: 'Clamp chanels starter',
    formSchemaName: 'clampChannels',
    packet: `["SC-starter-filter_clamp-channels","Filter","filter",{"name":"SC-starter-filter_clamp-channels","actions":[{"action":"clamp-channels","lineIn":"","lineOut":"","opacity":1,"lowRed":23,"lowGreen":0,"lowBlue":120,"highRed":255,"highGreen":216,"highBlue":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_clamp-channels.png',
  },

  ['SC-starter-filter_copy-luminance-to-alpha']: {
    title: 'Luminance to alpha',
    readableName: 'Luminance to alpha starter',
    formSchemaName: 'luminanceToAlpha',
    packet: `["SC-starter-filter_copy-luminance-to-alpha","Filter","filter",{"name":"SC-starter-filter_copy-luminance-to-alpha","actions":[{"action":"luminance-to-alpha","lineIn":"","lineOut":"","opacity":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_copy-luminance-to-alpha.png',
  },

  ['SC-starter-filter_modify-ok-channels']: {
    title: 'Modify OK channels',
    readableName: 'Modify OK channels starter',
    formSchemaName: 'modifyOk',
    packet: `["SC-starter-filter_modify-ok-channels","Filter","filter",{"name":"SC-starter-filter_modify-ok-channels","actions":[{"action":"modify-ok-channels","lineIn":"","lineOut":"","opacity":1,"channelL":0.3,"channelA":0,"channelB":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_modify-ok-channels.png',
  },

  ['SC-starter-filter_modulate-ok-channels']: {
    title: 'Modulate OK channels',
    readableName: 'Modulate OK channels starter',
    formSchemaName: 'modulateOk',
    packet: `["SC-starter-filter_modulate-ok-channels","Filter","filter",{"name":"SC-starter-filter_modulate-ok-channels","actions":[{"action":"modulate-ok-channels","lineIn":"","lineOut":"","opacity":1,"channelL":0.8,"channelA":1,"channelB":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_modulate-ok-channels.png',
  },

  ['SC-starter-filter_newsprint']: {
    title: 'Newsprint',
    readableName: 'Newsprint starter',
    formSchemaName: 'newsprint',
    packet: `["SC-starter-filter_newsprint","Filter","filter",{"name":"SC-starter-filter_newsprint","actions":[{"action":"newsprint","lineIn":"","lineOut":"","opacity":1,"width":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_newsprint.png',
  },

  ['SC-starter-filter_random-noise']: {
    title: 'Random noise',
    readableName: 'Random noise starter',
    formSchemaName: 'randomNoise',
    packet: `["SC-starter-filter_random-noise","Filter","filter",{"name":"SC-starter-filter_random-noise","actions":[{"action":"random-noise","lineIn":"","lineOut":"","opacity":1,"width":50,"height":50,"seed":"any_random_string_will_do","noiseType":"random","level":0.5,"noWrap":false,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":true,"excludeTransparentPixels":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_random-noise.png',
  },

  ['SC-starter-filter_reduce-palette']: {
    title: 'Reduce palette',
    readableName: 'Reduce palette starter',
    formSchemaName: 'reducePalette',
    packet: `["SC-starter-filter_reduce-palette","Filter","filter",{"name":"SC-starter-filter_reduce-palette","actions":[{"action":"reduce-palette","lineIn":"","lineOut":"","seed":"any_random_string_will_do","minimumColorDistance":1000,"palette":16,"noiseType":"bluenoise","opacity":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_reduce-palette.png',
  },

  ['SC-starter-filter_rotate-hue']: {
    title: 'Rotate hue',
    readableName: 'Rotate hue starter',
    formSchemaName: 'rotateHue',
    packet: `["SC-starter-filter_rotate-hue","Filter","filter",{"name":"SC-starter-filter_rotate-hue","actions":[{"action":"rotate-hue","lineIn":"","lineOut":"","opacity":1,"angle":180}]}]`,
    imageSource: 'assets/thumb/starter-thumb_rotate-hue.png',
  },

  ['SC-starter-filter_sharpen']: {
    title: 'Sharpen',
    readableName: 'Sharpen starter',
    formSchemaName: 'sharpen',
    packet: `["SC-starter-filter_sharpen","Filter","filter",{"name":"SC-starter-filter_sharpen","actions":[{"action":"matrix","lineIn":"","lineOut":"","opacity":1,"width":3,"height":3,"offsetX":1,"offsetY":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"weights":[0,-1,0,-1,5,-1,0,-1,0]}]}]`,
    imageSource: 'assets/thumb/starter-thumb_sharpen.png',
  },

  ['SC-starter-filter_threshold']: {
    title: 'Threshold',
    readableName: 'Threshold starter',
    formSchemaName: 'threshold',
    packet: `["SC-starter-filter_threshold","Filter","filter",{"name":"SC-starter-filter_threshold","actions":[{"action":"threshold","lineIn":"","lineOut":"","opacity":1,"level":128,"red":128,"green":128,"blue":128,"alpha":128,"low":[0,0,0,255],"high":[255,255,255,255],"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"useMixedChannel":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_threshold.png',
  },

  ['SC-starter-filter_tiles']: {
    title: 'Tiles',
    readableName: 'Tiles starter',
    formSchemaName: 'tiles',
    packet: `["SC-starter-filter_tiles","Filter","filter",{"name":"SC-starter-filter_tiles","actions":[{"action":"tiles","lineIn":"","lineOut":"","opacity":1,"mode":"hex","originX":"50%","originY":"50%","rectWidth":10,"rectHeight":10,"hexRadius":5,"randomCount":10,"pointsData":[],"angle":0,"spiralStrength":0,"seed":"any_random_string_will_do","includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"premultiply":true,"useInputAsMask":false}]}]`,
    imageSource: 'assets/thumb/starter-thumb_tiles.png',
  },

  ['SC-starter-filter_unsharp']: {
    title: 'Unsharp',
    readableName: 'Unsharp starter',
    formSchemaName: 'unsharp',
    packet: `["SC-starter-filter_unsharp","Filter","filter",{"name":"SC-starter-filter_unsharp","actions":[{"action":"unsharp","lineIn":"","lineOut":"","opacity":1,"strength":0.8,"radius":2,"level":0.015,"smoothing":0.015,"clamp":0.08,"useEdgeMask":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_unsharp.png',
  },

  ['SC-starter-filter_zoom-blur']: {
    title: 'Zoom blur',
    readableName: 'Zoom blur starter',
    formSchemaName: 'zoomBlur',
    packet: `["SC-starter-filter_zoom-blur","Filter","filter",{"name":"SC-starter-filter_zoom-blur","actions":[{"action":"zoom-blur","lineIn":"","lineOut":"","opacity":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"excludeTransparentPixels":true,"startX":"50%","startY":"50%","innerRadius":0,"outerRadius":0,"easing":"linear","premultiply":false,"multiscale":true,"strength":0.35,"angle":0,"seed":"any_random_string_will_do","samples":14,"variation":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_zoom-blur.png',
  },

  ['SC-starter-filter_corrode']: {
    title: 'Corrode',
    readableName: 'Corrode starter',
    formSchemaName: 'corrode',
    packet: `["SC-starter-filter_corrode","Filter","filter",{"name":"SC-starter-filter_corrode","actions":[{"action":"corrode","lineIn":"","lineOut":"","width":3,"height":3,"offsetX":1,"offsetY":1,"includeRed":false,"includeGreen":false,"includeBlue":false,"includeAlpha":true,"operation":"mean","opacity":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_corrode.png',
  },

  ['SC-starter-filter_color-curve']: {
    title: 'Color curve',
    readableName: 'Color curve starter',
    formSchemaName: 'curveWeights',
    packet: `["SC-starter-filter_color-curve","Filter","filter",{"name":"SC-starter-filter_color-curve","actions":[{"action":"vary-channels-by-weights","lineIn":"","lineOut":"","opacity":1,"weights":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],"useMixedChannel":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_color-curve.png',
  },

  ['SC-starter-filter_tone-curve']: {
    title: 'Tone curve',
    readableName: 'Tone curve starter',
    formSchemaName: 'okCurveWeights',
    packet: `["SC-starter-filter_tone-curve","Filter","filter",{"name":"SC-starter-filter_tone-curve","actions":[{"action":"ok-perceptual-curves","lineIn":"","lineOut":"","opacity":1,"curves":{"luminance":[],"chroma":[],"aChannel":[],"bChannel":[]}}]}]`,
    imageSource: 'assets/thumb/starter-thumb_tone-curve.png',
  },

  ['SC-starter-filter_deconvolute']: {
    title: 'Deconvolute',
    readableName: 'Deconvolute starter',
    formSchemaName: 'deconvolute',
    packet: `["SC-starter-filter_deconvolute","Filter","filter",{"name":"SC-starter-filter_deconvolute","actions":[{"action":"deconvolute","lineIn":"","lineOut":"","opacity":1,"strength":0.85,"radius":1.25,"level":0.015,"smoothing":0.015,"clamp":0.08,"passes":8,"deriveMaskFromImage":true,"multiscale":true,"multiscaleFinalPasses":2}]}]`,
    imageSource: 'assets/thumb/starter-thumb_deconvolute.png',
  },

  ['SC-starter-filter_glitch']: {
    title: 'Glitch',
    readableName: 'Glitch starter',
    formSchemaName: 'glitch',
    packet: `["SC-starter-filter_glitch","Filter","filter",{"name":"SC-starter-filter_glitch","actions":[{"action":"glitch","lineIn":"","lineOut":"","opacity":1,"useMixedChannel":true,"seed":"default-seed","step":1,"offsetMin":0,"offsetMax":0,"offsetRedMin":0,"offsetRedMax":0,"offsetGreenMin":0,"offsetGreenMax":0,"offsetBlueMin":0,"offsetBlueMax":0,"offsetAlphaMin":0,"offsetAlphaMax":0,"transparentEdges":false,"useInputAsMask":false,"level":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_glitch.png',
  },

  ['SC-starter-filter_edge-detect']: {
    title: 'Edge detect',
    readableName: 'Edge detect starter',
    formSchemaName: 'edgeDetect',
    packet: `["SC-starter-filter_edge-detect","Filter","filter",{"name":"SC-starter-filter_edge-detect","actions":[{"action":"matrix","lineIn":"","lineOut":"","opacity":1,"width":3,"height":3,"offsetX":1,"offsetY":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"weights":[0,1,0,1,-4,1,0,1,0]}]}]`,
    imageSource: 'assets/thumb/starter-thumb_edge-detect.png',
  },

  ['SC-starter-filter_emboss']: {
    title: 'Emboss',
    readableName: 'Emboss starter',
    formSchemaName: 'emboss',
    packet: `["SC-starter-filter_emboss","Filter","filter",{"name":"SC-starter-filter_emboss","actions":[{"action":"emboss","lineIn":"","lineOut":"","opacity":1,"angle":0,"strength":1,"tolerance":0,"keepOnlyChangedAreas":false,"postProcessResults":true}]}]`,
    imageSource: 'assets/thumb/starter-thumb_emboss.png',
  },

  ['SC-starter-filter_flood']: {
    title: 'Flood',
    readableName: 'Flood starter',
    formSchemaName: 'flood',
    packet: `["SC-starter-filter_flood","Filter","filter",{"name":"SC-starter-filter_flood","actions":[{"action":"flood","lineIn":"","lineOut":"","opacity":1,"red":0,"green":0,"blue":0,"alpha":255,"excludeAlpha":false}]}]`,
    imageSource: 'assets/thumb/starter-thumb_flood.png',
  },

  ['SC-starter-filter_map-to-gradient']: {
    title: 'Map to gradient',
    readableName: 'Map to gradient starter',
    formSchemaName: 'mapToGradient',
    packet: `["SC-starter-filter_map-to-gradient_gradient","Gradient","styles",{"name":"SC-starter-filter_map-to-gradient_gradient","start":[0,0],"end":["100%",0],"colors":[[0,"rgb(255 0 0 / 1)"],[499,"rgb(0 255 0 / 1)"],[999,"rgb(0 0 255 / 1)"]],"easing":"linear","precision":1,"colorSpace":"oklab","returnColorAs":"rgb"}]§§["SC-starter-filter_map-to-gradient","Filter","filter",{"name":"SC-starter-filter_map-to-gradient","actions":[{"action":"map-to-gradient","lineIn":"","lineOut":"","opacity":1,"useNaturalGrayscale":false,"gradient":"SC-starter-filter_map-to-gradient_gradient"}]}]`,
    imageSource: 'assets/thumb/starter-thumb_map-to-gradient.png',
  },

  ['SC-starter-filter_matrix']: {
    title: 'Matrix',
    readableName: 'Matrix starter',
    formSchemaName: 'matrix',
    packet: `["SC-starter-filter_matrix","Filter","filter",{"name":"SC-starter-filter_matrix","actions":[{"action":"matrix","lineIn":"","lineOut":"","opacity":1,"width":3,"height":3,"offsetX":1,"offsetY":1,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false,"weights":[0,0,0,0,1,0,0,0,0],"premultiply":false,"useInputAsMask":false}]}]`,
    imageSource: 'assets/thumb/starter-thumb_matrix.png',
  },

  ['SC-starter-filter_offset']: {
    title: 'Offset',
    readableName: 'Offset starter',
    formSchemaName: 'offset',
    packet: `["SC-starter-filter_offset","Filter","filter",{"name":"SC-starter-filter_offset","actions":[{"action":"offset","lineIn":"","lineOut":"","opacity":1,"offsetRedX":0,"offsetRedY":0,"offsetGreenX":0,"offsetGreenY":0,"offsetBlueX":0,"offsetBlueY":0,"offsetAlphaX":0,"offsetAlphaY":0,"useInputAsMask":false}]}]`,
    imageSource: 'assets/thumb/starter-thumb_offset.png',
  },

  ['SC-starter-filter_set-channel-to-level']: {
    title: 'Set channel to level',
    readableName: 'Set channel to level starter',
    formSchemaName: 'setChannelToLevel',
    packet: `["SC-starter-filter_set-channel-to-level","Filter","filter",{"name":"SC-starter-filter_set-channel-to-level","actions":[{"action":"set-channel-to-level","lineIn":"","lineOut":"","opacity":1,"includeRed":false,"includeGreen":false,"includeBlue":false,"includeAlpha":false,"level":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb_set-channel-to-level.png',
  },

  ['SC-starter-filter_tint']: {
    title: 'Tint',
    readableName: 'Tint starter',
    formSchemaName: 'tint',
    packet: `["SC-starter-filter_tint","Filter","filter",{"name":"SC-starter-filter_tint","actions":[{"action":"tint-channels","lineIn":"","lineOut":"","opacity":1,"redInRed":1,"redInGreen":0,"redInBlue":0,"greenInRed":0,"greenInGreen":1,"greenInBlue":0,"blueInRed":0,"blueInGreen":0,"blueInBlue":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb_tint.png',
  },
};

export const filterGroups = [{
  id: 'startHere',
  title: 'Start here',
  openOnLoad: true,
  filters: [
    'SC-starter-filter_blank',
    'SC-starter-filter_brightness',
    'SC-starter-filter_saturation',
    'SC-starter-filter_gaussian-blur',
    'SC-starter-filter_sharpen',
    'SC-starter-filter_threshold',
    'SC-starter-filter_rotate-hue',
    'SC-starter-filter_color-curve',
    'SC-starter-filter_tone-curve',
  ],
},{
  id: 'fixOrAdjustImage',
  title: 'Fix or adjust images',
  openOnLoad: false,
  filters: [
    'SC-starter-filter_brightness',
    'SC-starter-filter_saturation',
    'SC-starter-filter_modulate-channels',
    'SC-starter-filter_modify-ok-channels',
    'SC-starter-filter_modulate-ok-channels',
    'SC-starter-filter_color-curve',
    'SC-starter-filter_tone-curve',
    'SC-starter-filter_tint',
    'SC-starter-filter_clamp-channels',
    'SC-starter-filter_gaussian-blur',
    'SC-starter-filter_box-blur',
    'SC-starter-filter_sharpen',
    'SC-starter-filter_unsharp',
    'SC-starter-filter_deconvolute',
    'SC-starter-filter_matrix',
    'SC-starter-filter_offset',
  ],
},{
  id: 'extractOrMask',
  title: 'Extract or mask images',
  openOnLoad: false,
  filters: [
    'SC-starter-filter_copy-alpha-to-channels',
    'SC-starter-filter_copy-alpha-to-luminance',
    'SC-starter-filter_copy-channels-to-alpha',
    'SC-starter-filter_copy-luminance-to-alpha',
    'SC-starter-filter_area-alpha',
    'SC-starter-filter_chroma-clear-by-ranges',
    'SC-starter-filter_chroma-clear-by-reference',
    'SC-starter-filter_threshold',
    'SC-starter-filter_corrode',
    'SC-starter-filter_flood',
    'SC-starter-filter_set-channels-to-level',
  ],
},{
  id: 'reduceAndStylize',
  title: 'Reduce and stylize images',
  openOnLoad: false,
  filters: [
    'SC-starter-filter_desaturate',
    'SC-starter-filter_gray-monochrome',
    'SC-starter-filter_pixelate',
    'SC-starter-filter_posterize-by-value',
    'SC-starter-filter_posterize-by-step',
    'SC-starter-filter_reduce-palette',
    'SC-starter-filter_newsprint',
    'SC-starter-filter_tiles',
    'SC-starter-filter_random-noise',
    'SC-starter-filter_zoom-blur',
    'SC-starter-filter_emboss',
    'SC-starter-filter_map-to-gradient',
    'SC-starter-filter_invert-colors',
    'SC-starter-filter_ok-negative',
    'SC-starter-filter_glitch',
  ],
},{
  id: 'inspectChannels',
  title: 'Inspect image channels',
  openOnLoad: false,
  filters: [
    'SC-starter-filter_gray-monochrome',
    'SC-starter-filter_red-channel',
    'SC-starter-filter_green-channel',
    'SC-starter-filter_blue-channel',
    'SC-starter-filter_cyan-mix',
    'SC-starter-filter_magenta-mix',
    'SC-starter-filter_yellow-mix',
    'SC-starter-filter_exclude-red-channel',
    'SC-starter-filter_exclude-green-channel',
    'SC-starter-filter_exclude-blue-channel',
    'SC-starter-filter_copy-alpha-to-channels',
    'SC-starter-filter_copy-alpha-to-luminance',
    'SC-starter-filter_copy-channels-to-alpha',
    'SC-starter-filter_copy-luminance-to-alpha',
    'SC-starter-filter_threshold',
    'SC-starter-filter_edge-detect',
  ],
},{
  id: 'recolorImage',
  title: 'Recolor images',
  openOnLoad: false,
  filters: [
    'SC-starter-filter_sepia-tint',
    'SC-starter-filter_invert-colors',
    'SC-starter-filter_ok-negative',
    'SC-starter-filter_rotate-hue',
    'SC-starter-filter_clamp-channels',
    'SC-starter-filter_modulate-channels',
    'SC-starter-filter_modify-ok-channels',
    'SC-starter-filter_modulate-ok-channels',
    'SC-starter-filter_tint',
    'SC-starter-filter_color-curve',
    'SC-starter-filter_tone-curve',
    'SC-starter-filter_map-to-gradient',
    'SC-starter-filter_flood',
    'SC-starter-filter_set-channels-to-level',
  ],
}];
