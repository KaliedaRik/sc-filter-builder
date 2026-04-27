# Current list of things todo
The list is evolving and I do not commit to doing anything in the current order

## Starter filters work and form building
Status: DONE

### Image preview
Status: initial work for basic preview DONE


## User-generated filter import, and download, work
Status: DONE


## Image batch-processing and download
Status: DONE


## Undo/redo functionality
Status: will not implement

**Work to do:** remove all code associated with undo/redo, filter ordering, etc

Defending the decision: I don't see any good reason to implement this for an MVP of the tool. The system has turned out to be more complex than I was expecting, with lots of interlocking moving parts - form building, attribute tracking, etc - this isn't a "layer based" filter system. And the use case is quite simple: 
- select (or import-then-select) a filter
- import some images for processing
- tweak some of the filter parameters
  - signalling to user that filter has been modified, in case they want to download it for future use
- batch-process and download the filtered images


## Image preview enhancements
Status: initial work for accurate preview DONE

Further work:
- review all filters and identify any which are affected by filter incorrectness in basic preview, due to offset/origin-sensitive effects, filter origin position, etc
- fix issues where we can; note issues where such a fix is unrealistic for basic view (eg: matrix-based filters; pixel-based displacements such as random-noise, etc)


## Filter graph visualisation
Status: not started

Read the current filter action list and render it as a connected graph. Initial version is view-only, except for node dragging.


## Filter graph editing
Status: not started

Add/delete filter actions from either the forms panel or graph. MVP editing is constrained: actions can generally be inserted only after existing actions, with exceptions for SOURCE, SOURCE_ALPHA, and process-image actions.
