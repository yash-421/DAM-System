# Digital Asset Management (DAM) System

A full-stack web application for managing and organizing digital assets (images, PDFs, videos). Built with Node.js/Express backend and React frontend.

## Quick Start

### Prerequisites
- Node.js 14+ and npm
- SQLite3 (included with sqlite3 npm package)

### Installation & Running

#### Backend Setup
```bash
cd backend
npm install
npm start
```
Server runs on `http://localhost:5000`

#### Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm start
```
App runs on `http://localhost:3000`

## Features

### Frontend
✓ **Asset Upload**: Drag-and-drop or file picker for images, PDFs, and videos
✓ **Gallery View**: Thumbnail preview of all assets
✓ **Search & Filter**: Filter by filename, file type, tags, and date range
✓ **Download**: Download individual assets
✓ **Delete**: Remove assets with confirmation
✓ **Upload Progress**: Real-time progress indicator during uploads
✓ **Error Handling**: User-friendly error messages for upload failures

### Backend
✓ **RESTful API**: Complete CRUD operations for assets
✓ **File Storage**: Local file storage with unique filenames
✓ **Metadata Tracking**: Stores filename, type, size, and upload date
✓ **Database**: SQLite for persistent storage
✓ **File Validation**: Only allows supported file types
✓ **Search & Filtering**: Query by multiple criteria simultaneously

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assets/upload` | Upload a new asset |
| GET | `/api/assets` | Get all assets (supports filtering) |
| GET | `/api/assets/:id` | Get asset metadata |
| GET | `/api/assets/:id/download` | Download asset file |
| PUT | `/api/assets/:id` | Update asset tags |
| DELETE | `/api/assets/:id` | Delete asset |

## Query Parameters

For filtering via GET `/api/assets`:
- `search`: Search by filename
- `fileType`: Filter by MIME type
- `tags`: Search by tags
- `startDate`: Filter by start date
- `endDate`: Filter by end date

## Supported File Types
- **Images**: JPEG, PNG, GIF
- **Documents**: PDF
- **Video**: MP4

## Project Structure

```
project/
├── backend/
│   ├── server.js          # Express app & routes
│   ├── database.js        # SQLite initialization
│   ├── package.json
│   ├── .env
│   └── uploads/           # Uploaded files stored here
│
└── frontend/
    ├── src/
    │   ├── App.js         # Main app component
    │   ├── components/
    │   │   ├── AssetUploader.js
    │   │   ├── AssetGallery.js
    │   │   ├── SearchFilter.js
    │   │   └── AssetCard.js
    │   ├── index.js
    │   └── index.css
    ├── public/
    │   └── index.html
    └── package.json
```

## Development Notes

See `DEVELOPMENT.md` for detailed documentation on:
- AI prompts used during development
- Challenges faced and solutions
- Architecture decisions
- Human vs AI work breakdown
