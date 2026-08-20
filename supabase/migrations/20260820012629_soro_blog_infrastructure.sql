-- Create soro_webhook_events table (internal, not publicly accessible)
CREATE TABLE public.soro_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  received_at timestamptz NOT NULL DEFAULT now(),
  payload_hash text NOT NULL UNIQUE,
  event_type text,
  payload jsonb NOT NULL,
  processed boolean NOT NULL DEFAULT false,
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for soro_webhook_events
CREATE INDEX idx_soro_webhook_events_received_at ON public.soro_webhook_events(received_at DESC);
CREATE INDEX idx_soro_webhook_events_processed ON public.soro_webhook_events(processed);
CREATE INDEX idx_soro_webhook_events_event_type ON public.soro_webhook_events(event_type);

-- RLS for soro_webhook_events - NO public access
ALTER TABLE public.soro_webhook_events ENABLE ROW LEVEL SECURITY;

-- Deny all access at table level (only service role can bypass via Edge Function)
CREATE POLICY "deny_all_select" ON public.soro_webhook_events
  FOR SELECT USING (false);
CREATE POLICY "deny_all_insert" ON public.soro_webhook_events
  FOR INSERT WITH CHECK (false);
CREATE POLICY "deny_all_update" ON public.soro_webhook_events
  FOR UPDATE USING (false);
CREATE POLICY "deny_all_delete" ON public.soro_webhook_events
  FOR DELETE USING (false);

-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  soro_id text UNIQUE,
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content_html text,
  content_markdown text,
  seo_title text,
  seo_description text,
  focus_keyword text,
  featured_image_url text,
  author_name text,
  canonical_url text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_published_at CHECK (
    (status = 'published' AND published_at IS NOT NULL) OR status != 'published'
  )
);

-- Indexes for blog_posts
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX idx_blog_posts_soro_id ON public.blog_posts(soro_id);
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC);

-- RLS for blog_posts - public read only for published posts
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "public_read_published" ON public.blog_posts
  FOR SELECT USING (status = 'published');

-- Authenticated users (admin) can do everything
CREATE POLICY "admin_all" ON public.blog_posts
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for blog_posts updated_at
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
