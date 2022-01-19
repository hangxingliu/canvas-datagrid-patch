console.log(
  omitRanges(
    [1, 3, 4, 5, 6, 10, 15, 16, 18, 19, 20, 21, 26, 30],
    [[5, 20], [40, 50]],
  )
);

console.log(
  omitRanges(
    [1, 3, 4, 5, 6, 10, 15, 16, 18, 19, 20, 21, 26, 30],
    [[40, 50]],
  )
)

console.log(
  omitRanges(
    [1, 3, 4, 5, 6, 10, 15, 16, 18, 19, 20, 21, 26, 30],
    [[1, 5], [7, 20], [22, 50]],
  )
)

console.log(
  omitRanges(
    [1, 3, 4, 5, 6, 10, 15, 16, 18, 19, 20, 21, 26, 30],
    [[1, 7], [9, 40]],
  )
)
/**
 * @param {Array<[number]>} data
 * @param {Array<[number,number]>} ranges
 * @returns {Array<[number]>}
 */
function omitRanges(data, ranges) {
  let r = ranges.shift();
  for (let start = 0; start < data.length; start++) {
    const it = data[start];
    if (it < r[0]) continue;
    let end = start + 1;
    for (; end < data.length; end++) {
      const it2 = data[end];
      if (it2 > r[1]) break;
    }
    data.splice(start, end - start);
    start--;
    r = ranges.shift();
    if (!r) break;
  }
  return data;
}
