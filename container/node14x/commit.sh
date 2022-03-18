#!/usr/bin/env bash

throw() { echo -e "fatal: $1" >&2; exit 1; }
usage() {
	echo -e "";
	echo -e "  Usage: commit.sh <container-name>";
	echo -e "";
	echo -e "  Update the image node:14x from a container";
  echo -e "  You can find container by 'docker ps'"
	echo -e "";
	exit 1;
}

if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then usage; fi
test -n "$1" || usage;

container="$1";
check_container() { test -n "$(docker ps --all --quiet --filter name="$1")"; }
check_container "$container" || throw "'$container' doesn't exist";

get_image_hash() { docker commit "$container"; }
echo "docker commit $container ...";
image_hash="$(get_image_hash)";
test -n "$image_hash" || throw "commit container failed!";
echo "> ${image_hash}";

image_name="node:14x";
echo "docker tag $image_hash $image_name ...";
docker tag "$image_name" "$image_name" || throw "docker tag failed!";

echo "done!";
