#!/usr/bin/env bash

goto_dir() {
  pushd "$1" >/dev/null || exit 1;
  echo "pwd: $(pwd)";
}
goto_dir "$( dirname "${BASH_SOURCE[0]}" )";

swc="$(pwd)/node_modules/.bin/swc";
node_swcrc="$(pwd)/node.swcrc"

yarn run build || exit 1;
if test -z "$PROJECT_ROOT"; then
  DEFAULT_PROJECT_ROOT="$( cd ../.. && pwd )";
  PROJECT_ROOT="${DEFAULT_PROJECT_ROOT}"
fi

goto_dir "$PROJECT_ROOT";

swc_args=( lib --out-dir dist/node --config-file "${node_swcrc}" )
echo "${swc} ${swc_args[@]} ...";
"${swc}" "${swc_args[@]}" || exit 1;

yarn run test:watch;
