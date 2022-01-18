#!/usr/bin/env bash

pushd "$( dirname "${BASH_SOURCE[0]}" )/.." || exit 1;

set -x;
docker run -it --rm --entrypoint /bin/sh -v "$(pwd):/workspace" -p 18080:8080 node:14x -c "cd /workspace && ./node_modules/.bin/webpack serve --host 0.0.0.0"
