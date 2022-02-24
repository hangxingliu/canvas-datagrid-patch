'use strict';

import {
  addIntoSelections,
  SelectionType,
  isCellSelected,
  normalizeSelection,
  areCellsSelected,
  removeFromSelections,
  isColumnSelected,
  isRowSelected,
} from './module.js';

(function main() {
  const blockSize = 70;
  const halfBlockSize = blockSize * 0.5;
  const headerSize = 50;
  const selections = [];
  const selectionColors = [
    '#629aa9',
    '#0085ad',
    '#4298b5',
    '#005670',
    '#0099cc',
    '#0c3866',
    '#007cc0',
    '#003666',
    '#4d4f53',
    '#007fdb',
    '#013ca6',
    '#0066a1',
    '#16214d',
  ];

  /** @type {HTMLCanvasElement} */
  const canvas = document.querySelector('#canvas');

  let baseRow = 0;
  let baseCol = 0;
  let baseX = 0;
  let baseY = 0;
  let offsetX = 0;
  let offsetY = 0;

  let timer;
  window.addEventListener(
    'resize',
    () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(render, 15);
    },
    false,
  );

  let ratio;
  let _selectingCells, selectingCells;
  let _selectingCols, selectingCols;
  let _selectingRows, selectingRows;
  const getColFromX = (x) =>
    Math.min(Math.floor((x - headerSize + offsetX) / blockSize)) + baseCol;
  const getRowFromY = (y) =>
    Math.min(Math.floor((y - headerSize + offsetY) / blockSize)) + baseRow;

  document.addEventListener('keydown', (ev) => {
    if (!ev) return;
    // console.log(ev.keyCode)
    if (ev.keyCode === 84) {
      // 't'
      let min = 0;
      let max = 1000;
      let maxSize = 10;
      const random = () => min + Math.floor(Math.random() * (max - min));
      const randomSize = () => Math.floor(Math.random() * maxSize);
      const execute = () => {
        let v = random();
        addIntoSelections(
          selections,
          normalizeSelection({
            type: SelectionType.Rows,
            row0: v,
            row1: v + randomSize(),
          }),
        );
        v = random();
        addIntoSelections(
          selections,
          normalizeSelection({
            type: SelectionType.Columns,
            col0: v,
            col1: v + randomSize(),
          }),
        );
        v = random();
        let v2 = random();
        addIntoSelections(
          selections,
          normalizeSelection({
            type: SelectionType.Cells,
            col0: v,
            col1: v2,
            row0: v + randomSize(),
            row1: v2 + randomSize(),
          }),
        );
      };
      for (let i = 0; i < 2; i++) execute();

      min = 1001; max = 10000;
      for (let i = 0; i < 5; i++) execute();

      min = 10001; max = 1000000;
      for (let i = 0; i < 10; i++) execute();

      min = 1000001; max = 100000000;
      for (let i = 0; i < 20; i++) execute();

      render();
      return;
    }
    if (ev.keyCode === 71) {
      // 'g'
      const _go = prompt('Goto: row,col (Eg:100,200)', '');
      if (!_go) return;
      const go = _go.split(/[,;-]+/).map((it) => parseInt(it, 10));
      if (go[0] >= 0 && go[1] >= 0) {
        baseRow = go[0];
        baseCol = go[1];
        baseX = baseCol * blockSize;
        baseY = baseRow * blockSize;
        offsetX = 0;
        offsetY = 0;
        render();
        return;
      }
    }
    if (ev.keyCode === 27) {
      _selectingCells = null;
      _selectingCols = null;
      _selectingRows = null;
      selectingCells = null;
      selectingCols = null;
      selectingRows = null;
      render();
    }
  });
  canvas.addEventListener('wheel', (ev) => {
    let deltaX = ev.deltaX;
    let deltaY = ev.deltaY;
    if (ev.deltaMode === 1) {
      // line mode = 17 pixels per line
      deltaY *= 17;
    }
    baseX += deltaX;
    baseY += deltaY;
    if (baseX < 0) baseX = 0;
    if (baseY < 0) baseY = 0;
    baseCol = Math.floor(baseX / blockSize);
    baseRow = Math.floor(baseY / blockSize);
    offsetX = baseX - baseCol * blockSize;
    offsetY = baseY - baseRow * blockSize;
    render();
  });
  canvas.addEventListener('mousedown', (ev) => {
    if (ev.y > headerSize) {
      if (ev.x > headerSize) {
        _selectingCells = normalizeSelection({
          type: SelectionType.Cells,
          col0: getColFromX(ev.x),
          row0: getRowFromY(ev.y),
        });
        selectingCells = _selectingCells;
      } else {
        _selectingRows = normalizeSelection({
          type: SelectionType.Rows,
          row0: getRowFromY(ev.y),
        });
        selectingRows = _selectingRows;
      }
    } else if (ev.x > headerSize) {
      _selectingCols = normalizeSelection({
        type: SelectionType.Columns,
        col0: getColFromX(ev.x),
      });
      selectingCols = _selectingCols;
    }
    render();
  });
  canvas.addEventListener('mousemove', (ev) => {
    if (_selectingCells) {
      selectingCells = normalizeSelection(
        Object.assign({}, _selectingCells, {
          col1: getColFromX(ev.x),
          row1: getRowFromY(ev.y),
        }),
      );
      render();
    } else if (_selectingCols) {
      selectingCols = normalizeSelection(
        Object.assign({}, _selectingCols, {
          col1: getColFromX(ev.x),
        }),
      );
      render();
    } else if (_selectingRows) {
      selectingRows = normalizeSelection(
        Object.assign({}, _selectingRows, {
          row1: getRowFromY(ev.y),
        }),
      );
      render();
    }
  });
  canvas.addEventListener('mouseup', (ev) => {
    if (selectingCells) {
      const { row0, col0, row1, col1 } = selectingCells;
      const subSelection = areCellsSelected(selections, row0, col0, row1, col1);
      if (subSelection === true) {
        removeFromSelections(selections, selectingCells);
      } else {
        addIntoSelections(selections, selectingCells);
      }
    } else if (selectingCols) {
      let unselect = true;
      for (let i = selectingCols.col0; i <= selectingCols.col1; i++) {
        if (!isColumnSelected(selections, i)) {
          unselect = false;
          break;
        }
      }
      if (unselect) {
        removeFromSelections(selections, selectingCols);
      } else {
        addIntoSelections(selections, selectingCols);
      }
    } else if (selectingRows) {
      let unselect = true;
      for (let i = selectingRows.row0; i <= selectingRows.row1; i++) {
        if (!isRowSelected(selections, i)) {
          unselect = false;
          break;
        }
      }
      if (unselect) {
        removeFromSelections(selections, selectingRows);
      } else {
        addIntoSelections(selections, selectingRows);
      }
    }
    _selectingCells = null;
    _selectingCols = null;
    _selectingRows = null;
    selectingCells = null;
    selectingCols = null;
    selectingRows = null;
    render();
  });

  render();
  function render() {
    const startAt = performance.now();
    timer = -1;
    // console.log(baseX, baseY);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d', { alpha: false });
    ratio =
      (window.devicePixelRatio || 1) /
      (ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio ||
        1);
    ctx.scale(ratio, ratio);
    ctx.fillStyle = '#f3f4f7';
    fillRect(0, 0, w, h);

    ctx.strokeStyle = '#52565e';
    ctx.lineWidth = 1;
    let x = headerSize,
      y = headerSize;

    const tmpSelect = [selectingCells, selectingCols, selectingRows].filter(
      (it) => it,
    );
    const maxRows = Math.ceil(h / blockSize) + 3;
    const maxCols = Math.ceil(w / blockSize) + 3;
    const sel = areCellsSelected(
      selections,
      baseRow,
      baseCol,
      baseRow + maxRows,
      baseCol + maxCols,
      true,
    );
    const unselectedBlocks = selections.filter(
      (it) => it.type === SelectionType.UnselectedCells,
    );
    for (let _row = 0; _row <= maxRows; _row++) {
      const row = baseRow + _row;
      const dy = y - offsetY;
      for (let _col = 0; _col <= maxCols; _col++) {
        const col = baseCol + _col;
        const dx = x - offsetX;
        let tmpSelected = isCellSelected(tmpSelect, row, col);
        if (tmpSelected) {
          ctx.fillStyle = '#74d2e7';
          fillRect(dx, dy, blockSize, blockSize);
        } else if (sel[_row] && sel[_row][_col]) {
          const selValue = sel[_row][_col];
          ctx.fillStyle = selectionColors[selValue % selectionColors.length];
          fillRect(dx, dy, blockSize, blockSize);
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          fillText(`${selValue}`, dx + halfBlockSize, dy + halfBlockSize);
        }
        strokeRect(dx, dy, blockSize, blockSize);

        const isUnselected = unselectedBlocks.findIndex(
          (it) =>
            row >= it.row0 &&
            row <= it.row1 &&
            col >= it.col0 &&
            col <= it.col1,
        );
        if (isUnselected >= 0) {
          ctx.fillStyle = '#e4002b';
          ctx.textAlign = 'left';
          fillText(`${isUnselected + 1}`, dx + 2, dy + 20);
        }
        x += blockSize;
      }
      x = headerSize;
      y += blockSize;
    }

    // draw headers
    ctx.fillStyle = '#CDE2E7';
    fillRect(0, 0, w, headerSize);
    fillRect(0, 0, headerSize, h);

    // column headers
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.font = `${15 / ratio}px monospace`;
    for (let col = 0; col <= maxCols; col++)
      fillText(
        `${col + baseCol}`,
        headerSize + col * blockSize + halfBlockSize - offsetX,
        headerSize * 0.5,
      );
    for (let row = 0; row <= maxRows; row++)
      fillText(
        `${row + baseRow}`,
        headerSize * 0.5,
        headerSize + row * blockSize + halfBlockSize - offsetY,
      );

    // draw debug info
    ctx.fillStyle = '#f6f6f5dd';
    fillRect(0, 0, 200, 350);

    ctx.textAlign = 'left';
    const textSize = 12;
    ctx.font = `${textSize / ratio}px monospace`;
    for (let i = 0; i < selections.length; i++) {
      const sel = selections[i];
      let prefix = 'unknown:';
      ctx.fillStyle = '#000000';
      switch (sel.type) {
        case SelectionType.Cells:
          prefix = 'cells: ';
          break;
        case SelectionType.UnselectedCells:
          prefix = '-cells: ';
          ctx.fillStyle = '#e4002b'; // red
          break;
        case SelectionType.Rows:
          prefix = 'rows: ';
          break;
        case SelectionType.Columns:
          prefix = 'cols: ';
          break;
      }
      const content = [];
      if (typeof sel.row0 === 'number') content.push(sel.row0);
      if (typeof sel.col0 === 'number') content.push(sel.col0);
      if (typeof sel.row1 === 'number') content.push(sel.row1);
      if (typeof sel.col1 === 'number') content.push(sel.col1);
      fillText(
        `[${i + 1}] ${prefix}${content.join(',')}`,
        2,
        textSize * (i + 4),
      );
    }

    ctx.fillStyle = '#000';
    fillText('"g" for goto', 2, textSize * 2);
    fillText('"t" for a lot of selection', 2, textSize * 3);

    const elapsed = (performance.now() - startAt).toFixed(2) + ' ms';
    ctx.fillStyle = '#009f4d';
    fillText(elapsed, 2, textSize);
    timer = 0;

    function fillRect(x, y, w, h) {
      ctx.fillRect(x / ratio, y / ratio, w / ratio, h / ratio);
    }
    function strokeRect(x, y, w, h) {
      ctx.strokeRect(x / ratio, y / ratio, w / ratio, h / ratio);
    }
    function fillText(text, x, y) {
      ctx.fillText(text, x / ratio, y / ratio);
    }
  }
})();
