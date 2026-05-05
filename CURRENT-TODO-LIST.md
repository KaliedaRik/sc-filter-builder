# Current list of things todo
The list is evolving and I do not commit to doing anything in the current order

## Starter filters work and form building
Status: DONE

### Image preview
Status: DONE


## User-generated filter import, and download, work
Status: DONE


## Image batch-processing and download
Status: DONE


## Undo/redo functionality
Status: will not implement


## Image preview enhancements
Status: DONE


## Filter graph visualisation
Status: DONE


## Filter graph editing
Status: in progress

Use two new modals for this work, rather than adding (many!) "add" and "delete" buttons to the filter forms or the graph

- **Add action** - opens the add-action modal. Will be a form with two selectors. The first selector will allow the user to choose which filter action they want to add. The second selector will list existing actions, plus `[source]`, `[source-alpha]` and `[none]` (only available for `process-image` actions, where it will be the only available "after" option)

- **Remove action** - opens the remove-action modal. Will list all the current actions in the filters, with checkboxes next to each one. If selected, the selected action(s) will be removed from the filter
