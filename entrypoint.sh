#!/bin/sh

NOUSER=`id -u bitwarden > /dev/null 2>&1; echo $?`
LUID=${LOCAL_UID:-999}
if [[ $NOUSER == 0 && `id -u bitwarden` != $LUID ]]
then
    usermod -u $LUID bitwarden
elif [ $NOUSER == 1 ]
then
    useradd -r -u $LUID -g bitwarden bitwarden
fi

chown -R bitwarden:bitwarden /etc/bitwarden
cp /etc/bitwarden/web/settings.js /app/js/settings.js
cp /etc/bitwarden/web/app-id.json /app/app-id.json
chown -R bitwarden:bitwarden /app
chown -R bitwarden:bitwarden /bitwarden_server

gosu bitwarden:bitwarden dotnet /bitwarden_server/Server.dll \
    /contentRoot=/app /webRoot=. /serveUnknown=false
