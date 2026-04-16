# Current list of things todo
The list is evolving and I do not commit to doing anything in the current order

## Starter filters work and form building
Create packets for the following filters

- [] filterSchemas.blend
- [] filterSchemas.compose
- [] filterSchemas.displace
- [] filterSchemas.image
- [] filterSchemas.swirl

For `blend` and `compose`, we just need to create the form builder object.

For `swirl` we need to build a new form component - a swirl filter can include an array of swirls, each of which will need to be separately editabe.

For `displace`, I think this will be the same story as for blend/compose (2 inputs)

For `image`, we need to do some work in the forms to allow the user to select an image. 
- When it comes to saving/downloading filters which depend an upstream `image`, we need to figure out a way to serialise the image (no reliance on URLs)
- When it comes to importing and using such a filter, we need to do work to get the image into SC as an asset

### Image preview
We need to do further work to make the preview more realistic, particularly when the user zooms the viewport
- area-alpha currently does not shift areas as user navigates over image
- gaussian-blur - theres a case to make the steps in the range input smaller (0.1) and maybe limit the upper bound for this tool. Also: how to zoom the blur?
- etc


## User-generated filter import, and download, work
... Done


## Image batch-processing and download
... Done


## Image preview enhancement
Currently we show a portion of the image in the preview, to which the filter is applied. When moving around the image (via the minimap), or scaling it, this means the filter needs corrections to make what the user sees approximate the effect the filter will have on that area of the image. It also means that filter actions like random noise continue to show single pixel displacements when the user has zoomed in on the image.

We can fix this by having two types of image preview:
- `basic` - which is what we do now.
- `advanced` - where instead of grabbing a portion of the image for the preview, we grab the whole image and apply the filter to that; then we can move and scale the filtered Picture entity relative to the main canvas viewport.

The advantages of `advanced` is that we can cut out a lot of the view calculations, and the resulting preview will be "final download" accurate. The disadvantages are that the approach will consume a lot more memory, and we have to apply the filter to a potentially very large image - both of which could damage performance.

Giving users the ability to toggle between the image preview types will allow them to do the majority of their work in `basic` (the default preview), but then switch to `advanced` for more detailed assessment of the filter results, if required.


## Image file import and export
This is a piece of consideration and research work to see if we could support the import, and download, of image file formats currently not supported by browsers, for example `.tiff`, etc. 

- For this work, I'm willing to use either dedicated JS image conversion libraries, or WASM-enabled libraries (like `ffmpeg`, but lighter?) in non-JS languages, which handle this sort of conversion work well.
- Export should remain limited to browser-native formats unless a clear user need justifies adding specialist encoders.
