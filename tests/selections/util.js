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

const swapProps = (obj, prop0, prop1) => {
  const t = obj[prop0];
  obj[prop0] = obj[prop1];
  obj[prop1] = t;
};
const normalizeSelection = (sel) => {
  if (!sel) return sel;
  switch (sel.type) {
    case SelectionType.SubtractCells:
    case SelectionType.Cells:
      if (typeof sel.row1 !== 'number') sel.row1 = sel.row0;
      else if (sel.row1 < sel.row0) swapProps(sel, 'row0', 'row1');

      if (typeof sel.col1 !== 'number') sel.col1 = sel.col0;
      else if (sel.col1 < sel.col0) swapProps(sel, 'col0', 'col1');

      break;
    case SelectionType.Rows:
      if (typeof sel.row1 !== 'number') sel.row1 = sel.row0;
      else if (sel.row1 < sel.row0) swapProps(sel, 'row0', 'row1');

      break;
    case SelectionType.Columns:
      if (typeof sel.col1 !== 'number') sel.col1 = sel.col0;
      else if (sel.col1 < sel.col0) swapProps(sel, 'col0', 'col1');

      break;
  }
  return sel;
};

const getSelectionFromString = (str) => {
  if (typeof str !== 'string') return;

  const index = str.indexOf(':');
  if (index < 0) return;

  const type = str.slice(0, index);
  const num = str
    .slice(index + 1)
    .split(/[,:;-]+/)
    .map((it) => parseInt(it, 10));
  switch (type) {
    case 'cell':
    case 'cells':
    case '-cell':
    case '-cells':
      return normalizeSelection({
        type: SelectionType.Cells,
        row0: num[0],
        col0: num[1],
        row1: num[2],
        col1: num[3],
      });
    case 'row':
    case 'rows':
      return normalizeSelection({
        type: SelectionType.Rows,
        row0: num[0],
        row1: num[1],
      });
    case 'col':
    case 'cols':
      return normalizeSelection({
        type: SelectionType.Columns,
        col0: num[0],
        col1: num[1],
      });
  }
};

const getIntersection = (a, b) => {
  if (a.type > b.type) return getIntersection(b, a);
  if (a.type <= SelectionType.Cells) {
    if (b.type <= SelectionType.Cells) {
      const col0 = Math.max(a.col0, b.col0);
      const col1 = Math.min(a.col1, b.col1);
      if (col0 > col1) return;

      const row0 = Math.max(a.row0, b.row0);
      const row1 = Math.min(a.row1, b.row1);
      if (row0 > row1) return;

      return { type: SelectionType.Cells, row0, col0, row1, col1 };
    }
    if (b.type === SelectionType.Rows) {
      const row0 = Math.max(a.row0, b.row0);
      const row1 = Math.min(a.row1, b.row1);
      if (row0 > row1) return;
      return {
        type: SelectionType.Cells,
        row0,
        col0: a.col0,
        row1,
        col1: a.col1,
      };
    } else {
      // SelectionType.Columns
      const col0 = Math.max(a.col0, b.col0);
      const col1 = Math.min(a.col1, b.col1);
      if (col0 > col1) return;
      return {
        type: SelectionType.Cells,
        col0,
        row0: a.row0,
        col1,
        row1: a.row1,
      };
    }
  }
  if (a.type === SelectionType.Rows) {
    if (b.type === SelectionType.Rows) {
      const row0 = Math.max(a.row0, b.row0);
      const row1 = Math.min(a.row1, b.row1);
      if (row0 > row1) return;
      return { type: SelectionType.Rows, row0, row1 };
    } else {
      // SelectionType.Columns
      return {
        type: SelectionType.Cells,
        row0: a.row0,
        col0: b.col0,
        row1: a.row1,
        col1: b.col1,
      };
    }
  }
  // SelectionType.Columns
  const col0 = Math.max(a.col0, b.col0);
  const col1 = Math.min(a.col1, b.col1);
  if (col0 > col1) return;
  return { type: SelectionType.Columns, col0, col1 };
};

/**
 * Add(Merge) a selection area into a selections array.
 * @param {array} selections
 * @returns {boolean} are selections changed
 */
const addToSelections = function (selections, add) {
  if (!add || typeof add.type !== 'number') return false;
  switch (add.type) {
    case SelectionType.SubtractCells:
      if (selections.length === 0) return false;
      selections.unshift(add);
      return true;
  }
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

module.exports = {
  SelectionType,
  getSelectionFromString,
  normalizeSelection,
  addToSelections,
  subtractFromSelections,
  getIntersection,
};
