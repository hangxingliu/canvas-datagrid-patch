const { deepStrictEqual, throws, doesNotThrow } = require('assert');

let obj = createTest({});
doesNotThrow(() => obj.groupColumns('name', 'department'));
deepStrictEqual(obj.groupedColumns, [[{ from: 0, to: 1, collapsed: false }]]);

doesNotThrow(() => obj.groupColumns('job_titles', 'full_part_time'));
deepStrictEqual(obj.groupedColumns, [
  [
    { from: 0, to: 1, collapsed: false },
    { from: 2, to: 3, collapsed: false },
  ],
]);

doesNotThrow(() => obj.groupColumns('name', 'type'));
deepStrictEqual(obj.groupedColumns, [
  [{ from: 0, to: 5, collapsed: false }],
  [
    { from: 0, to: 1, collapsed: false },
    { from: 2, to: 3, collapsed: false },
  ],
]);

throws(() => obj.groupColumns('job_titles', 'salary'));
deepStrictEqual(obj.groupedColumns, [
  [{ from: 0, to: 5, collapsed: false }],
  [
    { from: 0, to: 1, collapsed: false },
    { from: 2, to: 3, collapsed: false },
  ],
]);

obj = createTest({});
doesNotThrow(() => obj.groupColumns('department', 'annual_salary'));
doesNotThrow(() => obj.groupColumns('salary', 'annual_salary'));
deepStrictEqual(obj.groupedColumns, [
  [{ from: 1, to: 7, collapsed: false }],
  [{ from: 4, to: 7, collapsed: false }],
]);

obj = createTest({});
doesNotThrow(() => obj.groupColumns('type', 'annual_salary'));
doesNotThrow(() => obj.groupColumns('name', 'job_titles'));
deepStrictEqual(obj.groupedColumns, [
  [
    { from: 0, to: 2, collapsed: false },
    { from: 5, to: 7, collapsed: false },
  ],
]);

function createTest(self) {
  self.refresh = () => {};
  self.getSchema = () => {
    return [
      { name: 'name', columnIndex: 0 },
      { name: 'department', columnIndex: 1 },
      { name: 'job_titles', columnIndex: 2 },
      { name: 'full_part_time', columnIndex: 3 },
      { name: 'salary', columnIndex: 4 },
      { name: 'type', columnIndex: 5 },
      { name: 'annual_salary', columnIndex: 7 },
      { name: 'hourly_rate', columnIndex: 8 },
    ];
  };
  if (!self.groupedColumns) self.groupedColumns = [];

  /**
   * Grouping columns
   * @memberof canvasDatagrid
   * @name groupColumns
   * @method
   * @param {number|string} firstColumnName Name of the first column to be grouped.
   * @param {number|string} lastColumnName Name of the last column to be grouped.
   */
  self.groupColumns = function (firstColumnName, lastColumnName) {
    /** @type {Array<{name: string;columnIndex:number}>} */
    const schema = self.getSchema();
    let firstOne, lastOne;
    for (let i = 0; i < schema.length; i++) {
      const it = schema[i];
      if (firstOne && lastOne) break;
      if (it.name === firstColumnName) {
        firstOne = it;
        continue;
      }
      if (it.name === lastColumnName) {
        lastOne = it;
        continue;
      }
    }
    if (!firstOne) throw new Error(`No such column name for first column`);
    if (!lastOne) throw new Error(`No such column name for last column`);
    if (lastOne.columnIndex > firstOne.columnIndex !== true)
      throw new Error(`Can't group these columns`);

    const from = firstOne.columnIndex;
    const to = lastOne.columnIndex;
    /** @type {Array<Array<{from:number,to:number,collapsed:boolean}>>} */
    const allGroups = self.groupedColumns;
    let newRow = false;
    for (let i = allGroups.length - 1; i >= 0; i--) {
      const groups = allGroups[i];
      const min = groups[0].from,
        max = groups[groups.length - 1].to;
      if (from <= min && to >= max) {
        // new group wrap this row
        continue;
      }
      for (let gi = 0; gi < groups.length; gi++) {
        const g = groups[gi];
        if (from > g.to) continue;
        if (from >= g.from) {
          if (to > g.to) throw new Error(`Can't group these columns`);
          if (to === g.to) {
            if (from === g.from) return; // nothings happened
          }
          newRow = true;
          break;
        }
        groups.splice(gi, 0, { from, to, collapsed: false });
        self.refresh();
        return;
      }
      if (newRow) continue;
      groups.push({ from, to, collapsed: false });
      self.refresh();
      return;
    }
    if (newRow) allGroups.push([{ from, to, collapsed: false }]);
    else allGroups.unshift([{ from, to, collapsed: false }]);
    self.refresh();
  };
  return self;
}
