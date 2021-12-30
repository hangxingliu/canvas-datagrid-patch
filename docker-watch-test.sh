#!/usr/bin/env bash

pushd "$( dirname "${BASH_SOURCE[0]}" )/.." || exit 1;

set -x;
docker run -it --rm --entrypoint /bin/sh -v "$(pwd):/workspace" -p 9876:9876 node:14 -c "cd /workspace && npm run test:watch -- --debug"
