# Where's My Book? — Accounts + My Books

This version adds member accounts and a private My Books dashboard while keeping public finder check-ins account-free.

## Existing live-site upgrade
1. In Cloudflare D1 Console for `wheres-my-book-db`, run `migration_accounts.sql` ONCE.
2. Upload/commit the updated project files to the existing GitHub repo.
3. Wait for Cloudflare Pages production deployment to succeed.
4. Open `/account.html`, create an account, then register a NEW test book.
5. Confirm the book appears in `/my-books.html`.

Important: books created before the accounts migration remain unowned. They stay fully functional and remain visible to the site admin. New books registered while signed in are automatically linked to that account.

## Authentication notes
- Passwords use PBKDF2-SHA256 with a per-user random salt and 210,000 iterations.
- Login sessions use random opaque tokens. Only a SHA-256 hash of each token is stored in D1.
- The browser receives the session token in an HttpOnly, Secure, SameSite=Lax cookie.
- Email verification and password-reset email are intentionally not included in this MVP yet.
