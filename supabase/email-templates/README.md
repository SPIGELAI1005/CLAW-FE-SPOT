# CLAW:FE SPOT — Supabase Email Templates

Custom email templates matching the app's design language.

## Templates

| Template | File | Supabase Template Type |
|---|---|---|
| Magic Link | `magic-link.html` | **Magic Link** |
| Confirm Signup | `confirm-signup.html` | **Confirm signup** |
| Reset Password | `reset-password.html` | **Reset Password** |

## How to Apply

### Option 1: Supabase Dashboard (Recommended)

1. Go to **Authentication** > **Email Templates** in your Supabase project dashboard
2. For each template type:
   - Select the template type (e.g., "Magic Link")
   - Replace the **Body** field with the contents of the corresponding HTML file
   - Update the **Subject** line (see below)
   - Click **Save**

### Subject Lines

| Template | Subject |
|---|---|
| Magic Link | `Sign in to CLAW:FE SPOT` |
| Confirm signup | `Welcome to CLAW:FE SPOT — Confirm your email` |
| Reset Password | `Reset your CLAW:FE SPOT password` |

### Option 2: Supabase `config.toml` (Local Development)

Add the following to your `supabase/config.toml`:

```toml
[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = true

[auth.email.template.magic_link]
subject = "Sign in to CLAW:FE SPOT"
content_path = "./supabase/email-templates/magic-link.html"

[auth.email.template.confirmation]
subject = "Welcome to CLAW:FE SPOT — Confirm your email"
content_path = "./supabase/email-templates/confirm-signup.html"

[auth.email.template.recovery]
subject = "Reset your CLAW:FE SPOT password"
content_path = "./supabase/email-templates/reset-password.html"
```

### Option 3: Supabase Management API

```bash
# Update magic link template
curl -X PUT "https://api.supabase.com/v1/projects/{project_ref}/config/auth" \
  -H "Authorization: Bearer {service_role_key}" \
  -H "Content-Type: application/json" \
  -d '{
    "mailer_templates_magic_link_content": "<contents of magic-link.html>",
    "mailer_subjects_magic_link": "Sign in to CLAW:FE SPOT"
  }'
```

## Template Variables

These Supabase variables are used in the templates:

| Variable | Description |
|---|---|
| `{{ .ConfirmationURL }}` | The magic link / confirmation URL |
| `{{ .Email }}` | User's email address |
| `{{ .SiteURL }}` | Your app's site URL |

## Design Tokens Used

| Token | Value | Usage |
|---|---|---|
| Background | `#faf8f5` | Email body background |
| Card background | `#ffffff` | Main card container |
| Card border | `#f0ece7` | Card border color |
| Text primary | `#1c1917` | Headings |
| Text secondary | `#78716c` | Body text |
| Text muted | `#a8a29e` | Fine print, captions |
| Accent gradient | `#f59e0b → #f97316 → #ea580c` | CTA button |
| Border radius | `24px` | Card corners |
| Button radius | `14px` | CTA button corners |
| Member color | `#0284c7` / `#e0f2fe` | Role badge |
| Pilot color | `#d97706` / `#fef3c7` | Role badge |
| Agent color | `#059669` / `#d1fae5` | Role badge |

## Dark Mode

Templates include `@media (prefers-color-scheme: dark)` styles for email clients that support it (Apple Mail, Outlook.com, etc.). Dark mode uses:

- Background: `#1c1917`
- Card: `#292524`
- Text: `#fafaf9`
