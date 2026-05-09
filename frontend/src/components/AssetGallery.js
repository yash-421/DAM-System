import React from 'react';
import AssetCard from './AssetCard';
import './AssetGallery.css';

function AssetGallery({ assets, loading, onDelete }) {
  if (loading) {
    return <div className="loading">Loading assets...</div>;
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="empty-state">
        <p>No assets found. Start by uploading a file!</p>
      </div>
    );
  }

  return (
    <div className="gallery">
      <h3>{assets.length} Asset{assets.length !== 1 ? 's' : ''} Found</h3>
      <div className="gallery-grid">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default AssetGallery;
