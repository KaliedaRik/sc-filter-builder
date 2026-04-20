# Current list of things todo
The list is evolving and I do not commit to doing anything in the current order

## Starter filters work and form building
... Initial work done

### Image preview
... Done


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

## Filter construction
The last major piece of work will be around user-driven filter construction and experimentation. The Use Case is as follows:

- User selects a starter filter on which they want to build their own filter
- The filter actions display in the filter builder area at the bottom of the page
- on the left hand side, two boxes:
  - "source"
  - "source-alpha"
- On the right hand side a single box - "output"
- In the middle, the element blocks for each filter action display
  - Blocks are wired up appropriately with lines moving from each block's "lineOut" area to the filter action which accepts the results of the block for further processing ("lineIn", "lineMix")
- Users have the ability to quickly remove a filter action from the graph
  - Would be nice for the graph to self-heal after an action's removal
- Users have the ability to quickly add additional filter actions to the graph 
  - Again, would be nice if the graph could self-heal (as far as posssible) following the insertion of a new action
- Filter action boxes can be dragged around the graph area
- Each filter action get's manipulated in its own set of controls in the right hand panel
- Live (near-real-time) updates to graph manipulations
- Extra? Need to address Undo/Redo functionality



