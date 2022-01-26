#!/usr/bin/env bash

set -x;

pushd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1;

cp ../../../dist/canvas-datagrid.js . || exit 1;
cp ../../../tutorials/hangxingliu/420.js 420.js || exit 1;
cp ../../../tutorials/hangxingliu/420.html index.orig.html || exit 1;
awk -vscript='        <script src="./canvas-datagrid.js"></script>' \
  '/src="..\/canvas-datagrid/ { print script; next; } {print}' index.orig.html > index.html ||
  exit 1;
rm index.orig.html || exit 1;

set +x;
echo "copied!";
