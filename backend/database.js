// Database initialization - supports both SQLite (dev) and PostgreSQL (production)
const path = require('path');
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env"
    : ".env.local";
require("dotenv").config({ path: envFile });
let db;
const isProd = process.env.NODE_ENV === 'production';

function convertPlaceholders(sql) {
  let i = 1;
  return sql.replace(/\?/g, () => `$${i++}`);
}


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
      original_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      tags TEXT,
      file_path TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_assets_originalName ON assets(original_name);
    CREATE INDEX IF NOT EXISTS idx_assets_fileType ON assets(file_type);
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
        original_name TEXT NOT NULL,
        file_type TEXT NOT NULL,
        file_size INTEGER NOT NULL,
        upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        tags TEXT,
        file_path TEXT NOT NULL
      )
    `);
  });

  console.log('Using SQLite for development');
}

module.exports = db;
