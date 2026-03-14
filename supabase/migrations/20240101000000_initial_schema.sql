-- ============================================================
-- Red Binder — Initial Schema
-- Week 1: Lock in schema before any code is written
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#C0392B',
  icon        TEXT NOT NULL DEFAULT '📌',
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can only access their own categories"
  ON categories FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- BOOKS / SOURCES
-- ============================================================
CREATE TABLE books (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  author      TEXT,
  cover_url   TEXT,
  notes       TEXT,
  finished_at DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can only access their own books"
  ON books FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TAGS
-- ============================================================
CREATE TABLE tags (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can only access their own tags"
  ON tags FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- ENTRIES — core atom of the app
-- ============================================================
CREATE TYPE entry_type_enum AS ENUM (
  'book', 'article', 'podcast', 'video', 'conversation', 'experience', 'other'
);

CREATE TYPE entry_status_enum AS ENUM (
  'not_applied', 'in_progress', 'applied'
);

CREATE TABLE entries (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id         UUID REFERENCES categories(id) ON DELETE SET NULL,
  book_id             UUID REFERENCES books(id) ON DELETE SET NULL,

  title               TEXT NOT NULL,
  entry_type          entry_type_enum NOT NULL DEFAULT 'other',
  source              TEXT,            -- free-text source name
  quote               TEXT,            -- key quote or passage
  reflection          TEXT,            -- user's personal reflection

  -- Application section (JSONB for flexibility — locked decision)
  application         JSONB DEFAULT '{}',
  -- Shape: {
  --   plan: string,        -- what I'll do
  --   when: string,        -- by when
  --   signal: string,      -- how I'll know it worked
  --   smallest_test: string,
  --   result: string       -- filled in after attempt
  -- }

  status              entry_status_enum NOT NULL DEFAULT 'not_applied',

  ai_category_suggestion  TEXT,       -- cached AI suggestion (Week 5)
  ai_processed_at         TIMESTAMPTZ,

  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can only access their own entries"
  ON entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Full-text search index
CREATE INDEX entries_fts_idx ON entries
  USING GIN (to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(quote, '') || ' ' || COALESCE(reflection, '') || ' ' || COALESCE(source, '')));

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ENTRY_TAGS (many-to-many)
-- ============================================================
CREATE TABLE entry_tags (
  entry_id    UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  tag_id      UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (entry_id, tag_id)
);

ALTER TABLE entry_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can only access their own entry_tags"
  ON entry_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM entries e WHERE e.id = entry_id AND e.user_id = auth.uid()
    )
  );

-- ============================================================
-- ENTRY_LINKS (related entry connections)
-- ============================================================
CREATE TABLE entry_links (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_a_id  UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  entry_b_id  UUID NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (entry_a_id <> entry_b_id),
  UNIQUE(entry_a_id, entry_b_id)
);

ALTER TABLE entry_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can only access their own entry_links"
  ON entry_links FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM entries e WHERE e.id = entry_a_id AND e.user_id = auth.uid()
    )
  );

-- ============================================================
-- RITUALS
-- ============================================================
CREATE TYPE ritual_type_enum AS ENUM ('daily', 'weekly');

CREATE TABLE rituals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ritual_type   ritual_type_enum NOT NULL,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  entry_id      UUID REFERENCES entries(id) ON DELETE SET NULL, -- entry reviewed
  ai_prompt     TEXT,     -- AI prompt shown (cached)
  response_data JSONB DEFAULT '{}', -- user answers per step
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users can only access their own rituals"
  ON rituals FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- SEED DEFAULT CATEGORIES (called per user on signup)
-- ============================================================
CREATE OR REPLACE FUNCTION seed_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO categories (user_id, name, color, icon, sort_order) VALUES
    (p_user_id, 'Mindset',      '#C0392B', '🧠', 0),
    (p_user_id, 'Leadership',   '#8E44AD', '👑', 1),
    (p_user_id, 'Productivity', '#2980B9', '⚡', 2),
    (p_user_id, 'Relationships','#27AE60', '🤝', 3),
    (p_user_id, 'Health & Body','#E67E22', '💪', 4),
    (p_user_id, 'Finance',      '#F39C12', '💰', 5),
    (p_user_id, 'Creativity',   '#16A085', '🎨', 6),
    (p_user_id, 'Philosophy',   '#7F8C8D', '🔭', 7);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: seed categories for new users
CREATE OR REPLACE FUNCTION on_auth_user_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM seed_default_categories(NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION on_auth_user_created();
