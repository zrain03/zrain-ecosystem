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
        # Reuse the existing namespace. Never create another one automatically.
        Write-Host 'Reuse the KV namespace that Cloudflare already created.' -ForegroundColor Yellow
        $namespaceId = (Read-Host 'Paste the existing 32-character KV Namespace ID').Trim()
        if ($namespaceId -cnotmatch '^[a-fA-F0-9]{32}$') {
            throw 'Invalid namespace ID. Nothing has been deployed.'
        }
        $remoteNamespaces = @(npx wrangler kv namespace list)
        if ($LASTEXITCODE -ne 0) {
            throw 'Could not verify existing namespace. Nothing has been deployed.'
        }
        $remoteText = $remoteNamespaces -join [Environment]::NewLine
        if ($remoteText -notmatch [regex]::Escape($namespaceId)) {
            throw 'Namespace ID is not present in your Cloudflare account.'
        }
        $binding = [Environment]::NewLine + '[[kv_namespaces]]' +
            [Environment]::NewLine + 'binding = "ZRAIN_CATALOG"' +
            [Environment]::NewLine + 'id = "' + $namespaceId + '"' +
            [Environment]::NewLine
        Add-Content -LiteralPath '.\wrangler.toml' -Value $binding -Encoding UTF8
        Write-Host 'Linked the existing KV namespace; no duplicate was created.' -ForegroundColor Green
    }
    $config = Get-Content '.\wrangler.toml' -Raw
    if ($config -notmatch '\[\[kv_namespaces\]\]' -or
        $config -notmatch 'binding\s*=\s*"ZRAIN_CATALOG"') {
        throw 'KV binding missing. Deployment blocked.'
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
) {
            throw 'Invalid KV Namespace ID. No changes made.'
        }
        $remoteNamespaces = @(npx wrangler kv namespace list)
        if ($LASTEXITCODE -ne 0) {
            throw 'Unable to verify the existing KV namespace. No changes made.'
        }
        if (($remoteNamespaces -join "`n") -notmatch [regex]::Escape($namespaceId)) {
            throw 'This KV namespace was not found in the connected Cloudflare account. No changes made.'
        }
        $binding = "`n[[kv_namespaces]]`nbinding = `"ZRAIN_CATALOG`"`nid = `"$namespaceId`"`n"
        Add-Content -LiteralPath '.\wrangler.toml' -Value $binding -Encoding UTF8
        Write-Host 'Existing KV namespace linked. No duplicate namespace was created.' -ForegroundColor Green
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
