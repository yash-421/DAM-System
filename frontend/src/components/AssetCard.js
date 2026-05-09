import React from 'react';
import './AssetCard.css';

function AssetCard({ asset, onDelete }) {
  const getFileIcon = (file_type) => {
    if (file_type.startsWith('image/')) return '🖼️';
    if (file_type === 'application/pdf') return '📄';
    if (file_type.startsWith('video/')) return '🎥';
    return '📁';
  };

  const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;


  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isImage = asset.fileType.startsWith('image/');

  return (
    <div className="asset-card">
      <div className="asset-preview">
        {isImage ? (
          <img
            src={`${API_BASE}/assets/${asset.filename}`}
            alt={asset.original_name}
            className="asset-image"
          />
        ) : (
          <div className="asset-icon">{getFileIcon(asset.fileType)}</div>
        )}
      </div>

      <div className="asset-info">
        <h4 title={asset.original_name}>{asset.original_name}</h4>
        <p className="file-type">{asset.file_type}</p>
        <p className="file-size">{formatFileSize(asset.file_size)}</p>
        <p className="upload-date">{formatDate(asset.upload_date)}</p>
        {asset.tags && <p className="tags">Tags: {asset.tags}</p>}
      </div>

      <div className="asset-actions">
        <a
          href={`${API_BASE}/assets/${asset.id}/download`}
          className="btn-download"
          title="Download"
        >
          ↓ Download
        </a>
        <button
          onClick={() => onDelete(asset.id)}
          className="btn-delete"
          title="Delete"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

export default AssetCard;
