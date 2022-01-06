#!/usr/bin/env pwsh
Get-ChildItem -File -Include '*.png' -Recurse -Path 'src' | Foreach { node .\scripts\optimize.js $_.fullname}
