#!/usr/bin/env node
const { deepStrictEqual: eq, } = require('assert');

/** @type {Array<[number,number]>} */
const ranges = [
  [3, 5],
  [10, 20],
  [6, 7],
  [18, 25],
  [40, 80],
];
eq(
  mergeRanges(ranges),
  [[3, 7], [10, 25], [40, 80]]
);
eq(
  mergeRanges([]),
  []
);
eq(
  mergeRanges([[1, 2]]),
  [[1, 2]]
);
eq(
  mergeRanges([[10, 11], [16, 20], [8, 30], [4, 6], [5, 15]]),
  [[4, 30]]
);
eq(
  mergeRanges([[5, 20], [1, 3], [6, 15], [6, 21]]),
  [[1, 3], [5, 21]]
);
eq(
  mergeRanges([[10, 10], [10, 10], [10, 10], [11, 11]]),
  [[10, 11]]
);
eq(
  mergeRanges([[10, 10], [11, 11], [9, 9], [15, 20]]),
  [[9, 11], [15, 20]]
);


/**
 * @param {Array<[number,number]} ranges
 * @returns {Array<[number,number]>}
 */
function mergeRanges(ranges) {
  ranges.sort((a, b) => a[0] - b[0]);
  let newLen = 0;
  const len = ranges.length;
  for (let i = 0; i < len; i++) {
    const r = ranges[i];
    if (i === len - 1) {
      ranges[newLen++] = r;
      break;
    }
    const to = r[1];
    const [from2, to2] = ranges[i + 1];
    if (from2 > to + 1) {
      ranges[newLen++] = r;
      continue;
    }
    ranges[i + 1] = r;
    if (to2 > to)
      ranges[i + 1][1] = to2;
  }
  return ranges.slice(0, newLen);
}

