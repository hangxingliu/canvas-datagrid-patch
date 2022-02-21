const { chai, it } = require('./loader');
const {
  removePartOfRowsSelection,
  removePartOfColumnsSelection,
  normalizeSelection,
  getSelectionFromString,
} = require('./util');

//
//
//

const { deepStrictEqual } = chai.assert;
it('test removePartOfRowsSelection', function () {
  [
    ['rows:0-0', 'rows:10-20', undefined],
    ['rows:10-20', 'rows:0-0', undefined],
    ['rows:0-0', 'rows:0-20', []],
    ['rows:0-0', 'rows:0-0', []],
    ['rows:10-20', 'rows:0-10', ['rows:11-20']],
    ['rows:10-20', 'rows:0-19', ['rows:20-20']],
    ['rows:10-20', 'rows:0-20', []],
    ['rows:10-20', 'rows:10-20', []],
    ['rows:10-20', 'rows:11-12', ['rows:10-10', 'rows:13-20']],
    ['rows:10-20', 'rows:11-19', ['rows:10-10', 'rows:20-20']],
  ].forEach(eachTest);
  function eachTest(args) {
    const msg = `removePartOfRowsSelection(${JSON.stringify(args[0])}, ${JSON.stringify(
      args[1],
    )}) should be ${JSON.stringify(args[2])}`;

    const a = getSelectionFromString(args[0]) || normalizeSelection(args[0]);
    const b = getSelectionFromString(args[1]) || normalizeSelection(args[1]);
    const expected = args[2]
      ? args[2].map(each => getSelectionFromString(each) || normalizeSelection(each))
      : undefined;

    const actual = removePartOfRowsSelection(a, b);
    deepStrictEqual(actual, expected, msg);
  }
});

it('test removePartOfColumnsSelection', function () {
  [
    ['cols:0-0', 'cols:10-20', undefined],
    ['cols:10-20', 'cols:0-0', undefined],
    ['cols:0-0', 'cols:0-20', []],
    ['cols:0-0', 'cols:0-0', []],
    ['cols:10-20', 'cols:0-10', ['cols:11-20']],
    ['cols:10-20', 'cols:0-19', ['cols:20-20']],
    ['cols:10-20', 'cols:0-20', []],
    ['cols:10-20', 'cols:10-20', []],
    ['cols:10-20', 'cols:11-12', ['cols:10-10', 'cols:13-20']],
    ['cols:10-20', 'cols:11-19', ['cols:10-10', 'cols:20-20']],
  ].forEach(eachTest);
  function eachTest(args) {
    const msg = `removePartOfColumnsSelection(${JSON.stringify(args[0])}, ${JSON.stringify(
      args[1],
    )}) should be ${JSON.stringify(args[2])}`;

    const a = getSelectionFromString(args[0]) || normalizeSelection(args[0]);
    const b = getSelectionFromString(args[1]) || normalizeSelection(args[1]);
    const expected = args[2]
      ? args[2].map(each => getSelectionFromString(each) || normalizeSelection(each))
      : undefined;

    const actual = removePartOfColumnsSelection(a, b);
    deepStrictEqual(actual, expected, msg);
  }
});
