import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import AssetUploader from './components/AssetUploader';
import AssetGallery from './components/AssetGallery';
import SearchFilter from './components/SearchFilter';
import dotenv from 'dotenv';

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env"
    : ".env.local";
dotenv.config({ path: envFile });

function App() {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/assets`);
      setAssets(response.data);
      setFilteredAssets(response.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      alert('Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetUploaded = () => {
    fetchAssets();
  };

  const handleFilter = async (filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.fileType) params.append('fileType', filters.fileType);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.tags) params.append('tags', filters.tags);

      const response = await axios.get(
        `${API_BASE}/assets?${params.toString()}`
      );
      setFilteredAssets(response.data);
    } catch (error) {
      console.error('Error filtering assets:', error);
      alert('Failed to filter assets');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await axios.delete(`${API_BASE}/assets/${assetId}`);
        fetchAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
        alert('Failed to delete asset');
      }
    }
  };

  return (
    <div>
      <header>
        <div className="container">
          <h1>Digital Asset Management System</h1>
        </div>
      </header>

      <div className="container">
        <div className="main-content">
          <div className="uploader-section">
            <AssetUploader onUploadSuccess={handleAssetUploaded} />
          </div>

          <div className="gallery-section">
            <SearchFilter onFilter={handleFilter} />
            <AssetGallery
              assets={filteredAssets}
              loading={loading}
              onDelete={handleDeleteAsset}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
