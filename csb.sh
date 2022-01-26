#!/usr/bin/env bash

PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

set -x;
cd "${PROJECT_DIR}" || exit 1;
docker run -it --rm \
  -v "${PROJECT_DIR}/codesandbox:/codesandbox" \
  codesandbox "${@}";
