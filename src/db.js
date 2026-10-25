const Database = require('better-sqlite3');
const path = require('node:path');
const fs = require('node:fs');
const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data', 'gymflow.sqlite');
if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS treinos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  grupoMuscular TEXT NOT NULL,
  series INTEGER NOT NULL,
  repeticoes INTEGER NOT NULL,
  concluido INTEGER NOT NULL DEFAULT 0 CHECK (concluido IN (0, 1)),
  criadoEm TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
)`);
module.exports = db;
