#!/usr/bin/env bash

THIS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )";
FILES_DIR="${THIS_DIR}/files";
ARCHIVED_LIST_FILE="${FILES_DIR}/archived.list"
PROJECT_DIR="${THIS_DIR}/..";

throw() { echo -e "fatal: $1" >&2; exit 1; }
cd "$FILES_DIR" || exit 1;

files="$(find . -type f \! -iname '._*' \! -iname '.DS_Store')";
[ -z "$files" ] && throw "no files in 'files' directory";
echo "[ ] found $(echo "${files}" | wc -l | awk '{print $1}') files";

archived_list=();
archived_index=0;
is_archived() {
  for item in "${archived_list[@]}"; do
    [ "$item" == "$1" ] && return 0;
  done
  return 1;
}

while read -r item; do
  [ -z "$item" ] && continue;
  item0="${item#./}";
  item1="./${item0}";
  archived_list+=( "$item0" "$item1" );
  archived_index="$(($archived_index+1))"
done <<< "$(cat "$ARCHIVED_LIST_FILE")";
echo "[ ] archived list items: ${archived_index}";

cd "${PROJECT_DIR}" || exit 1;

copy_count=0;
echo "[ ] pwd is '$(pwd)'";
while read -r file; do
  [ -z "$file" ] && continue;
  [ "$file" == "./archived.list" ] && continue;
  is_archived "$file" && continue;

  dir="$(dirname "${file}")";
  if [ ! -d "$dir" ]; then
    echo "[.] creating directory '$dir'";
    mkdir -v -p "$dir" || exit 1;
  fi

  echo "[.] apply '${file}'";
  cp "${FILES_DIR}/${file}" "${file}" || exit 1;
  copy_count="$(($copy_count+1))"
done <<< "${files}";

echo "[ ] copied ${copy_count} files";
echo "[+] done!";
