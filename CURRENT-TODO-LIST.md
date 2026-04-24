# Current list of things todo
The list is evolving and I do not commit to doing anything in the current order

## Starter filters work and form building
Status: initial work complete

### Image preview
Status: initial work complete


## User-generated filter import, and download, work
Status: initial work complete


## Image batch-processing and download
Status: initial work complete

Bug: 
- We need to do additional work around process-image filter action, and possibly gradients.
- In preview, process-image pipes through the normal SC workflow, meaning the images are properly pre-processed and added to the filter engine. 
- For download, we bypass the SC workflow and invoke the filter engine directly. This means process-image actions don't get properly pre-processed. 
- This needs to be addressed/fixed


## Image preview enhancement
Status: initial work complete

Preview now comes in 2 forms

- `basic` - only the visible part of the image is filtered
  - pro: quicker; more immediate user feedback when they update any filter attribute's value
  - con: for more intense filters, navigation around the image (using the minimap) may become a little more janky, due to having to re-apply the filter whenever the view moves
  - con: we have to do additional work to manipulate area/position-influenced filters

- `accurate` - apply the filter to the whole image
  - pro: only have to update the filter when the filter or image changes; makes navigation around the image, once the filter work completes, very smooth
  - the image, when viewed, is entirely in line with what the user will see when they process/download images
  - con: user may experience one-off multi-second page freezes as they update filter attributes, change image, etc

Further work:
- review all filters and identify any which are affected by filter incorrectness in basic preview, due to affect offsets, filter origin position, etc
- fix issues where we can; note issues where such a fix is unrealistic for basic view (eg: matrix-based filters; pixel-based displacements such as random-moise, etc)

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



