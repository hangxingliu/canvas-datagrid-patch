# Experimental Building Toolchain

<https://swc.rs/>

This toolchain reduces the building time of the canvas-datagrid project from 15s to 5s on my computer.

``` bash
cd experimental-build;
export PROJECT_ROOT=/path/to/workspace/canvas-datagrid;
yarn install;
yarn run build;
# or yarn start
# or ./test.sh
```
