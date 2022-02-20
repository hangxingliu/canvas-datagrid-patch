#!/usr/bin/env bash

set -x;

pushd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1;

cp ../../../dist/canvas-datagrid.debug.js . || exit 1;

set +x;
echo "copied!";
