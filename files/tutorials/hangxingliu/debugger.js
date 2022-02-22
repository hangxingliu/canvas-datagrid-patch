'use strict';

/**
 * How to use this debugger:
 * 1. Include this file in the <head> section of your html: <script src="./debugger.js"></script>
 * 2. Insert the following code after the `self.init();` of the file `lib/main.js`:
 *
 *     if (window['__grid_debugger']) window['__grid_debugger'].inject(self);
 *
 * Then, you can call the method `grid.printDebugInfo()` to see the call stack info.
 */
(() => {
  const ignoredFunctions = new Set([
    'hasActiveFilters',
    'hasCollapsedRowGroup',
    'applyDefaultValue',
  ]);
  const ignoredEvents = new Set([
    'formatcellvalue',
    'beforerendercell',
    'rendercell',
    'afterrendercell',
    'formattext',
    'rendertext',
  ]);
  const gridDebugger = { inject };
  window.__grid_debugger = gridDebugger;

  function inject(self) {
    const maxLogs = 10000;

    let logs = [];
    let prevLogHRTime = 0;
    let propNames = Object.keys(self);
    let count = 0;
    for (let i = 0; i < propNames.length; i++) {
      const propName = propNames[i];
      if (typeof self[propName] !== 'function') continue;
      if (propName.startsWith('get')) continue;
      if (ignoredFunctions.has(propName)) continue;
      replaceFcuntion(propName);
      count++;
    }
    console.log(`The grid debugger injected ${count} functions`);
    self.intf.getDebugInfo = () => logs;
    self.intf.printDebugInfo = () => console.log(logs.join('\n'));
    self.intf.cleanDebugInfo = () => {
      logs = [];
    };

    function replaceFcuntion(funcName) {
      const originalFunc = self[funcName];
      self[funcName] = function (...args) {
        saveLog(funcName, args);
        return originalFunc.apply(this, args);
      };
    }
    function saveLog(funcName, args) {
      // pruning
      if (funcName === 'dispatchEvent' && ignoredEvents.has(args[0])) return;

      if (logs.length > maxLogs) logs = logs.slice(Math.floor(maxLogs / 2));
      const now = performance.now();
      let prefix;
      if (now > prevLogHRTime + 1000) {
        prefix = getDatePrefix();
        prevLogHRTime = now;
      } else {
        prefix = `+${(now - prevLogHRTime).toFixed(2)}ms`.padStart(10, ' ');
      }

      args = (args || []).map((it) => {
        const type = typeof it;
        if (
          it === null ||
          type === 'number' ||
          type === 'string' ||
          type === 'boolean'
        )
          return JSON.stringify(it);
        if (type === 'object') {
          let name = Object.prototype.toString.call(it);
          if (name.endsWith('Event]') && typeof it.type === 'string')
            name += '#' + it.type;
          return name;
        }
        return type;
      });

      const stack = new Error().stack.split('\n').slice(3);
      let parentName = [];
      while (stack.length && parentName < 3) {
        const it = stack.shift();
        let name = it.slice(7); // '    at '
        if (name.startsWith('Object.')) name = name.slice(7);
        if (name.indexOf('<') >= 0) continue;
        const index = name.indexOf(' ');
        if (index > 0) parentName.push(name.slice(0, index));
      }
      parentName.push(funcName);
      if (parentName.length > 0) funcName = parentName.join(' -> ');
      logs.push(`${prefix} ${funcName}(${args.join(', ')})`);
    }
  }
  function getDatePrefix() {
    const d = new Date();
    return (
      String(d.getHours()).padStart(2, '0') +
      ':' +
      String(d.getMinutes()).padStart(2, '0') +
      ':' +
      String(d.getSeconds()).padStart(2, '0')
    );
  }
})();
