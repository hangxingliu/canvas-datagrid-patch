# Patches for Developing Canvas Datagrid Project

See [Documents](docs/README.md)

``` bash
./container/node14x/build.sh
./container/codesandbox/build.sh
```

- Tests
- Utils
- Scripts
- Configs

## Deploy to CodeSandbox

``` bash
./csb-deploy.sh codesandbox/feature-420
```

## TODO

Add an injection util for analyzing internal function invoking, Example:

``` javascript
__analyze_func_stack.start();
__analyze_func_stack.stop();
// [
//   "2022-02-20T21:03:25.586Z self.xxx",
//   "2022-02-20T21:03:25.890Z self.xxx > self.xxx",
//   "2022-02-20T21:03:25.990Z self.xxx > self.xxx > self.yyy",
//   "2022-02-20T21:03:25.991Z self.xxx > self.xxx > self.zzz",
//   "2022-02-20T21:03:26.021Z self.kkk",
// ]

```


