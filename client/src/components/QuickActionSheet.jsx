import React, { useState } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useContactStore } from '../store/useContactStore';
import { CheckSquare, UserPlus, Pin, Mic, X, ChevronRight } from 'lucide-react';

export default function QuickActionSheet() {
    const { isQuickActionSheetOpen, closeQuickActionSheet, openTodoModal, openContactModal, openKeyPointModal, setActiveTab } = useUIStore();
    const contacts = useContactStore((s) => s.contacts);

    const [showContactPicker, setShowContactPicker] = useState(false);

    if (!isQuickActionSheetOpen) return null;

    const handleSelectContactForKeyPoint = (contactId) => {
        setShowContactPicker(false);
        closeQuickActionSheet();
        openKeyPointModal(null, contactId);
    };

    return (
        <div
            onClick={() => {
                setShowContactPicker(false);
                closeQuickActionSheet();
            }}
            style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(22, 29, 30, 0.65)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                zIndex: 200,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                padding: '1rem',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    background: '#ffffff',
                    borderRadius: 'var(--radius-xl)',
                    padding: '1.5rem',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.2)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    marginBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))',
                    animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Sheet Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                            FAST ENTRY POINT
                        </span>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                            {showContactPicker ? 'Select Contact for Key Point' : 'Quick Actions'}
                        </h3>
                    </div>
                    <button
                        className="btn-icon"
                        onClick={() => {
                            setShowContactPicker(false);
                            closeQuickActionSheet();
                        }}
                    >
                        <X size={20} />
                    </button>
                </div>

                {showContactPicker ? (
                    /* Step 2: Contact Picker for Key Point */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxHeight: '300px', overflowY: 'auto' }}>
                        {contacts.length > 0 ? (
                            contacts.map((c) => (
                                <button
                                    key={c.id}
                                    className="glass-card card-interactive"
                                    onClick={() => handleSelectContactForKeyPoint(c.id)}
                                    style={{
                                        padding: '0.85rem 1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        textAlign: 'left'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', color: '#ffffff', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {c.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                                {c.name}
                                            </p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {c.company || c.email || 'Contact Partner'}
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} color="var(--accent)" />
                                </button>
                            ))
                        ) : (
                            <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)' }}>
                                <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>No contacts found. Create a contact first.</p>
                                <button
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setShowContactPicker(false);
                                        closeQuickActionSheet();
                                        openContactModal();
                                    }}
                                >
                                    <UserPlus size={16} /> Create Contact Now
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    /* Step 1: Main Quick Actions List */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        {/* New Todo */}
                        <button
                            className="glass-card card-interactive"
                            onClick={() => {
                                closeQuickActionSheet();
                                openTodoModal();
                            }}
                            style={{
                                padding: '0.9rem 1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                borderLeft: '4px solid var(--accent)',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(0, 107, 92, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <CheckSquare size={20} color="var(--accent)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                    New Todo
                                </p>
                                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                                    Add an action item or follow-up task
                                </p>
                            </div>
                        </button>

                        {/* New Contact */}
                        <button
                            className="glass-card card-interactive"
                            onClick={() => {
                                closeQuickActionSheet();
                                openContactModal();
                            }}
                            style={{
                                padding: '0.9rem 1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                borderLeft: '4px solid var(--secondary)',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'var(--secondary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <UserPlus size={20} color="var(--on-secondary-container)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                    New Contact
                                </p>
                                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                                    Save a new partner or client profile
                                </p>
                            </div>
                        </button>

                        {/* New Key Point */}
                        <button
                            className="glass-card card-interactive"
                            onClick={() => {
                                if (contacts.length === 1) {
                                    handleSelectContactForKeyPoint(contacts[0].id);
                                } else {
                                    setShowContactPicker(true);
                                }
                            }}
                            style={{
                                padding: '0.9rem 1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                borderLeft: '4px solid var(--amber)',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(217, 119, 6, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Pin size={20} color="var(--amber)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                    New Key Point
                                </p>
                                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                                    Pick a contact & add a point to remember
                                </p>
                            </div>
                        </button>

                        {/* Start Live Session / Voice Note */}
                        <button
                            className="glass-card card-interactive"
                            onClick={() => {
                                closeQuickActionSheet();
                                setActiveTab('meeting');
                            }}
                            style={{
                                padding: '0.9rem 1.1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                borderLeft: '4px solid var(--rose)',
                                background: 'rgba(239, 245, 247, 0.9)',
                                textAlign: 'left'
                            }}
                        >
                            <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', background: 'rgba(225, 29, 72, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Mic size={20} color="var(--rose)" />
                            </div>
                            <div>
                                <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                    Start Live Voice Session
                                </p>
                                <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                                    Record audio & auto-generate transcripts
                                </p>
                            </div>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
