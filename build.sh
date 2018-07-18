#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""

if [ $# -gt 1 -a "$1" == "push" ]
then
    TAG=$2
    echo "# Pushing Web ($TAG)"
    echo ""
    docker push bitwarden/web:$TAG
elif [ $# -gt 1 -a "$1" == "tag" ]
then
    TAG=$2
    echo "Tagging Web as '$TAG'"
    docker tag bitwarden/web bitwarden/web:$TAG
else
    echo "# Building Web"

    echo ""
    echo "Building app"
    echo "npm version $(npm --version)"
    npm install
    npm run sub:update
    npm run dist:selfhost

    echo ""
    echo "Building docker image"
    docker --version
    docker build -t bitwarden/web $DIR/.
fi
