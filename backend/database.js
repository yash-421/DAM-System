// Database initialization - supports both SQLite (dev) and PostgreSQL (production)
const path = require('path');

let db;
const isProd = process.env.NODE_ENV === 'production';

if (isProd) {
  // PostgreSQL for production
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render
  });

  // Initialize PostgreSQL schema
  pool.query(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      "originalName" TEXT NOT NULL,
      "fileType" TEXT NOT NULL,
      "fileSize" INTEGER NOT NULL,
      "uploadDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      tags TEXT,
      "filePath" TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_assets_originalName ON assets("originalName");
    CREATE INDEX IF NOT EXISTS idx_assets_fileType ON assets("fileType");
    CREATE INDEX IF NOT EXISTS idx_assets_tags ON assets(tags);
  `).catch(err => console.error('PostgreSQL init error:', err));

  // Wrapper for compatibility
  db = {
    run: (sql, params = [], callback) => {
      const pgSql = convertPlaceholders(sql);

      pool.query(pgSql, params)
        .then(() => callback && callback(null))
        .catch(err => callback && callback(err));
    },

    all: (sql, params = [], callback) => {
      const pgSql = convertPlaceholders(sql);

      pool.query(pgSql, params)
        .then(result => callback && callback(null, result.rows))
        .catch(err => callback && callback(err, []));
    },

    get: (sql, params = [], callback) => {
      const pgSql = convertPlaceholders(sql);

      pool.query(pgSql, params)
        .then(result => callback && callback(null, result.rows[0] || null))
        .catch(err => callback && callback(err, null));
    }
  };
    console.log('Using PostgreSQL for production');
} else {
  // SQLite for development
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, 'dam.db');

  db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error opening SQLite database:', err);
    } else {
      console.log('Connected to SQLite database');
    }
  });

  // Initialize SQLite schema
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS assets (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        originalName TEXT NOT NULL,
        fileType TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        uploadDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        filePath TEXT NOT NULL
      )
    `);
  });

  console.log('Using SQLite for development');
}

module.exports = db;
