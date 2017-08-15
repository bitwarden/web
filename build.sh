#!/usr/bin/env bash
set -e

DIR="$(dirname $(readlink -f $0))"

echo -e "\n# Building Web"

echo -e "\nBuilding app"
echo -e "npm version $(npm --version)"
echo -e "gulp version $(gulp --version)"
npm install
gulp dist:selfHosted

echo -e "\nBuilding docker image"
docker --version
docker build -t bitwarden/web $DIR/.
