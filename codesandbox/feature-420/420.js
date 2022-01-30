/// <reference path="../../dist/types.d.ts" />

document.addEventListener('DOMContentLoaded', function main() {
  const datasourceURL = 'heart.csv';

  const grid = new canvasDatagrid({
    parentNode: document.getElementById('grid'),
    borderDragBehavior: 'move',
    allowMovingSelection: true,
    // columnHeaderClickBehavior: 'none',
    allowFreezingRows: true,
    allowFreezingColumns: true,
    allowRowReordering: true,
    allowColumnReordering: true,
    allowGroupingColumns: true,
    debug: false,
    showPerformance: false,
    showUnhideColumnsIndicator: true,
    showUnhideRowsIndicator: true,
  });
  grid.style.height = '100%';
  grid.style.width = '100%';
  grid.style.columnHeaderCellHorizontalAlignment = 'center';
  window.__debugGrid = grid;
  loadDataSet();

  /**
   * Setup demo after all data loaded
   * @param {string} csv
   */
  function afterLoadedData(csv) {
    const parsed = parseData(csv);
    parsed.schema[1].hidden = true;
    parsed.schema[2].hidden = true;
    grid.schema = parsed.schema;
    grid.data = parsed.data.slice(0, 20);
    grid.hideRows(3, 5);
    grid.hideRows(10, 15);
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
        schema = schema.map((it, index) => `C${index}`);
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
      if (it === 'C0' || it === 'C1') {
        base.width = 80;
      }
      return base;
    });
    return { data, schema: finalSchema };
  }
});
