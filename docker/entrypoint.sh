#!/bin/sh

/usr/local/bin/confd -onetime -backend env

cp /etc/bitwarden/web/app-id.json /app/app-id.json

exec dotnet /server/Web.dll /contentRoot=/app /webRoot=.
