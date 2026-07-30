import React, { useState } from 'react';
import { useKeyPointStore } from '../store/useKeyPointStore';
import { useContactStore } from '../store/useContactStore';
import { useUIStore } from '../store/useUIStore';
import { Plus, Edit3, Trash2, MessageCircle, Search } from 'lucide-react';

export default function KeyPointsPage({ searchTerm = '' }) {
    const keyPoints = useKeyPointStore((s) => s.keyPoints);
    const { toggleCovered, deleteKeyPoint } = useKeyPointStore();
    const contacts = useContactStore((s) => s.contacts);
    const { openKeyPointModal, showToast } = useUIStore();

    const [filter, setFilter] = useState('all');
    const [contactFilter, setContactFilter] = useState('');
    const [localSearch, setLocalSearch] = useState('');

    const query = (searchTerm || localSearch).toLowerCase();
    let list = keyPoints.filter((k) => k.text.toLowerCase().includes(query));

    if (filter === 'pending') list = list.filter((k) => !k.covered);
    if (filter === 'covered') list = list.filter((k) => k.covered);
    if (contactFilter) list = list.filter((k) => k.contact_id === contactFilter);

    return (
        <div className="stack stack-md">
            {/* Search */}
            <div style={{ position: 'relative' }}>
                <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="form-input" placeholder="Search key points..."
                    value={localSearch} onChange={(e) => setLocalSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }} />
            </div>

            {/* Filters */}
            <div className="pill-tabs">
                {['all', 'pending', 'covered'].map((f) => (
                    <button key={f} className={`pill-tab ${filter === f ? 'active' : ''}`}
                        onClick={() => setFilter(f)}>
                        {f === 'all' ? 'All' : f === 'pending' ? 'To Mention' : 'Covered'}
                    </button>
                ))}
            </div>

            {contacts.length > 0 && (
                <select className="form-select" value={contactFilter} onChange={(e) => setContactFilter(e.target.value)}
                    style={{ fontSize: '0.85rem' }}>
                    <option value="">All Contacts</option>
                    {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            )}

            <div className="section-header">
                <div>
                    <h3 className="section-title">Key Points</h3>
                    <p className="section-subtitle">{list.length} point{list.length !== 1 ? 's' : ''}</p>
                </div>
                <button className="btn btn-sm btn-primary" onClick={() => openKeyPointModal()}>
                    <Plus size={15} /> New
                </button>
            </div>

            {list.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <div className="empty-state-icon"><MessageCircle size={28} color="var(--text-tertiary)" /></div>
                        <p className="empty-state-title">No key points</p>
                        <p className="empty-state-text">Add things you want to remember to mention in your next conversation.</p>
                    </div>
                </div>
            ) : (
                <div className="stack stack-sm">
                    {list.map((kp) => {
                        const contact = contacts.find((c) => c.id === kp.contact_id);
                        return (
                            <div key={kp.id} className="card" style={{ padding: '0.85rem 1rem' }}>
                                <div className="row row-gap-md">
                                    <input type="checkbox" className="custom-check" checked={kp.covered}
                                        onChange={() => { toggleCovered(kp.id); showToast(kp.covered ? 'Unmarked' : 'Covered!', 'success'); }} />
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{
                                            fontSize: '0.9rem', fontWeight: 500,
                                            textDecoration: kp.covered ? 'line-through' : 'none',
                                            color: kp.covered ? 'var(--text-tertiary)' : 'var(--text-primary)'
                                        }}>{kp.text}</p>
                                        <div className="row row-gap-sm" style={{ marginTop: '0.25rem' }}>
                                            {contact && (
                                                <span className="text-xs text-muted" style={{ fontWeight: 600 }}>{contact.name}</span>
                                            )}
                                            <span className={`badge ${kp.covered ? 'badge-green' : 'badge-amber'}`}>
                                                {kp.covered ? 'Covered' : 'Pending'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="row row-gap-sm" style={{ flexShrink: 0 }}>
                                        <button className="btn-icon" style={{ width: 32, height: 32 }}
                                            onClick={() => openKeyPointModal(kp, kp.contact_id)}>
                                            <Edit3 size={14} />
                                        </button>
                                        <button className="btn-icon" style={{ width: 32, height: 32, color: 'var(--rose)' }}
                                            onClick={() => { if (confirm('Delete this point?')) { deleteKeyPoint(kp.id); showToast('Deleted', 'info'); } }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
