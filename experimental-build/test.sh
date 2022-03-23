#!/usr/bin/env bash

pushd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1;

yarn run build || exit 1;
if test -z PROJECT_ROOT; then
  DEFAULT_PROJECT_ROOT="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )";
  PROJECT_ROOT="${DEFAULT_PROJECT_ROOT}"
fi

pushd "$PROJECT_ROOT" || exit 1;
yarn run test:watch;
