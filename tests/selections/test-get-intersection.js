const { chai, it } = require('./loader');
const {
  getIntersection,
  normalizeSelection,
  getSelectionFromString,
} = require('./util');

const { deepStrictEqual } = chai.assert;
it('test getIntersection', function () {
  [
    // get intersection between rows and cells block
    ['rows:10', 'cells:15,15', undefined],
    ['rows:10-15', 'cells:15,15', 'cells:15,15'],
    ['rows:10-15', 'cells:15,15-20,20', 'cells:15,15-15,20'],

    // get intersection between columns and cells block
    ['cols:10', 'cells:15,15', undefined],
    ['cols:10-15', 'cells:15,15', 'cells:15,15'],
    ['cols:10-15', 'cells:15,15-20,20', 'cells:15,15-20,15'],

    // get intersection between cells blocks
    ['cells:15,16', 'cells:15,15', undefined],
    ['cells:15,15', 'cells:15,15', 'cells:15,15'],
    ['cells:15,15-16,16', 'cells:15,15', 'cells:15,15'],
    ['cells:15,15-20,20', 'cells:14,10-14,14', undefined],
    ['cells:15,15-20,20', 'cells:14,10-15,15', 'cells:15,15'],
    ['cells:15,15-16,16', 'cells:10,10-20,20', 'cells:15,15-16,16'],

    // get intersection between rows
    ['rows:10', 'rows:11', undefined],
    ['rows:10', 'rows:11-20', undefined],
    ['rows:10', 'rows:10', 'rows:10'],
    ['rows:10', 'rows:9-10', 'rows:10'],
    ['rows:10-20', 'rows:5-10', 'rows:10'],
    ['rows:10-20', 'rows:5-20', 'rows:10-20'],
    ['rows:10-20', 'rows:5-25', 'rows:10-20'],

    // get intersection between columns
    ['cols:10', 'cols:11', undefined],
    ['cols:10', 'cols:11-20', undefined],
    ['cols:10', 'cols:10', 'cols:10'],
    ['cols:10', 'cols:9-10', 'cols:10'],
    ['cols:10-20', 'cols:5-10', 'cols:10'],
    ['cols:10-20', 'cols:5-20', 'cols:10-20'],
    ['cols:10-20', 'cols:5-25', 'cols:10-20'],

    // get intersection between rows and columns
    ['rows:10', 'cols:11', 'cell:10,11'],
    ['rows:10', 'cols:11-12', 'cell:10,11-10,12'],
    ['rows:10-11', 'cols:11-12', 'cell:10,11-11,12'],
  ].forEach(eachTest);
  function eachTest(it) {
    const msg = `getIntersection(${JSON.stringify(it[0])}, ${JSON.stringify(
      it[1],
    )}) should be ${JSON.stringify(it[2])}`;

    const a = getSelectionFromString(it[0]) || normalizeSelection(it[0]);
    const b = getSelectionFromString(it[1]) || normalizeSelection(it[1]);
    const expected = getSelectionFromString(it[2]) || normalizeSelection(it[2]);

    const actual = getIntersection(a, b);
    // changing the order of parameters should not affect the result
    const actual2 = getIntersection(b, a);

    deepStrictEqual(actual, expected, msg);
    deepStrictEqual(actual2, expected, msg);
  }
});
