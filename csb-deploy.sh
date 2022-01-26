#!/usr/bin/env bash

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

pushd "${PROJECT_DIR}" || exit 1;
throw() { echo -e "fatal: $1" >&2; exit 1; }

BOX_PATH="$1";
test -d "$BOX_PATH" || throw "'$BOX_PATH' is not a directory!";

test -f "${BOX_PATH}/sandbox.config.json" ||
  throw "'${BOX_PATH}/sandbox.config.json' is not a file!";

COPY_CLI="${BOX_PATH}/copy.sh";
test -x "$COPY_CLI" || throw "'$COPY_CLI' is not a executable file!";

set -x;
bash "${COPY_CLI}" || exit 1;

docker run -it --rm \
  -v "${PROJECT_DIR}/codesandbox:/codesandbox" \
  codesandbox deploy "$BOX_PATH";
