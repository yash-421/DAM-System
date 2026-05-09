import React, { useState } from 'react';
import './SearchFilter.css';

function SearchFilter({ onFilter }) {
  const [search, setSearch] = useState('');
  const [fileType, setFileType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tags, setTags] = useState('');
  const API_BASE = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api`;


  const handleFilter = () => {
    onFilter({
      search,
      fileType,
      startDate,
      endDate,
      tags
    });
  };

  const handleReset = () => {
    setSearch('');
    setFileType('');
    setStartDate('');
    setEndDate('');
    setTags('');
    onFilter({});
  };

  return (
    <div className="search-filter">
      <h3>Search & Filter</h3>
      
      <div className="filter-controls">
        <div className="filter-group">
          <label>Search:</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by filename..."
          />
        </div>

        <div className="filter-group">
          <label>File Type:</label>
          <select value={fileType} onChange={(e) => setFileType(e.target.value)}>
            <option value="">All Types</option>
            <option value="image/jpeg">JPEG</option>
            <option value="image/png">PNG</option>
            <option value="image/gif">GIF</option>
            <option value="application/pdf">PDF</option>
            <option value="video/mp4">MP4</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Tags:</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Search by tags..."
          />
        </div>

        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button onClick={handleFilter} className="btn-filter">Search</button>
          <button onClick={handleReset} className="btn-reset">Reset</button>
        </div>
      </div>
    </div>
  );
}

export default SearchFilter;
