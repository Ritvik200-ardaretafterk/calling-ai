import React from 'react';
import { useUIStore } from '../store/useUIStore';

export default function Navbar() {
    const { activeTab } = useUIStore();

    const titles = {
        dashboard: 'Home',
        contacts: 'Contacts',
        todos: 'Tasks',
        'key-points': 'Key Points',
        'voice-notes': 'Voice Notes',
        profile: 'Profile',
        meeting: 'Live Assistant'
    };

    return (
        <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
            paddingTop: '0.25rem'
        }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                {titles[activeTab] || 'ConvoPilot'}
            </h1>

            <span className="badge" style={{ background: 'var(--surface-container-high)', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 600 }}>
                Ready
            </span>
        </header>
    );
}
