# Zrain Ecosystem Admin: development foundation

All implementation is in the existing **zrain-ecosystem** repository. No independent repositories or project folders are required.

## Verified in GitHub Actions

- Existing Zrain website tests and new catalog normalization tests.
- Java 21 Spring Boot 4.1.2 API build with Maven Wrapper.
- Four H2 integration scenarios with a real signed JWT, SQL migration, ADMIN authorization, product publishing and input validation.

## Important release gate

**Do not deploy this branch to production yet.** The hosted Java API, PostgreSQL credentials, admin bootstrap, migration of the six existing products, production logo upload and Cloudflare public catalog have NOT been deployed.

In `public/api-config.js`, production `API_BASE_URL` is deliberately blank and `ENABLE_DYNAMIC_CATALOG` is false. This prevents the public directory from changing while the API is unfinished. The admin page will refuse login until there is a real configured backend.

The API currently provides `GET /api/products` directly from PostgreSQL as a local integration endpoint. The planned Cloudflare Worker/R2 published snapshot is a separate release gate; the public directory should use it before we activate the feature in production, so the website is not dependent on Render cold starts.

## Test entirely in the existing folder (Windows PowerShell)

1. Check the working tree and switch to the prepared branch **only when your current work is clean**:

```powershell
cd "$env:USERPROFILE\Downloads\zrain-ecosystem"
git status --short
git fetch origin
git switch --track origin/feature/admin-console-foundation
```

If Git reports existing local changes or that the branch already exists, **stop** and inspect; do not reset/clean/force.

2. In the FIRST PowerShell window, configure temporary local environment variables. Use your own email and a unique password. Do not send the password or JWT key to ChatGPT:

```powershell
cd "$env:USERPROFILE\Downloads\zrain-ecosystem\backend"
$bytes = [byte[]]::new(32)
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
$env:ZRAIN_JWT_SECRET_BASE64 = [Convert]::ToBase64String($bytes)
$env:ZRAIN_ADMIN_EMAIL = Read-Host "Local admin email"
$pass = Read-Host "Local admin password (16+ characters)" -AsSecureString
$env:ZRAIN_ADMIN_PASSWORD = (New-Object System.Net.NetworkCredential("", $pass)).Password
$env:ZRAIN_ALLOWED_ORIGIN = "http://localhost:5000"
$env:SPRING_PROFILES_ACTIVE = "local"
.\mvnw.cmd clean verify
.\mvnw.cmd spring-boot:run
```

The in-memory H2 local database is reset when the backend stops. PostgreSQL is required before production usage. **Never enter real secrets in the public GitHub repo.**

3. In a SECOND PowerShell window, run the local static site:

```powershell
cd "$env:USERPROFILE\Downloads\zrain-ecosystem"
node scripts/dev-server.mjs
```

Open http://localhost:5000/admin and sign in using the local account you created in step 2. Try Add Product, Save, Publish and Unpublish. The API returns public data at http://localhost:8080/api/products, but the public website retains its original six products until the dynamic catalog release gate is passed.

## Main paths

- `public/admin/index.html`, `admin.css`, `admin.js`: admin interface.
- `public/api-config.js`: one-time API integration switch, disabled in production.
- `public/product-catalog-client.js`, `product-directory.js`: safe public catalog display, opt-in.
- `public/zrain-console.js`: current Console plus dynamic product registration.
- `backend/`: Java API derived from the unchanged Zrain Auth Starter source.
- `backend/src/main/resources/db/migration/`: Flyway schema.
- `test/catalog.test.js`, `backend/src/test/`: regression and integration tests.

## Next release gates

1. Verify admin UI in a real browser and preserve the existing Zrain UI design.
2. Provide persistent PostgreSQL on a suitable free plan; provision the admin securely via secret environment variables.
3. Add R2 logo upload with content validation and size limits.
4. Publish catalog snapshots through Cloudflare Worker + R2 with authenticated server-to-server publication and rollback-safe revisions.
5. Import and review the six existing products, including accurate URL/button actions.
6. Enable the dynamic catalog only once the public snapshot is verified, then run browser and end-to-end security tests.
7. Create a reviewed PR and deploy to Firebase only after these gates pass.

Security notes: `/admin` is a public route displaying a login form, **not** a secret URL. Every admin API request is protected with a signed JWT and current account role lookup. Access tokens exist only in JS memory. The in-process login throttle provides a basic development safeguard; production needs edge/API rate limiting and ideally MFA. No public registration endpoint is exposed. Changes to GitHub do not update your local folder or live Firebase Hosting automatically.
