# Current list of things todo
The list is evolving and I do not commit to doing anything in the current order

## Starter filters work and form building
Create packets for the following filters
[] - filterSchemas.blend
[] - filterSchemas.compose
[] - filterSchemas.displace
[] - filterSchemas.image
[] - filterSchemas.swirl

### Mapping packets to single-action starter filters
```
['SC-starter-filter_area-alpha'] - filterSchemas.areaAlpha
['SC-starter-filter_blank'] - n/a
['SC-starter-filter_blue-channel'] - filterSchemas.blue
['SC-starter-filter_box-blur'] - filterSchemas.blur
['SC-starter-filter_brightness'] - filterSchemas.brightness
['SC-starter-filter_chroma-clear-by-ranges'] - filterSchemas.chroma
['SC-starter-filter_chroma-clear-by-reference'] - filterSchemas.chromakey
['SC-starter-filter_clamp-channels'] - filterSchemas.clampChannels
['SC-starter-filter_color-curve'] - filterSchemas.curveWeights
['SC-starter-filter_copy-alpha-to-channels'] - filterSchemas.alphaToChannels
['SC-starter-filter_copy-alpha-to-luminance'] - filterSchemas.alphaToLuminance
['SC-starter-filter_copy-channels-to-alpha'] - filterSchemas.channelsToAlpha
['SC-starter-filter_copy-luminance-to-alpha'] - filterSchemas.luminanceToAlpha
['SC-starter-filter_corrode'] - filterSchemas.corrode
['SC-starter-filter_cyan-mix'] - filterSchemas.cyan
['SC-starter-filter_deconvolute'] - filterSchemas.deconvolute
['SC-starter-filter_desaturate'] - filterSchemas.grayscale
['SC-starter-filter_edge-detect'] - filterSchemas.edgeDetect
['SC-starter-filter_emboss'] - filterSchemas.emboss
['SC-starter-filter_exclude-blue-channel'] - filterSchemas.notblue
['SC-starter-filter_exclude-green-channel'] - filterSchemas.notgreen
['SC-starter-filter_exclude-red-channel'] - filterSchemas.notred
['SC-starter-filter_flood'] - filterSchemas.flood
['SC-starter-filter_gaussian-blur'] - filterSchemas.gaussianBlur
['SC-starter-filter_glitch'] - filterSchemas.glitch
['SC-starter-filter_gray-monochrome'] - filterSchemas.gray
['SC-starter-filter_green-channel'] - filterSchemas.green
['SC-starter-filter_invert-colors'] - filterSchemas.invert
['SC-starter-filter_magenta-mix'] - filterSchemas.magenta
['SC-starter-filter_map-to-gradient'] - filterSchemas.mapToGradient
['SC-starter-filter_matrix'] - filterSchemas.matrix
['SC-starter-filter_modify-ok-channels'] - filterSchemas.modifyOk
['SC-starter-filter_modulate-channels'] - filterSchemas.channels
['SC-starter-filter_modulate-ok-channels'] - filterSchemas.modulateOk
['SC-starter-filter_newsprint'] - filterSchemas.newsprint
['SC-starter-filter_offset'] - filterSchemas.offset
['SC-starter-filter_ok-negative'] - filterSchemas.negative
['SC-starter-filter_pixelate'] - filterSchemas.pixelate
['SC-starter-filter_posterize-by-step'] - filterSchemas.channelstep
['SC-starter-filter_posterize-by-value'] - filterSchemas.channelLevels
['SC-starter-filter_random-noise'] - filterSchemas.randomNoise
['SC-starter-filter_red-channel'] - filterSchemas.red
['SC-starter-filter_reduce-palette'] - filterSchemas.reducePalette
['SC-starter-filter_rotate-hue'] - filterSchemas.rotateHue
['SC-starter-filter_saturation'] - filterSchemas.saturation
['SC-starter-filter_sepia-tint'] - filterSchemas.sepia
['SC-starter-filter_set-channels-to-level'] - filterSchemas.setChannelsToLevel
['SC-starter-filter_sharpen'] - filterSchemas.sharpen
['SC-starter-filter_threshold'] - filterSchemas.threshold
['SC-starter-filter_tiles'] - filterSchemas.tiles
['SC-starter-filter_tint'] - filterSchemas.tint
['SC-starter-filter_tone-curve'] - filterSchemas.okCurveWeights
['SC-starter-filter_unsharp'] - filterSchemas.unsharp
['SC-starter-filter_yellow-mix'] - filterSchemas.yellow
['SC-starter-filter_zoom-blur'] - filterSchemas.zoomBlur
[] - filterSchemas.blend
[] - filterSchemas.compose
[] - filterSchemas.displace
[] - filterSchemas.image
[] - filterSchemas.swirl
```


## Image preview enhancement
Currently we show a portion of the image in the preview, to which the filter is applied. When moving around the image (via the minimap), or scaling it, this means the filter needs corrections to make what the user sees approximate the effect the filter will have on that area of the image. It also means that filter actions like random noise continue to show single pixel displacements when the user has zoomed in on the image.

We can fix this by having two types of image preview:
- `basic` - which is what we do now.
- `advanced` - where instead of grabbing a portion of the image for the preview, we grab the whole image and apply the filter to that; then we can move and scale the filtered Picture entity relative to the main canvas viewport.

The advantages of `advanced` is that we can cut out a lot of the view calculations, and the resulting preview will be "final download" accurate. The disadvantages are that the approach will consume a lot more memory, and we have to apply the filter to a potentially very large image - both of which could damage performance.

Giving users the ability to toggle between the image preview types will allow them to do the majority of their work in `basic` (the default preview), but then switch to `advanced` for more detailed assessment of the filter results, if required.


## User-generated filter import, and download, work
... In progress


## Image batch-processing and download
... Done


## Image file import and export
This is a piece of consideration and research work to see if we could support the import, and download, of image file formats currently not supported by browsers, for example `.tiff`, etc. 

- For this work, I'm willing to use either dedicated JS image conversion libraries, or WASM-enabled libraries (like `ffmpeg`, but lighter?) in non-JS languages, which handle this sort of conversion work well.
- Export should remain limited to browser-native formats unless a clear user need justifies adding specialist encoders.
