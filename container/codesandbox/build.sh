#!/usr/bin/env bash

set -x;
cd "$( dirname "${BASH_SOURCE[0]}" )" || exit 1;
docker build -t codesandbox .;
