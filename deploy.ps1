param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectId
)

$ErrorActionPreference = 'Stop'
if ($ProjectId -ne 'zrain-ecosystem') {
    throw 'Deployment stopped: use Firebase project zrain-ecosystem only.'
}

Push-Location $PSScriptRoot
try {
    function Assert-Success([string]$Step) {
        if ($LASTEXITCODE -ne 0) {
            throw "$Step failed. Deployment stopped."
        }
    }

    if (!(Test-Path '.\firebase.json') -or !(Test-Path '.\public\index.html')) {
        throw 'Missing firebase.json or public/index.html. Deployment stopped.'
    }

    npm install
    Assert-Success 'Dependency installation'

    npm run ui:sync
    Assert-Success 'Official Zrain UI sync'

    npm run test:release
    Assert-Success 'Zrain Ecosystem release tests'

    firebase hosting:sites:get zrain --project $ProjectId
    Assert-Success 'Confirm Firebase Hosting site zrain'

    firebase deploy --only hosting --project $ProjectId
    Assert-Success 'Firebase Hosting deployment'

    Write-Host 'Zrain Ecosystem v4 deployment complete: https://zrain.web.app'
} finally {
    Pop-Location
}
