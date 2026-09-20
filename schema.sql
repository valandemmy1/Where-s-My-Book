PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  start_city TEXT NOT NULL,
  start_region TEXT,
  start_country TEXT NOT NULL DEFAULT 'United States',
  starter_note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sightings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  country TEXT NOT NULL DEFAULT 'United States',
  event_type TEXT NOT NULL DEFAULT 'found',
  note TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sightings_book_id ON sightings(book_id);
CREATE INDEX IF NOT EXISTS idx_sightings_created_at ON sightings(created_at);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at);
