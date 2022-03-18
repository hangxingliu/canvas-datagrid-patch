const { chai, it } = require('./loader');
const {
  removeFromSelections,
  normalizeSelection,
  getSelectionFromString,
  cleanupSelections,
} = require('./util');

//
//
//

const { deepStrictEqual } = chai.assert;
it('test removeFromSelections', function () {
  // try to remove the horizontal line of character "H"
  const selections = [
    getSelectionFromString('cells:10,10-12,10'),
    getSelectionFromString('cells:10,12-12,12'),
    getSelectionFromString('cells:11,11'),
  ];
  const remove = getSelectionFromString('cells:11,10-11,12');
  const changed = removeFromSelections(selections, remove);
  deepStrictEqual(changed, true);
  console.log(selections);
});
