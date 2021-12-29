#!/usr/bin/env bash

THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
FILES_DIR="${THIS_DIR}/files";
PROJECT_DIR="${THIS_DIR}/..";

throw() { echo -e "fatal: $1" >&2; exit 1; }
cd "$FILES_DIR" || exit 1;

files="$(find . -type f \! -iname '.*')";
[ -z "$files" ] && throw "no files in 'files' directory";
echo "[ ] found $(echo "${files}" | wc -l | awk '{print $1}') files";

cd "${PROJECT_DIR}" || exit 1;
echo "[ ] pwd: $(pwd)";
while read -r file; do
  dir="$(dirname "${file}")";
  if [ ! -d "$dir" ]; then
    echo "[.] creating directory '$dir'";
    mkdir -v -p "$dir" || exit 1;
  fi
  echo "[.] apply '${file}'";
  cp "${FILES_DIR}/${file}" "${file}" || exit 1;
done <<< "${files}";
echo "[+] done!";
