import React, { useState, useEffect } from 'react';
import Select from 'react-select';

function History() {
    const [history, setHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await fetch('/api/history');
            const data = await response.json();
            setHistory(data.results);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="history-page">
            <div className="search-section">
                <input
                    type="text"
                    placeholder="Search functions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select
                    isMulti
                    placeholder="Filter by tags..."
                    options={filters}
                    onChange={setFilters}
                />
            </div>
            <div className="history-list">
                {history.map((item) => (
                    <div key={item.metadata.functionHash} className="history-item">
                        <h3>{item.metadata.description}</h3>
                        <pre>{item.code}</pre>
                        <div className="metadata">
                            <span>Created: {new Date(item.metadata.timestamp).toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default History;
