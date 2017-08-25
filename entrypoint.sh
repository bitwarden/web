#!/bin/sh

cp /etc/bitwarden/web/settings.js /app/js/settings.js
cp /etc/bitwarden/web/app-id.json /app/app-id.json
dotnet /bitwarden_server/Server.dll /contentRoot=/app /webRoot=. /serveUnknown=false
