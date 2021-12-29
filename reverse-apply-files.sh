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
  if [ ! -f "$file" ]; then
    echo "[!] there is not a file: '$dir'";
    continue;
  fi

  echo "[.] reverse apply '${file}'";
  cp "${file}" "${FILES_DIR}/${file}" || exit 1;
done <<< "${files}";
echo "[+] done!";
