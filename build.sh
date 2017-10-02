#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""

if [ $# -gt 0 -a "$1" == "push" ]
then
    echo "# Pushing Web"
    echo ""
    
    if [ $# -gt 1 ]
    then
        TAG=$2
        docker push bitwarden/web:$TAG
    else
        docker push bitwarden/web
    fi
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
    echo "gulp version $(gulp --version)"
    npm install
    gulp dist:selfHosted

    echo ""
    echo "Building docker image"
    docker --version
    docker build -t bitwarden/web $DIR/.
fi
