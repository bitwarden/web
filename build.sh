#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "# Building Web"

echo ""
echo "Building app"
echo "npm version $(npm --version)"
echo "gulp version $(gulp --version)"
npm install
gulp dist:selfHosted

echo ""
echo "Building docker image"
docker --version
docker build -t bitwarden/web $DIR/.
