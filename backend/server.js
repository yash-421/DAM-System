const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./database');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env"
    : ".env.local";
require("dotenv").config({ path: envFile });

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Routes

// Upload asset
app.post('/api/assets/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const assetId = uuidv4();
  const { tags } = req.body;

  const sql = `
    INSERT INTO assets (id, filename, original_name, file_type, file_size, tags, file_path)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(
    sql,
    [
      assetId,
      req.file.filename,
      req.file.originalname,
      req.file.mimetype,
      req.file.size,
      tags || '',
      req.file.path
    ],
    (err) => {
      if (err) {
        fs.unlinkSync(req.file.path);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({
        id: assetId,
        filename: req.file.filename,
        original_name: req.file.originalname,
        file_type: req.file.mimetype,
        file_size: req.file.size,
        upload_date: new Date().toISOString(),
        tags: tags || '',
        file_url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      });
    }
  );
});

// Get all assets
app.get('/api/assets', (req, res) => {
  const { search, fileType, startDate, endDate, tags } = req.query;
  let sql = 'SELECT * FROM assets WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (original_name LIKE ? OR filename LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (fileType) {
    sql += ' AND file_type = ?';
    params.push(fileType);
  }

  if (tags) {
    sql += ' AND tags LIKE ?';
    params.push(`%${tags}%`);
  }

  if (startDate) {
    sql += ' AND upload_date >= ?';
    params.push(startDate);
  }

  if (endDate) {
    sql += ' AND upload_date <= ?';
    params.push(endDate);
  }

  sql += ' ORDER BY upload_date DESC';

  console.log("Query:" , sql);
  console.log("Params:" , params);
  
  

  db.all(sql, params, (err, rows) => {
    if (err) {
      console.log(err);
      
      return res.status(500).json({ error: 'Database error' });
    }
    const assets = rows.map(asset => ({
      ...asset,
      file_url: `${req.protocol}://${req.get('host')}/uploads/${asset.filename}`
    }));

    res.json(assets);

  });
});

// Get single asset metadata
app.get('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM assets WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(row);
  });
});

// Download asset
app.get('/api/assets/:id/download', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM assets WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.download(row.file_path, row.original_name);
  });
});

// Delete asset
app.delete('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM assets WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    db.run('DELETE FROM assets WHERE id = ?', [id], (deleteErr) => {
      if (deleteErr) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (fs.existsSync(row.file_path)) {
        fs.unlinkSync(row.file_path);
      }

      res.json({ message: 'Asset deleted successfully' });
    });
  });
});

// Update asset tags
app.put('/api/assets/:id', (req, res) => {
  const { id } = req.params;
  const { tags } = req.body;

  db.run(
    'UPDATE assets SET tags = ? WHERE id = ?',
    [tags || '', id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Asset updated successfully' });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`DAM Backend running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
