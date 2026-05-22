-- ═══════════════════════════════════════════════════
-- EXTENSIONES
-- ═══════════════════════════════════════════════════
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ═══════════════════════════════════════════════════
-- MESAS
-- ═══════════════════════════════════════════════════
CREATE TABLE tables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number int NOT NULL UNIQUE,
  name text,
  capacity int DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- INVITADOS
-- ═══════════════════════════════════════════════════
CREATE TABLE guests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text,
  phone text,
  group_label text,
  table_id uuid REFERENCES tables(id) ON DELETE SET NULL,
  qr_token text UNIQUE DEFAULT encode(gen_random_bytes(8), 'hex'),
  rsvp_status text DEFAULT 'pending'
    CHECK (rsvp_status IN ('pending', 'confirmed', 'declined')),
  dietary_restrictions text,
  plus_one boolean DEFAULT false,
  plus_one_name text,
  plus_one_dietary text,
  is_admin boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_guests_name ON guests
  USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_guests_qr ON guests (qr_token);

-- ═══════════════════════════════════════════════════
-- FOTOS
-- ═══════════════════════════════════════════════════
CREATE TABLE photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploaded_by text NOT NULL,
  storage_path text NOT NULL,
  thumb_path text,
  caption text,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- MENSAJES / LIBRO DE VISITAS
-- ═══════════════════════════════════════════════════
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  content text,
  audio_path text,
  is_approved boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ═══════════════════════════════════════════════════
-- JUEGO (KAHOOT)
-- ═══════════════════════════════════════════════════
CREATE TABLE game_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  options jsonb NOT NULL,
  time_limit_sec int DEFAULT 20,
  sort_order int NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE game_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  status text DEFAULT 'lobby'
    CHECK (status IN ('lobby', 'question', 'reveal', 'leaderboard', 'finished')),
  current_question_idx int DEFAULT 0,
  question_started_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE game_players (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_name text NOT NULL,
  avatar_emoji text DEFAULT '😊',
  total_score int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (session_id, player_name)
);

CREATE TABLE game_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES game_sessions(id) ON DELETE CASCADE,
  player_id uuid REFERENCES game_players(id) ON DELETE CASCADE,
  question_id uuid REFERENCES game_questions(id) ON DELETE CASCADE,
  selected_option int NOT NULL,
  is_correct boolean NOT NULL,
  response_time_ms int NOT NULL,
  points_awarded int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (session_id, player_id, question_id)
);

-- ═══════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════════

-- Guests: lectura pública, escritura restringida
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "guests_read" ON guests FOR SELECT USING (true);
CREATE POLICY "guests_update_rsvp" ON guests FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Tables: solo lectura
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tables_read" ON tables FOR SELECT USING (true);

-- Photos: lectura pública, inserción pública
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "photos_read" ON photos FOR SELECT USING (true);
CREATE POLICY "photos_insert" ON photos FOR INSERT WITH CHECK (true);

-- Messages: lectura pública, inserción pública
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_read" ON messages FOR SELECT USING (true);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (true);

-- Game tables: lectura pública
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_read" ON game_questions FOR SELECT USING (true);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions_read" ON game_sessions FOR SELECT USING (true);
CREATE POLICY "sessions_update" ON game_sessions FOR UPDATE USING (true);

ALTER TABLE game_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "players_read" ON game_players FOR SELECT USING (true);
CREATE POLICY "players_insert" ON game_players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_update" ON game_players FOR UPDATE USING (true);

ALTER TABLE game_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "answers_read" ON game_answers FOR SELECT USING (true);
CREATE POLICY "answers_insert" ON game_answers FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════════════
-- STORAGE BUCKET PARA FOTOS
-- ═══════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "photos_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos');
CREATE POLICY "photos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

-- ═══════════════════════════════════════════════════
-- STORAGE BUCKET PARA AUDIO (MENSAJES DE VOZ)
-- ═══════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('audio', 'audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "audio_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'audio');
CREATE POLICY "audio_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'audio');

-- ═══════════════════════════════════════════════════
-- REALTIME: habilitar para tablas que lo necesitan
-- ═══════════════════════════════════════════════════
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE game_players;
ALTER PUBLICATION supabase_realtime ADD TABLE game_answers;
