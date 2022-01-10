/// <reference path="../../dist/types.d.ts" />

document.addEventListener('DOMContentLoaded', function main() {
  const datasourceURL = 'heart.csv';

  const grid = new canvasDatagrid({
    parentNode: document.getElementById('grid'),
    borderDragBehavior: 'move',
    allowMovingSelection: true,
    columnHeaderClickBehavior: 'none',
    allowFreezingRows: true,
    allowFreezingColumns: true,
    allowRowReordering: true,
    allowGroupingColumns: true,
    columnGroupIndicatorPosition: 'right',
    // rowGroupIndicatorPosition: 'top',
    tree: true,
    debug: false,
    showPerformance: false,
  });
  grid.style.height = '100%';
  grid.style.width = '100%';
  grid.style.treeGridHeight = 500;
  grid.addEventListener('aftercreategroup', function (ev) {
    if (ev.error) alert(ev.error);
  });
  grid.addEventListener('contextmenu', function (e) {
    e.items.push({
      title: 'Toggle position of group handler',
      click: function (ev) {
        let pos = grid.attributes.columnGroupIndicatorPosition;
        let pos2 = grid.attributes.rowGroupIndicatorPosition;
        if (pos === 'left') pos = 'right';
        else pos = 'left';
        if (pos2 === 'top') pos2 = 'bottom';
        else pos2 = 'top';
        grid.attributes.columnGroupIndicatorPosition = pos;
        grid.attributes.rowGroupIndicatorPosition = pos2;
      },
    });
  });
  window.__debugGrid = grid;
  loadDataSet();

  /**
   * Setup demo after all data loaded
   * @param {string} csv
   */
  function afterLoadedData(csv) {
    const parsed = parseData(csv);
    grid.schema = parsed.schema;
    grid.data = parsed.data; //.slice(0, 5);
    grid.groupColumns('RestingBP', 'Cholesterol');
    grid.groupColumns('Age', 'Cholesterol');
    grid.groupColumns('MaxHR', 'ST_Slope');
    grid.groupRows(1, 5);
  }
  function loadDataSet() {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('progress', function (e) {
      const status =
        'Loading data: ' +
        e.loaded +
        ' of ' +
        (e.total || 'unknown') +
        ' bytes...';
      grid.data = [{ status }];
    });
    xhr.addEventListener('load', function (e) {
      grid.data = [{ status: 'Loading data ' + e.loaded + '...' }];
      afterLoadedData(xhr.responseText);
    });
    xhr.open('GET', datasourceURL);
    xhr.send();
  }
  /**
   * @param {string} csv
   * @returns {{data:any[],schema:any[]}}
   */
  function parseData(csv) {
    const data = [];
    let schema = [];
    const rows = csv.split('\n');
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      if (!rows[rowIndex]) continue;
      const cols = rows[rowIndex].split(',');
      if (rowIndex === 0) {
        schema = cols;
        console.log(schema);
        continue;
      }
      /** @type {any} */
      const row = {};
      for (let colIndex = 0; colIndex < cols.length; colIndex++) {
        const col = cols[colIndex];
        const colName = schema[colIndex];
        row[colName] = col;
      }
      data.push(row);
    }
    const finalSchema = schema.map((it) => {
      const base = { name: it };
      if (it === 'Age' || it === 'Sex') {
        base.width = 80;
      }
      return base;
    });
    return { data, schema: finalSchema };
  }

  function expandTree(e) {
    e.treeGrid.addEventListener('expandtree', expandTree);
    e.treeGrid.attributes.columnHeaderClickBehavior = 'none';
    e.treeGrid.attributes.tree = true;
    e.treeGrid.data = grid.data;
  }
  grid.addEventListener('expandtree', expandTree);
});
