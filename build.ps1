$dir = Split-Path -Parent $MyInvocation.MyCommand.Path

echo "`n# Building Web"

echo "`nBuilding app"
echo "npm version $(npm --version)"
echo "gulp version $(gulp --version)"
npm install
gulp dist:selfHosted

echo "`nBuilding docker image"
docker --version
docker build -t bitwarden/web $dir\.
