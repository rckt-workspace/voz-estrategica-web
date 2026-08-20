# Soro Webhook Integration - Edge Function

Infrastructure for receiving Soro SEO webhook events via Supabase Edge Function.

## Architecture

```
Soro SEO (external)
    ↓
Edge Function (Supabase/Lovable Cloud)
    ├─ Validates Bearer token (SORO_WEBHOOK_SECRET)
    ├─ Parses JSON
    ├─ Calculates SHA-256 hash
    ├─ Inserts into soro_webhook_events (with service role)
    └─ Handles duplicates via UNIQUE constraint
         ↓
    soro_webhook_events table (RLS protected)
```

## Endpoint

**POST** `https://<project-ref>.supabase.co/functions/v1/soro-webhook`

Example (replace `<project-ref>` with your Supabase project reference):
```
https://eyebjcvagagztrfsllir.supabase.co/functions/v1/soro-webhook
```

## Authentication

The Edge Function validates the secret via:

### Method 1: Authorization Header (Recommended)
```
Authorization: Bearer <SORO_WEBHOOK_SECRET>
```

### Method 2: X-Soro-Secret Header (Fallback)
```
X-Soro-Secret: <SORO_WEBHOOK_SECRET>
```

**Important:** The secret is configured in Lovable Cloud's Edge Function environment, NOT in Hostinger or frontend.

## Request Example

```bash
SORO_SECRET="your-secret-key"
WEBHOOK_URL="https://eyebjcvagagztrfsllir.supabase.co/functions/v1/soro-webhook"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SORO_SECRET" \
  -d '{
    "event_type": "post_created",
    "title": "My Blog Post",
    "slug": "my-blog-post",
    "content": "Post content here..."
  }'
```

## Response Formats

### Success (200 OK) - New Event
```json
{
  "status": 200,
  "ok": true,
  "received_at": "2026-08-20T12:30:00.000Z",
  "payload_hash": "abc123def456..."
}
```

### Success (200 OK) - Duplicate Event
```json
{
  "status": 200,
  "ok": true,
  "duplicate": true,
  "payload_hash": "abc123def456..."
}
```

Duplicate detection is automatic via PostgreSQL UNIQUE constraint on `payload_hash`. No race conditions.

### Authentication Error (401)
```json
{
  "status": 401,
  "error": "Unauthorized"
}
```

### Bad Request (400)
```json
{
  "status": 400,
  "error": "Content-Type must be application/json"
}
```

Or:
```json
{
  "status": 400,
  "error": "Invalid JSON payload"
}
```

### Method Not Allowed (405)
```json
{
  "status": 405,
  "error": "Method not allowed"
}
```

### Server Error (500)
```json
{
  "status": 500,
  "error": "Internal server error"
}
```

## Database Schema

### soro_webhook_events
**Fully private (RLS denies all public/authenticated access)**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| received_at | timestamptz | Webhook receipt time |
| payload_hash | text | **UNIQUE** - SHA-256(payload) |
| event_type | text | Event type from payload |
| payload | jsonb | Complete raw payload |
| processed | boolean | Processing flag (false by default) |
| error | text | Error message if processing failed |
| created_at | timestamptz | Insertion timestamp |

**Idempotency:** PostgreSQL enforces uniqueness of `payload_hash`. Duplicate webhook requests automatically fail the INSERT with error code 23505, which the Edge Function interprets as `duplicate: true` (HTTP 200).

### blog_posts
**Public read-only for published posts**

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | Primary key |
| soro_id | text | Soro post ID (set later) |
| slug | text | **UNIQUE** - URL slug |
| title | text | Post title |
| excerpt | text | Short excerpt |
| content_html | text | HTML content |
| content_markdown | text | Markdown source |
| seo_title | text | SEO title tag |
| seo_description | text | SEO meta description |
| focus_keyword | text | Target keyword |
| featured_image_url | text | Featured image URL |
| author_name | text | Author name |
| canonical_url | text | Canonical URL |
| status | text | 'draft' \| 'published' \| 'archived' |
| published_at | timestamptz | Publication timestamp |
| raw_payload | jsonb | Original Soro payload |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update (auto-updated) |

**RLS Policies:**
- Public: SELECT only where `status = 'published'`
- Authenticated (admin): All operations

## Environment Variables

### Lovable Cloud (Edge Function only)

```
SORO_WEBHOOK_SECRET=<secure-random-string>
SUPABASE_URL=<automatic>
SUPABASE_SERVICE_ROLE_KEY=<automatic>
```

**SUPABASE_SERVICE_ROLE_KEY** is provided automatically by Lovable Cloud and is used ONLY inside the Edge Function runtime. It is **never** exposed to Hostinger, frontend, or `.env.example`.

### Hostinger (Removed)

No Soro-specific variables needed in Hostinger. The webhook is entirely handled by Supabase Edge Functions.

## Configuration in Lovable Cloud

1. **Create/Update Secret:**
   - Dashboard → Supabase Project → Settings → Edge Functions
   - Add: `SORO_WEBHOOK_SECRET=<value>`
   - Generate: `openssl rand -base64 32`

2. **Deploy Edge Function:**
   ```bash
   supabase functions deploy soro-webhook
   ```

3. **Configure in Soro:**
   - Webhook URL: `https://eyebjcvagagztrfsllir.supabase.co/functions/v1/soro-webhook`
   - Authorization: `Bearer <SORO_WEBHOOK_SECRET>`
   - Method: `POST`
   - Content-Type: `application/json`

## Security Notes

- ✅ **Bearer token validation** - Required for every request
- ✅ **SHA-256 hashing** - Payload integrity check
- ✅ **Unique constraint idempotency** - No duplicate processing possible
- ✅ **RLS protection** - `soro_webhook_events` inaccessible from public/frontend
- ✅ **Service role isolation** - `SUPABASE_SERVICE_ROLE_KEY` is Edge Function-only
- ✅ **No secret logging** - Secrets never appear in logs
- ❌ **No payload logging in production** - Raw payloads not logged

## Verification Queries

### Check Webhook Events
```sql
SELECT
  id,
  payload_hash,
  event_type,
  received_at,
  processed
FROM public.soro_webhook_events
ORDER BY received_at DESC
LIMIT 10;
```

### Verify No Duplicates
```sql
SELECT payload_hash, COUNT(*) as count
FROM public.soro_webhook_events
GROUP BY payload_hash
HAVING COUNT(*) > 1;
```

Expected: Empty result (all hashes are unique).

### Check Processing Status
```sql
SELECT
  processed,
  COUNT(*) as total,
  MAX(received_at) as latest
FROM public.soro_webhook_events
GROUP BY processed
ORDER BY processed DESC;
```

## Logs

Check Lovable Cloud Edge Function logs for:

```
[soro-webhook] Webhook received (id: ..., hash: ..., event_type: ...)
[soro-webhook] Duplicate webhook received (payload_hash already exists)
[soro-webhook] Authentication failed
[soro-webhook] Invalid Content-Type: ...
[soro-webhook] Invalid JSON
```

## Future: Processing

Currently, the Edge Function **only receives and stores**. Processing (mapping payload → blog_posts) will be implemented in Phase 2 once the Soro payload contract is finalized.

Example future job:
```
1. SELECT * FROM soro_webhook_events WHERE processed = false
2. Map payload fields → blog_posts table
3. INSERT/UPDATE blog_posts
4. Mark processed = true
5. Handle errors → set error column
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 Unauthorized | Check SORO_WEBHOOK_SECRET value matches in Lovable Cloud |
| 400 Content-Type | Verify `-H "Content-Type: application/json"` is sent |
| 400 Invalid JSON | Validate payload is valid JSON |
| 500 Server Error | Check Lovable Cloud logs for errors |
| Duplicates appearing | Should not happen - UNIQUE constraint enforces idempotency |

## References

- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [PostgreSQL UNIQUE Constraint](https://www.postgresql.org/docs/current/ddl-constraints.html#id1.5.4.6.6)
- [OWASP Webhook Security](https://owasp.org/www-community/attacks/Webhook_Attack)
