const fs = require('fs');
const path = require('path');
const assert = require('assert');

function setup() {
  const src = path.resolve(__dirname, '../../../lib/selections/util.js');
  const dest = path.resolve(__dirname, 'util.js');
  let content = fs.readFileSync(src, 'utf8');
  content = content.replace(/export\s+\{/, 'module.exports = {');
  fs.writeFileSync(dest, content);
}

// simple implementations of chai, mocha:
const it = (title, callback) => {
  console.log(`# ${title}`);
  callback();
};
const chai = { assert };
setup();

const { SelectionType, getIntersection, addToSelections } = require('./util');

//
//
//

console.log(
  getIntersection(
    {
      type: SelectionType.Rows,
      row0: 10,
      row1: 20,
    },
    {
      type: SelectionType.Cells,
      row0: 15,
      col0: 15,
      row1: 15,
      col1: 15,
    },
  ),
);

const selections = [];
addToSelections(selections, {
  type: SelectionType.Cells,
  row1: 10,
  col1: 10,
});
addToSelections(selections, {
  type: SelectionType.Cells,
  row1: 10,
  col1: 11,
});
// [10,10,10,11]
addToSelections(selections, {
  type: SelectionType.Cells,
  row1: 10,
  col1: 12,
});
// [10,10,10,12]
addToSelections(selections, {
  type: SelectionType.SubtractCells,
  row1: 10,
  col1: 11,
});
// [10,10,10,10], [10,12,10,12]
