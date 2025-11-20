import Database from 'better-sqlite3';

const db = new Database('stats.db');

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    filename TEXT,
    original_size INTEGER,
    mime_type TEXT,
    compressed_size INTEGER,
    savings_percent INTEGER,
    output_format TEXT
  )
`);

// Migration: Add output_format column if it doesn't exist (for existing DBs)
try {
  db.exec('ALTER TABLE logs ADD COLUMN output_format TEXT');
} catch (error) {
  // Column likely already exists, ignore
}

export function addLog(entry) {
  const stmt = db.prepare(`
    INSERT INTO logs (filename, original_size, mime_type, compressed_size, savings_percent, output_format)
    VALUES (@filename, @original_size, @mime_type, @compressed_size, @savings_percent, @output_format)
  `);
  return stmt.run(entry);
}

export function getStats() {
  const totalImages = db.prepare('SELECT COUNT(*) as count FROM logs').get().count;
  const totalOriginalSize = db.prepare('SELECT SUM(original_size) as size FROM logs').get().size || 0;
  const totalCompressedSize = db.prepare('SELECT SUM(compressed_size) as size FROM logs').get().size || 0;
  
  const totalSavings = totalOriginalSize > 0 
    ? Math.round((1 - totalCompressedSize / totalOriginalSize) * 100) 
    : 0;

  const recentLogs = db.prepare('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50').all();

  // Group by input type
  const inputStats = db.prepare(`
    SELECT mime_type, COUNT(*) as count 
    FROM logs 
    GROUP BY mime_type 
    ORDER BY count DESC
  `).all();

  // Group by output format
  const outputStats = db.prepare(`
    SELECT output_format, COUNT(*) as count 
    FROM logs 
    WHERE output_format IS NOT NULL 
    GROUP BY output_format 
    ORDER BY count DESC
  `).all();

  return {
    totalImages,
    totalOriginalSize,
    totalCompressedSize,
    totalSavings,
    recentLogs,
    inputStats,
    outputStats
  };
}
