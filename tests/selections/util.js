'use strict';

// Types of Selection
// 0. Subtract cells from [row0, col0] to [row1, col1]
// 1. Add cells from [row0, col0] to [row1, col1]
// 2. Add rows from row0 to row1
// 3. Add columns from col0 to col1

const SelectionType = {
  SubtractCells: 0,
  Cells: 1,
  Rows: 2,
  Columns: 3,
};

/**
 * Add(Merge) a selection area into a selections array.
 * @returns {boolean}
 */
const addToSelections = function (selections, add) {
  // wip
};

const subtractFromSelections = function (selections, subtract) {
  // wip
};

const isRowSelected = function (selections, rowIndex) {
  // wip
};

const isColumnSelected = function (selections, columnIndex) {
  // wip
};

const isCellSelected = function (selection, rowIndex, columnIndex) {
  // wip
};

module.exports = { SelectionType, addToSelections, subtractFromSelections };
