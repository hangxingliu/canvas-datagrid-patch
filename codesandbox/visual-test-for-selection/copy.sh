#!/usr/bin/env bash

set -x;

pushd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1;

cp ../../tests/selections/normalize.css . || exit 1;
cp ../../tests/selections/visual-test.html index.html || exit 1;
cp ../../tests/selections/module.js . || exit 1;
cp ../../tests/selections/visual-test.js . || exit 1;

set +x;
echo "copied!";
