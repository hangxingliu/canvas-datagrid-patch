#!/usr/bin/env bash

DIRNAME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";

set -x;
export CHROME_BIN="$(node "${DIRNAME}/index.js")"
set +x;
