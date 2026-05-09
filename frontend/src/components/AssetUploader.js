import React, { useState } from 'react';
import axios from 'axios';
import './AssetUploader.css';

function AssetUploader({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [tags, setTags] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (selectedFile) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'video/mp4'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Allowed: JPG, PNG, GIF, PDF, MP4');
        setFile(null);
        return;
      }

      const maxSize = 100 * 1024 * 1024; // 100MB
      if (selectedFile.size > maxSize) {
        setError('File size exceeds 100MB limit');
        setFile(null);
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('tags', tags);

    setUploading(true);
    setUploadProgress(0);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/assets/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        }
      );

      setSuccess(`✓ File uploaded successfully: ${response.data.originalName}`);
      setFile(null);
      setTags('');
      setUploadProgress(0);
      document.getElementById('fileInput').value = '';

      if (onUploadSuccess) {
        setTimeout(onUploadSuccess, 1000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.message ||
        'Upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="uploader">
      <h2>Upload Asset</h2>
      <form onSubmit={handleUpload}>
        <div className="form-group">
          <label htmlFor="fileInput">Select File:</label>
          <input
            id="fileInput"
            type="file"
            onChange={handleFileChange}
            disabled={uploading}
            accept="image/*,.pdf,video/mp4"
          />
          <p className="file-types">Supported: JPG, PNG, GIF, PDF, MP4</p>
        </div>

        <div className="form-group">
          <label htmlFor="tagsInput">Tags (optional):</label>
          <input
            id="tagsInput"
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., logo, design, 2024"
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${uploadProgress}%` }}>
              {uploadProgress}%
            </div>
          </div>
        )}

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <button type="submit" disabled={uploading || !file} className="btn-primary">
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}

export default AssetUploader;
