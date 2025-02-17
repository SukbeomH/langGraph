import React from 'react';
import { Link } from 'react-router-dom';

function Navigation() {
    return (
        <nav className="navigation">
            <ul>
                <li><Link to="/">대시보드</Link></li>
                <li><Link to="/history">히스토리</Link></li>
            </ul>
        </nav>
    );
}

export default Navigation;
