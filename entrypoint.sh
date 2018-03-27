#!/bin/sh

useradd -r -u ${LOCAL_UID:-999} -g bitwarden bitwarden

chown -R bitwarden:bitwarden /etc/bitwarden
cp /etc/bitwarden/web/settings.js /app/js/settings.js
cp /etc/bitwarden/web/app-id.json /app/app-id.json
chown -R bitwarden:bitwarden /app
chown -R bitwarden:bitwarden /bitwarden_server

gosu bitwarden:bitwarden dotnet /bitwarden_server/Server.dll \
    /contentRoot=/app /webRoot=. /serveUnknown=false
