const { chai, it } = require('./loader');
const {
  concatSelections,
  normalizeSelection,
  getSelectionFromString,
} = require('./util');

//
//
//

const { deepStrictEqual } = chai.assert;
it('test concatSelections', function () {
  [
    // their types are not the same
    ['rows:10', 'cells:15,15', undefined],
    ['rows:10', 'cols:10', undefined],
    ['cols:10', 'cells:0,0-999999999,999999999', undefined],

    // they are not neighbor
    ['rows:10', 'rows:12', undefined],
    ['rows:0-9999', 'rows:99999-100000', undefined],
    ['cols:10', 'cols:12', undefined],
    ['cols:0-9999', 'cols:99999-100000', undefined],
    ['cells:0,0-10,10', 'cells:15,15-20,20', undefined],
    ['cells:0,0-10,10', 'cells:0,15-10,20', undefined],

    ['cells:10,10-20,20', 'cells:5,25-10,25', undefined],

    // they are the same selection
    ['rows:10', 'rows:10', 'rows:10'],
    ['rows:10-20', 'rows:10-20', 'rows:10-20'],
    ['cols:10', 'cols:10', 'cols:10'],
    ['cols:10-20', 'cols:10-20', 'cols:10-20'],
    ['cells:10,20', 'cells:10,20', 'cells:10,20'],
    ['cells:10,20-10,25', 'cells:10,20-10,25', 'cells:10,20-10,25'],

    // rows concatenate
    ['rows:10', 'rows:11', 'rows:10-11'],
    ['rows:10-15', 'rows:13-20', 'rows:10-20'],

    // columns concatenate
    ['cols:10', 'cols:11', 'cols:10-11'],
    ['cols:10-15', 'cols:13-20', 'cols:10-20'],

    // cells blocks concatenate
    ['cells:0,0-10,10', 'cells:5,5-10,10', 'cells:0,0-10,10'],
    ['cells:0,0-10,10', 'cells:10,5-10,10', 'cells:0,0-10,10'],
    ['cells:0,0-10,10', 'cells:5,10-10,10', 'cells:0,0-10,10'],
    ['cells:0,0-10,10', 'cells:0,10-10,20', 'cells:0,0-10,20'],
  ].forEach(eachTest);
  function eachTest(it) {
    const msg = `concatSelections(${JSON.stringify(it[0])}, ${JSON.stringify(
      it[1],
    )}) should be ${JSON.stringify(it[2])}`;

    const a = getSelectionFromString(it[0]) || normalizeSelection(it[0]);
    const b = getSelectionFromString(it[1]) || normalizeSelection(it[1]);
    const expected = getSelectionFromString(it[2]) || normalizeSelection(it[2]);

    const actual = concatSelections(a, b);
    // changing the order of parameters should not affect the result
    const actual2 = concatSelections(b, a);

    deepStrictEqual(actual, expected, msg);
    deepStrictEqual(actual2, expected, msg);
  }
});
