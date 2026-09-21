# Where's My Book? — Cloudflare MVP

A small, QR-first traveling-book tracker built for Cloudflare Pages + Pages Functions + D1.

## Included in this first build

- Public home page with Book ID lookup
- Register a physical book
- Unique `WMB-XXXXXXXX` ID for each copy
- Printable 3 × 4 inch bookplate
- QR code that goes directly to that book's journey page
- Public travel diary with city/state/country check-ins
- Finder can add a stop without creating an account
- Private owner/admin dashboard showing every registered book and check-in counts
- City-level location collection only (no precise address fields)

## Architecture

- `public/` — static HTML/CSS/JS
- `functions/` — Cloudflare Pages Functions (API)
- `schema.sql` — Cloudflare D1 database schema
- D1 binding name: `DB`
- Cloudflare secret: `ADMIN_KEY`

## Cloudflare setup

### 1. Create the D1 database

In Cloudflare Dashboard, create a D1 database named `wheres-my-book-db`.

Or with Wrangler:

```bash
npx wrangler d1 create wheres-my-book-db
```

Copy the generated `database_id` into `wrangler.jsonc`.

### 2. Create the tables

With Wrangler:

```bash
npx wrangler d1 execute wheres-my-book-db --remote --file=./schema.sql
```

Or run the contents of `schema.sql` in the D1 console in Cloudflare.

### 3. Create a Pages project

Because this project uses Pages Functions, use a Git-connected Pages project or deploy with Wrangler. A dashboard drag-and-drop Direct Upload is not enough for Pages Functions.

Set the build output directory to:

```text
public
```

No build command is required.

### 4. Bind D1

In the Pages project:

**Settings → Bindings → Add → D1 database**

- Variable name: `DB`
- Database: `wheres-my-book-db`

Redeploy after adding the binding.

### 5. Add the private admin key

Add an encrypted secret/environment variable named:

```text
ADMIN_KEY
```

Use a long random value (at least 24–32 characters). Never put that value in the public JavaScript files.

The admin page at `/admin.html` asks for this key and keeps it only in browser `sessionStorage` for that tab/session.

### 6. Test

1. Open `/register.html`
2. Register a book
3. Print the generated bookplate
4. Open the QR/Book ID page
5. Add a travel stop
6. Open `/admin.html` and enter the admin key

## Important MVP note about QR codes

The first version renders QR images through `api.qrserver.com` to keep the initial build dependency-free. Only the public book journey URL is sent to that QR service. Before a larger public launch, replace this with locally generated QR codes so there is no third-party dependency.

## Good next features

- User accounts and “My Books” dashboard
- Email notifications when a registered book gets a new hit
- Automated distance traveled
- Map view (city-level only)
- Moderation controls for deleting/editing spam sightings
- Rate limiting / Turnstile on public check-in forms
- Custom bookplate styles and sticker sheets
- Book cover lookup by ISBN
- Photos stored in R2
- Achievement/passport stamps

## Local development

If Wrangler is installed and `wrangler.jsonc` contains a valid D1 database ID:


```bash
npx wrangler pages dev public



```

For local D1 development you can also use Wrangler's local D1 persistence and apply the schema locally.
