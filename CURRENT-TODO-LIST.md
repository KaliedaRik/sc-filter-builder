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


## Image preview enhancements
Status: DONE

Further work:
- fix issues where we can; note issues where such a fix is unrealistic for basic view (eg: matrix-based filters; pixel-based displacements such as random-noise, etc)


## Filter graph visualisation
Status: not started

Read the current filter action list and render it as a connected graph. Initial version is view-only, except for node dragging.


## Filter graph editing
Status: not started

Add/delete filter actions from either the forms panel or graph. MVP editing is constrained: actions can generally be inserted only after existing actions, with exceptions for SOURCE, SOURCE_ALPHA, and process-image actions.
