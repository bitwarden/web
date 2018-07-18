$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

echo "`n# Building Web"

echo "`nBuilding app"
echo "npm version $(npm --version)"
npm install
npm run sub:update
npm run dist:selfhost

echo "`nBuilding docker image"
docker --version
docker build -t bitwarden/web $dir\.
