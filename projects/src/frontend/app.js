import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Navigation from './components/Navigation';
import axios from 'axios';

// API 기본 URL 설정
const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:3031/api';

// axios 인스턴스 생성
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

function App() {
    return (
        <Router>
            <div className="app-container">
                <Navigation />
                <main>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/history" element={<History />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;
