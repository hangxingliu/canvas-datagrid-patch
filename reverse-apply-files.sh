#!/usr/bin/env bash

THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
FILES_DIR="${THIS_DIR}/files";
PROJECT_DIR="${THIS_DIR}/..";

throw() { echo -e "fatal: $1" >&2; exit 1; }
cd "$FILES_DIR" || exit 1;

files="$(find . -type f \! -iname '._*' \! -iname '.DS_Store')";
[ -z "$files" ] && throw "no files in 'files' directory";
echo "[ ] found $(echo "${files}" | wc -l | awk '{print $1}') files";

cd "${PROJECT_DIR}" || exit 1;
echo "[ ] pwd: $(pwd)";
while read -r file; do
  source_file="$(echo "$file" | sed "s/__noop__//")";
  if [ ! -f "$source_file" ]; then
    # echo "[!] there is not a file: '$source_file'";
    continue;
  fi

  echo "[.] reverse apply '${source_file}'";
  cp "${source_file}" "${FILES_DIR}/${file}" || exit 1;
done <<< "${files}";
echo "[+] done!";
