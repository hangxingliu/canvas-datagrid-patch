# Ability to hide rows/cols (#420)

<https://github.com/TonyGermaneri/canvas-datagrid/issues/420>

## New components in the grid

Add indicator(icon) named `UnhideIndicator` on column headers and row headers,
It looks like:

In normal status:  
![](./unhide-indicator-1.png)

In hover status:   
![](./unhide-indicator-2.png)

## New attributes

`showUnhideColumnsIndicator` and `showUnhideRowsIndicator`:

These two attributes are used to control the visibility of the `UnhideIndicator`.
Their default values are `false` because we need to ensure that there are no inexplicable icon will appear after some users upgrade this component from the old version.

`showHideRow` and `showHideRows`:

These two attributes are the titles of the context menu item used to hide row/rows.

## New styles

- `unhideIndicatorColor`: the foreground color of the indicator
- `unhideIndicatorBackgroundColor`: the background color of the indicator in hover status
- `unhideIndicatorBorderColor`: the border color of the indicator in hover status 
- `unhideIndicatorSize`: the indicator size (unit: px). this value represents the height/width of the indicator rectangle.

## New context menu

- `Hide columns {}-{}`: when users select contiguous columns and trigger the context menu on column headers.
- `Hide rows {}-{}`: when users select contiguous rows and trigger the context menu on row headers.

## The behavior of the unhide indicator 

Because the text of the column header may collide with the unhide icon,
there are two behaviors for unhide indicators on column headers.

1. In normal status, This component doesn't render the indicator if the left/right space is not enough for rendering the indicator. otherwise, render it. (enough space here represents the space equals or more than `unhideIndicatorSize`)
2. In hove status, this component always renders the indicator on the top level of the cell. And the indicator in this status has light background and border, so it looks like an overlap of the cell.

## Under the hood

Add new property `hiddenRowRanges` to store the hidden rows. 
It is a tuple array, and each item is a tuple containing two rowIndex numbers.
These two numbers represent a closed interval.

This new property `hiddenRowRanges` affects the view data
 by new codes in the function `getFilteredAndSortedViewData`.
The hidden rows will be removed from view data before applying column filters.  
In this step, we keep the bound row indexes. 
For example, if there are hidden rows from `3` to `5`, 
the `newViewData` will be looks like the following code snippet after this step:

```
[
  [{...}}, 0],
  [{...}}, 1],
  [{...}}, 2],
  [{...}}, 6],
  [{...}}, 7],
  ...
]
```

And the logic of rendering the row header in `draw.js` renders the `boundRowIndex`(or named `filteredRowNumber`) when there are any filters or groups. Otherwise, it renders the `rowIndex` as row header text.
So we need to maintain an array containing row index offset for the hidden rows to keep the header looking like hidden rows exist.   
This array is `rowIndexOffsetByHiddenRows` in the `draw.js`. And we maintain a value named `currentRowIndexOffset` to avoid querying this array every time rendering the cell.
And we will do numerical addition on the row header title with `currentRowIndexOffset` if we render the `rowIndex` as the title.


Add new codes in functions around rendering to check is their any contiguous hidden columns/rows. If there have, render an indicator on the related area and save the rectangle coords info of it to `visibleUnhideIndicators`.
