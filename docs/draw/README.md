# How the Grid be Draw

Most rendering codes of this component are located in `lib/draw.js`.   
If you are the first time to read this file,
you can start reading this file from the line, which defines function `self.draw`.
(Find it by searching `self.draw =` in your editor)

The codes in `self.draw` function are the rendering process.
And there are many util functions above this function.

You can see this function contains more than 2000 lines in your editor,
and it has many inner functions.

In order to understand and appreciate it. You can search `initDraw();` in your editor
to find the beginning of the core flow.
You will see the codes of core flow like these:

``` javascript
self.ctx.save();
initDraw();
drawBackground();
initGroupArea();
drawFrozenRows();
drawRows();
drawActiveCell();
drawHeaders();
drawFrozenMarkers();
drawSelectionHandles();
drawReorderMarkers();
drawMoveMarkers();
drawBorder();
drawSelectionBorders();
drawScrollBars();
if (checkScrollHeight) {
  self.resize(true);
}
drawGroupArea();
drawDebug();
drawPerfLines();
if (self.dispatchEvent('afterdraw', {})) {
  return;
}
self.ctx.restore();
```

This document will explain this flow in the following sections.

# initDraw

The codes in `initDraw` and the codes before are used for these purposes: 

- Trigger `beforedraw` event.
- Check for no need to draw.
- Initialize variables.

> Because many developers maintained this project, there are two parts initializing codes in `self.draw`.
> - First part is followed the `self.draw = function (internal) {` closely 
> - Second part is the inner function `initDraw`

There are explaining for some important variables:

`visibleRows`, `visibleCells`, `visibleGroups`, `visibleUnhideIndicators`:   
These variables are used for storing the information of the latest rendering.  
This information contains coordinates, indexes and other meta information.  
And they are useful for event handlers and public methods. For example, the event handler can know what item user clicked by searching from them by mouse event coordinates.

`currentRowIndexOffset`, `rowIndexOffsetByHiddenRows`:   
These variables are used for correcting the titles of row headers if there are any hidden rows.   
You will see how they work in the inner function `drawRowHeader`.

## Preparatory knowledge for the following inner functions

### Various indexes

In this component, there are various indexes, which indicate the column and the row.
And it is easy to confuse them. Here is the explanation for some common index variables:

`columnIndex`, the original index of the schema. You can use it as the subscript to access `self.schema`   
**But it has an exception**, the property called `columnIndex` in each item of the array `self.visibleCells` 
is actually a `columnOrderIndex`.    
(You can search `columnIndex: columnOrderIndex,` in your editor to find it)

`columnOrderIndex`, also named `viewColumnIndex`, 

`rowIndex`,

`boundRowIndex`,


