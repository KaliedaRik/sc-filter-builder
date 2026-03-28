// ------------------------------------------------------------------------
// Starter filter packets
// ------------------------------------------------------------------------

export const starterFilters = {

  blank: {
    title: 'Blank',
    packet: `["SC-starter-filter_blank","Filter","filter",{"name":"SC-starter-filter_blank","actions":[]}]`,
    imageSource: 'assets/thumb/starter-thumb-blank.png',
  },

  grayscale: {
    title: 'Desaturate',
    packet: `["SC-starter-filter_grayscale","Filter","filter",{"name":"SC-starter-filter_grayscale","actions":[{"action":"grayscale","lineIn":"","lineOut":"","opacity":1}]}]`,
    imageSource: 'assets/thumb/starter-thumb-grayscale.png',
  },

  gaussianBlur: {
    title: 'Gaussian blur',
    packet: `["SC-starter-filter_gaussian-blur","Filter","filter",{"name":"SC-starter-filter_gaussian-blur","actions":[{"action":"gaussian-blur","lineIn":"","lineOut":"","includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":true,"excludeTransparentPixels":false,"opacity":1,"premultiply":false,"radiusHorizontal":4,"radiusVertical":4,"angle":0}]}]`,
    imageSource: 'assets/thumb/starter-thumb-gaussian-blur.png',
  },

  sepia: {
    title: 'Sepia tint',
    packet: `["SC-starter-filter_sepia","Filter","filter",{"name":"SC-starter-filter_sepia","actions":[{"action":"tint-channels","lineIn":"","lineOut":"","opacity":1,"redInRed":0.393,"redInGreen":0.349,"redInBlue":0.272,"greenInRed":0.769,"greenInGreen":0.686,"greenInBlue":0.534,"blueInRed":0.189,"blueInGreen":0.168,"blueInBlue":0.131}]}]`,
    imageSource: 'assets/thumb/starter-thumb-sepia.png',
  },

  pixelate: {
    title: 'Pixelate',
    packet: `["SC-starter-filter_pixelate","Filter","filter",{"name":"SC-starter-filter_pixelate","actions":[{"action":"pixelate","lineIn":"","lineOut":"","opacity":1,"tileWidth":10,"tileHeight":10,"offsetX":0,"offsetY":0,"includeRed":true,"includeGreen":true,"includeBlue":true,"includeAlpha":false}]}]`,
    imageSource: 'assets/thumb/starter-thumb-pixelate.png',
  },
};
