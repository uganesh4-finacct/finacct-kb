# Invite link – mobile / in-app browsers

On mobile (and in some in-app browsers), the redirect after clicking the invite link can drop the URL **hash** (`#access_token=...`), so the user lands on the login page instead of the set-password page.

## Fix: use query params in the invite email (recommended)

In **Supabase Dashboard → Authentication → Email Templates → Invite user**, change the link so it goes **directly to our app** with the token in the **query string** (no hash).

**Replace the default link** (which uses `{{ .ConfirmationURL }}`) with:

```html
<a href="{{ .SiteURL }}/auth/accept-invite?token_hash={{ .TokenHash }}&type=invite">Accept Invitation</a>
```

- Use your real site URL. If `Site URL` in Supabase is `https://kb.finacct360.io`, the link will be `https://kb.finacct360.io/auth/accept-invite?token_hash=...&type=invite`.
- The app’s `/auth/accept-invite` route reads `token_hash` and `type=invite` from the query, verifies the token on the server, and redirects to the set-password page. This works on mobile and desktop.

Keep the rest of your template (subject, body, signature) as is; only change the **href** of the “Accept” / “Accept Invitation” button or link to the above.

## If you keep using the default ConfirmationURL

If you keep `{{ .ConfirmationURL }}` in the template:

- The user is sent to Supabase, then redirected back to your site with tokens in the **hash**.
- We use full-page redirects (`window.location.replace`) so the hash is preserved when we send the user to `/auth/accept-invite`.
- This can still fail in some mobile or in-app browsers that drop the hash on redirect. Using the query-param link above avoids that.
