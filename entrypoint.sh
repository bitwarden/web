#!/bin/sh

cp /etc/bitwarden/web/settings.js /app/js/settings.js
http-server ./ -p 80 -d false --utc
