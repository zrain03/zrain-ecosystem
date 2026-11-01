# Safe Cloudflare Workers + KV Free setup. Run only from your own authenticated PC.
# No R2, paid plan, billing activation, card, or Render.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$worker = Join-Path $root 'catalog-worker'
if (!(Test-Path (Join-Path $worker 'wrangler.toml'))) {
    throw 'Zrain catalog Worker files are missing.'
}
Push-Location $worker
try {
    Write-Host 'Checking strict Free-only Zrain Admin prerequisites...' -ForegroundColor Cyan
    $choice = Read-Host 'Confirm Cloudflare Workers FREE (not Paid), no payment method, and NO R2 subscription. Type FREE to continue'
    if ($choice -cne 'FREE') {
        throw 'Not confirmed Free-only. No resources were created.'
    }
    $config = Get-Content '.\wrangler.toml' -Raw
    if ($config -match '\[\[r2_buckets\]\]' -or $config -match '\[observability\]') {
        throw 'Unexpected optional service config. No deployment attempted.'
    }
    npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'Dependency install failed.' }
    npm test
    if ($LASTEXITCODE -ne 0) { throw 'Worker tests failed.' }

    npx wrangler whoami
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Cloudflare login is required.'
        npx wrangler login
        if ($LASTEXITCODE -ne 0) { throw 'Cloudflare login failed.' }
    }
    $config = Get-Content '.\wrangler.toml' -Raw
    if ($config -notmatch '\[\[kv_namespaces\]\]') {
        npx wrangler kv namespace create ZRAIN_CATALOG --update-config
        if ($LASTEXITCODE -ne 0) { throw 'KV Free namespace could not be created.' }
    }
    $config = Get-Content '.\wrangler.toml' -Raw
    if ($config -notmatch '\[\[kv_namespaces\]\]' -or $config -notmatch 'binding\s*=\s*"ZRAIN_CATALOG"') {
        throw 'KV binding is missing. Do not deploy.'
    }
    $email = Read-Host 'Enter the private admin email'
    if ($email -notmatch '^[^\s@]+@[^\s@]+\.[^\s@]+$') {
        throw 'Invalid admin email.'
    }
    $email | npx wrangler secret put ZRAIN_ADMIN_EMAIL
    if ($LASTEXITCODE -ne 0) { throw 'Admin email could not be configured.' }

    $securePassword = Read-Host 'Enter a UNIQUE 32+ character password (save it in your password manager)' -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    try {
        $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
        if ($plainPassword.Length -lt 32) { throw 'Admin password must have at least 32 characters.' }
        $plainPassword | npx wrangler secret put ZRAIN_ADMIN_PASSWORD
        if ($LASTEXITCODE -ne 0) { throw 'Admin password could not be configured.' }
    } finally {
        if ($pointer -ne [IntPtr]::Zero) {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
        }
        Remove-Variable plainPassword -ErrorAction SilentlyContinue
    }

    $random = [byte[]]::new(32)
    $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $rng.GetBytes($random) } finally { $rng.Dispose() }
    [Convert]::ToBase64String($random) | npx wrangler secret put ZRAIN_JWT_SECRET_BASE64
    if ($LASTEXITCODE -ne 0) { throw 'Signing key setup failed.' }

    npx wrangler deploy
    if ($LASTEXITCODE -ne 0) { throw 'Worker deployment failed.' }
    Write-Host 'Free-only Worker deployed. Save the reported HTTPS Worker URL; the Firebase website has NOT been changed.' -ForegroundColor Green
} finally {
    Pop-Location
}
