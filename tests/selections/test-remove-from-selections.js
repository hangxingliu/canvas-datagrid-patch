const { chai, it } = require('./loader');
const { removeFromSelections, getSelectionFromString } = require('./util');

//
//
//

const { deepStrictEqual } = chai.assert;
it('test removeFromSelections', function () {
  // Remove the horizontal line of character "H"
  // "H" => four independent cells
  let selections = [
    'cells:10,10-12,10',
    'cells:10,12-12,12',
    'cells:11,11',
  ].map(getSelectionFromString);
  let remove = getSelectionFromString('cells:11,10-11,12');
  let changed = removeFromSelections(selections, remove);
  deepStrictEqual(changed, true);
  deepStrictEqual(selections.length, 4);
  sortSelections(selections);
  deepStrictEqual(
    selections,
    ['cell:10,10', 'cell:10,12', 'cell:12,10', 'cell:12,12'].map(
      getSelectionFromString,
    ),
  );

  // Remove the horizontal line of character "H" but the vertical lines of the "H" are whole column
  selections = ['col:10', 'col:12', 'cells:10,10-10,12'].map(
    getSelectionFromString,
  );
  remove = getSelectionFromString('cells:10,10-10,12');
  changed = removeFromSelections(selections, remove);
  deepStrictEqual(changed, true);
  deepStrictEqual(selections.length, 3);
  sortSelections(selections);
  deepStrictEqual(
    selections,
    ['-cells:10,10-10,12', 'col:10', 'col:12'].map(getSelectionFromString),
  );
});

/** @param {any[]} selections */
function sortSelections(selections) {
  selections.sort((a, b) => {
    const v = compareRow(a, b);
    return v === 0 ? compareCol(a, b) : v;
  });
  function compareRow(a, b) {
    if (typeof a.row0 === 'number') {
      if (typeof b.row0 === 'number') {
        if (a.row0 === b.row0) return a.row1 - b.row1;
        return a.row0 - b.row0;
      }
      return -1;
    }
    if (typeof b.row0 === 'number') return 1;
    return 0;
  }
  function compareCol(a, b) {
    if (typeof a.col0 === 'number') {
      if (typeof b.col0 === 'number') {
        if (a.col0 === b.col0) return a.col1 - b.col1;
        return a.col0 - b.col0;
      }
      return -1;
    }
    if (typeof b.col0 === 'number') return 1;
    return 0;
  }
}
