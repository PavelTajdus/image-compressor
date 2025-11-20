import fs from 'fs';
import Database from 'better-sqlite3';

// Check if DB exists
if (!fs.existsSync('stats.db')) {
  console.log('❌ Database file not found!');
  process.exit(1);
}

const db = new Database('stats.db');

// Check if there are logs
const count = db.prepare('SELECT COUNT(*) as count FROM logs').get().count;
console.log(`Current log count: ${count}`);

if (count > 0) {
    const lastLog = db.prepare('SELECT * FROM logs ORDER BY id DESC LIMIT 1').get();
    console.log('Last log entry:', lastLog);
    console.log('✅ Logging seems to be working!');
} else {
    console.log('⚠️ No logs found yet. Run a compression first.');
}
