//@ts-check
'use strict';

import {
  addIntoSelections,
  SelectionType,
  isCellSelected,
  normalizeSelection,
  getVerboseSelectionStateFromCells,
  removeFromSelections,
  isColumnSelected,
  isRowSelected,
  getSelectionStateFromCells,
} from './module.js';

(function main() {
  const updatedAt = '2022-02-28';
  let diagnosis = '';
  const getHelp = (elapsed, renderInfo) =>
    [
      ['#009f4d', `${elapsed}ms (${renderInfo})`],
      ['#009f4d', diagnosis],
      ['#000', `Updated at: ${updatedAt}`],
      ['#7fbb00', ` "g": goto cell`],
      ['#7fbb00', ` "s": toggle selection id`],
      ['#7fbb00', ` "t": add a lot of selection`],
      ['#7fbb00', ` "+/=": zoom in`],
      ['#7fbb00', ` "-/_": zoom out`],
    ].filter((it) => it[1]);

  const headerSize = 50;
  const blockSizings = [10, 30, 50, 70, 90, 120, 200, 500, 1000, 2000];
  let blockSizingPtr = blockSizings.indexOf(70);
  let blockWidth = 0,
    blockHeight = 0;
  const calcBlockSize = () => {
    blockWidth = blockSizings[blockSizingPtr];
    blockHeight = blockSizings[blockSizingPtr];
  };
  const zoomIn = () => {
    if (blockSizingPtr < blockSizings.length - 1) {
      blockSizingPtr++;
      calcBlockSize();
    }
  };
  const zoomOut = () => {
    if (blockSizingPtr > 0) {
      blockSizingPtr--;
      calcBlockSize();
    }
  };
  calcBlockSize();

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
  /** @type {HTMLDivElement} */
  const loading = document.querySelector('#loading');
  /** @type {CanvasRenderingContext2D} */
  let ctx;
  /** @type {number} */
  let canvasRatio;
  /** @type {number} 1/canvasRatio */
  let canvasMultiInverseRatio;
  let isRendering = false;
  let renderTimer;
  let isProcssingKey = false;
  let _render = _renderWithSelectionId;

  let baseRow = 0;
  let baseCol = 0;
  let baseX = 0;
  let baseY = 0;
  let offsetX = 0;
  let offsetY = 0;
  window.addEventListener('resize', render, false);

  /** @type {{row:number;col:number}} */
  let hoverCell;
  let _selecting, selecting;

  /** @param {number} x */
  const getColFromX = (x) =>
    Math.min(Math.floor((x - headerSize + offsetX) / blockWidth)) + baseCol;

  /** @param {number} y */
  const getRowFromY = (y) =>
    Math.min(Math.floor((y - headerSize + offsetY) / blockHeight)) + baseRow;

  document.addEventListener('keydown', (ev) => {
    if (!ev) return;
    console.log('keydown:', ev.keyCode);
    if (isProcssingKey) return;
    isProcssingKey = true;
    try {
      switch (ev.keyCode) {
        case 83: // 's'
          _render =
            _render === _renderWithSelectionId
              ? _renderWithoutSelectionId
              : _renderWithSelectionId;
          render();
          break;
        case 189: // '-'
          zoomOut();
          render();
          break;
        case 187: // '+'
          zoomIn();
          render();
          break;
        case 84: // 't'
          addRandomSelections();
          break;
        case 71: {
          // 'g'
          const _go = prompt('Goto: row,col (Eg:100,200)', '');
          if (!_go) break;
          const go = _go.split(/[,;-]+/).map((it) => parseInt(it, 10));
          if (go[0] >= 0 && go[1] >= 0) {
            baseRow = go[0];
            baseCol = go[1];
            baseX = baseCol * blockWidth;
            baseY = baseRow * blockHeight;
            offsetX = 0;
            offsetY = 0;
            render();
            break;
          }
        }
        case 27: // ESC
          _selecting = null;
          selecting = null;
          render();
          break;
      }
    } catch (error) {
      console.error(error);
    }
    isProcssingKey = false;
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
    baseCol = Math.floor(baseX / blockWidth);
    baseRow = Math.floor(baseY / blockHeight);
    offsetX = baseX - baseCol * blockWidth;
    offsetY = baseY - baseRow * blockHeight;
    render();
  });
  canvas.addEventListener('mousedown', (ev) => {
    if (ev.y > headerSize) {
      if (ev.x > headerSize) {
        _selecting = normalizeSelection({
          type: SelectionType.Cells,
          col0: getColFromX(ev.x),
          row0: getRowFromY(ev.y),
        });
      } else {
        _selecting = normalizeSelection({
          type: SelectionType.Rows,
          row0: getRowFromY(ev.y),
        });
      }
    } else if (ev.x > headerSize) {
      _selecting = normalizeSelection({
        type: SelectionType.Columns,
        col0: getColFromX(ev.x),
      });
    } else {
      return;
    }
    selecting = _selecting;
    render();
  });
  canvas.addEventListener('mousemove', (ev) => {
    hoverCell = { col: getColFromX(ev.x), row: getRowFromY(ev.y) };
    if (_selecting) {
      if (_selecting.type === SelectionType.Cells) {
        selecting = normalizeSelection(
          Object.assign({}, _selecting, {
            col1: getColFromX(ev.x),
            row1: getRowFromY(ev.y),
          }),
        );
      } else if (_selecting.type === SelectionType.Columns) {
        selecting = normalizeSelection(
          Object.assign({}, _selecting, { col1: getColFromX(ev.x) }),
        );
      } else if (_selecting) {
        selecting = normalizeSelection(
          Object.assign({}, _selecting, { row1: getRowFromY(ev.y) }),
        );
      }
    }
    render();
  });
  canvas.addEventListener('mouseup', (ev) => {
    if (selecting) {
      let unselect = false;
      switch (selecting.type) {
        case SelectionType.Cells: {
          const subSelection = getSelectionStateFromCells(
            selections,
            selecting,
          );
          if (subSelection === true) unselect = true;
          else if (Array.isArray(subSelection)) {
            const w = selecting.col1 - selecting.col0 + 1;
            const h = selecting.row1 - selecting.row0 + 1;
            unselect = isAllItemsTrue(subSelection, w, h);
          }
          break;
        }
        case SelectionType.Columns: {
          unselect = true;
          for (let i = selecting.col0; i <= selecting.col1; i++) {
            if (!isColumnSelected(selections, i)) {
              unselect = false;
              break;
            }
          }
          break;
        }
        case SelectionType.Rows: {
          unselect = true;
          for (let i = selecting.row0; i <= selecting.row1; i++) {
            if (!isRowSelected(selections, i)) {
              unselect = false;
              break;
            }
          }
          break;
        }
      }
      if (unselect) {
        removeFromSelections(selections, selecting);
      } else {
        addIntoSelections(selections, selecting);
      }
    }
    _selecting = null;
    selecting = null;
    render();
  });

  render();
  function render() {
    if (isRendering) {
      clearTimeout(renderTimer);
      renderTimer = setTimeout(_render);
      return;
    }
    _render();
  }
  function _renderWithSelectionId() {
    isRendering = true;
    const startAt = performance.now();

    _initDraw();
    const w = canvas.width;
    const h = canvas.height;

    ctx.strokeStyle = '#52565e';
    ctx.lineWidth = 1;
    let x = headerSize,
      y = headerSize;

    const halfBlockWidth = blockWidth * 0.5;
    const halfBlockHeight = blockHeight * 0.5;

    const maxRows = Math.ceil(h / blockHeight) + 3;
    const maxCols = Math.ceil(w / blockWidth) + 3;
    const sel = getVerboseSelectionStateFromCells(selections, {
      row0: baseRow,
      col0: baseCol,
      row1: baseRow + maxRows,
      col1: baseCol + maxCols,
    });
    const unselectedBlocks = selections.filter(
      (it) => it.type === SelectionType.UnselectedCells,
    );
    for (let _row = 0; _row <= maxRows; _row++) {
      const row = baseRow + _row;
      const dy = y - offsetY;
      for (let _col = 0; _col <= maxCols; _col++) {
        const col = baseCol + _col;
        const dx = x - offsetX;
        let tmpSelected = selecting
          ? isCellSelected([selecting], row, col)
          : null;
        if (tmpSelected) {
          ctx.fillStyle = '#74d2e7';
          fillRect(dx, dy, blockWidth, blockHeight);
        } else if (sel[_row] && sel[_row][_col]) {
          const selValue = sel[_row][_col];
          ctx.fillStyle = selectionColors[selValue % selectionColors.length];
          fillRect(dx, dy, blockWidth, blockHeight);
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          fillText(`${selValue}`, dx + halfBlockWidth, dy + halfBlockHeight);
        }
        strokeRect(dx, dy, blockWidth, blockHeight);

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
        x += blockWidth;
      }
      x = headerSize;
      y += blockHeight;
    }
    // draw headers
    _drawHeaders(w, h, maxRows, maxCols);
    // draw debug info
    const elapsed = (performance.now() - startAt).toFixed(2);
    const cells = (maxRows + 1) * (maxCols + 1);
    const helpLines = getHelp(elapsed, `ratio=${canvasRatio} cells=${cells}`);
    _drawDebugInfo(helpLines);
    isRendering = false;
  }

  function _renderWithoutSelectionId() {
    isRendering = true;
    const startAt = performance.now();

    _initDraw();
    const w = canvas.width;
    const h = canvas.height;

    ctx.strokeStyle = '#52565e';
    ctx.lineWidth = 1;
    let x = headerSize,
      y = headerSize;

    const maxRows = Math.ceil(h / blockHeight) + 3;
    const maxCols = Math.ceil(w / blockWidth) + 3;
    const sel = getSelectionStateFromCells(selections, {
      row0: baseRow,
      col0: baseCol,
      row1: baseRow + maxRows,
      col1: baseCol + maxCols,
    });
    // console.log('getSelectionStateFromCells:', performance.now() - startAt);

    for (let _row = 0; _row <= maxRows; _row++) {
      const row = baseRow + _row;
      const dy = y - offsetY;
      for (let _col = 0; _col <= maxCols; _col++) {
        const col = baseCol + _col;
        const dx = x - offsetX;
        let tmpSelected = selecting
          ? isCellSelected([selecting], row, col)
          : null;
        if (tmpSelected) {
          ctx.fillStyle = '#74d2e7';
          fillRect(dx, dy, blockWidth, blockHeight);
        } else if (sel === true || (sel[_row] && sel[_row][_col])) {
          ctx.fillStyle = selectionColors[0];
          fillRect(dx, dy, blockWidth, blockHeight);
        }
        strokeRect(dx, dy, blockWidth, blockHeight);
        x += blockWidth;
      }
      x = headerSize;
      y += blockHeight;
    }
    // console.log('drawCells:', performance.now() - startAt);

    // draw headers
    _drawHeaders(w, h, maxRows, maxCols);

    // draw debug info
    const elapsed = (performance.now() - startAt).toFixed(2);
    const cells = (maxRows + 1) * (maxCols + 1);
    const helpLines = getHelp(elapsed, `ratio=${canvasRatio} cells=${cells}`);
    _drawDebugInfo(helpLines);
    isRendering = false;
  }

  function _initDraw() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d', { alpha: false });
    canvasRatio =
      (window.devicePixelRatio || 1) /
      (ctx['webkitBackingStorePixelRatio'] ||
        ctx['mozBackingStorePixelRatio'] ||
        ctx['msBackingStorePixelRatio'] ||
        ctx['oBackingStorePixelRatio'] ||
        ctx['backingStorePixelRatio'] ||
        1);
    canvasMultiInverseRatio = 1 / canvasRatio;
    ctx.scale(canvasRatio, canvasRatio);
    // background
    ctx.fillStyle = '#f3f4f7';
    fillRect(0, 0, canvas.width, canvas.height);
  }

  function _drawHeaders(w, h, maxRows, maxCols) {
    ctx.fillStyle = '#CDE2E7';
    fillRect(0, 0, w, headerSize);
    fillRect(0, 0, headerSize, h);

    // column headers
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    setFontSize(blockWidth < 50 ? 12 : 15);
    const colTextForTest = ctx.measureText(`${baseCol + maxCols}`);
    const colTextWidth = colTextForTest.width * 1.2;
    let minX = -Infinity;
    for (let col = 0; col <= maxCols; col++) {
      const x = headerSize + col * blockWidth + blockWidth * 0.5 - offsetX;
      if (x < minX) continue;
      fillText(`${col + baseCol}`, x, headerSize * 0.5);
      minX = x + colTextWidth * 2;
    }
    for (let row = 0; row <= maxRows; row++) {
      fillText(
        `${row + baseRow}`,
        headerSize * 0.5,
        headerSize + row * blockHeight + blockHeight * 0.5 - offsetY,
      );
    }
  }

  function _drawDebugInfo(helpLines) {
    let textSize = 15;
    let lineHeight = textSize * 1.2;
    ctx.textAlign = 'left';
    setFontSize(textSize);

    ctx.fillStyle = '#f6f6f5dd';
    fillRect(0, 0, 280, 400);
    let y = lineHeight;
    for (let i = 0; i < helpLines.length; i++) {
      const [fillStyle, text] = helpLines[i];
      ctx.fillStyle = fillStyle;
      fillText(text, 2, y);
      y += lineHeight;
    }

    textSize = 12;
    lineHeight = textSize * 1.2;
    setFontSize(textSize);
    y += 5;
    ctx.fillStyle = '#000000';

    if (hoverCell)
      fillText(`hover: row=${hoverCell.row} col=${hoverCell.col}`, 2, y);
    y += lineHeight;
    if (selecting) fillText(`selecting: ${getSelectionText(selecting)}`, 2, y);
    y += lineHeight;
    fillText(`${selections.length} selections:`, 2, y);
    y += lineHeight;
    for (let i = 0; i < selections.length; i++) {
      const sel = selections[i];
      ctx.fillStyle =
        sel.type === SelectionType.UnselectedCells ? '#e4002b' : '#000';
      fillText(`[${i + 1}] ${getSelectionText(sel)}`, 2, y);
      y += lineHeight;
      if (y > 600) break;
    }
  }
  function getSelectionText(sel) {
    let prefix = 'unknown:';
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
    const half = content.length >> 1;
    return (
      prefix +
      content.slice(0, half).join(',') +
      '-' +
      content.slice(half).join(',')
    );
  }

  /** @param {number} fontSize */
  function setFontSize(fontSize) {
    const px = (fontSize * canvasMultiInverseRatio).toFixed(0);
    ctx.font = `${px}px monospace`;
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  function fillRect(x, y, w, h) {
    ctx.fillRect(
      x * canvasMultiInverseRatio,
      y * canvasMultiInverseRatio,
      w * canvasMultiInverseRatio,
      h * canvasMultiInverseRatio,
    );
  }
  /**
   * @param {number} x
   * @param {number} y
   * @param {number} w
   * @param {number} h
   */
  function strokeRect(x, y, w, h) {
    ctx.strokeRect(
      x * canvasMultiInverseRatio,
      y * canvasMultiInverseRatio,
      w * canvasMultiInverseRatio,
      h * canvasMultiInverseRatio,
    );
  }
  /**
   * @param {string} text
   * @param {number} x
   * @param {number} y
   */
  function fillText(text, x, y) {
    ctx.fillText(
      text,
      x * canvasMultiInverseRatio,
      y * canvasMultiInverseRatio,
    );
  }

  function addRandomSelections() {
    const startAt = performance.now();
    const baseCount = selections.length;
    let addCount = 0;
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
      addCount += 3;
    };
    for (let i = 0; i < 2; i++) execute();

    min = 1001;
    max = 10000;
    for (let i = 0; i < 5; i++) execute();

    min = 10001;
    max = 1000000;
    for (let i = 0; i < 10; i++) execute();

    min = 1000001;
    max = 100000000;
    for (let i = 0; i < 20; i++) execute();

    min = 100000001;
    max = 1000000000;
    for (let i = 0; i < 30; i++) execute();

    const elapsed = performance.now() - startAt;
    diagnosis = `${elapsed.toFixed(2)}ms for +${addCount} selections `;
    diagnosis += `(avg: ${(elapsed / addCount).toFixed(2)}ms)`;

    render();
    return;
  }
  function showLoading() {
    loading.style.display = 'flex';
  }
  function hideLoading() {
    loading.style.display = 'none';
  }
  function isAllItemsTrue(array, w, h) {
    for (let i = 0; i < h; i++) {
      const row = array[i];
      if (!Array.isArray(row)) return false;
      for (let j = 0; j < w; j++) if (row[j] !== true) return false;
    }
    return true;
  }
})();
