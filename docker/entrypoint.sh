#!/bin/sh

/usr/local/bin/confd -onetime -backend env

cp /etc/bitwarden/web/app-id.json /app/app-id.json

exec dotnet /bitwarden_server/Server.dll /contentRoot=/app /webRoot=. /serveUnknown=false /webVault=true
