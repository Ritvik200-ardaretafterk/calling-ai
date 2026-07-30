import React, { useState } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useContactStore } from '../store/useContactStore';
import { useAuthStore } from '../store/useAuthStore';
import {
    User, Lock, Bell, Sliders, LogOut, ChevronRight, Edit2,
    ShieldCheck, Zap, Volume2, Mic, Headphones, Trash2,
    ShieldAlert, Database, Plus, CheckCircle2, Save, X
} from 'lucide-react';

export default function ProfileSettingsPage() {
    const { showToast, openContactModal, setActiveTab } = useUIStore();
    const user = useAuthStore((s) => s.user) || { name: 'User', email: 'user@example.com' };
    const logout = useAuthStore((s) => s.logout);
    const updateProfile = useAuthStore((s) => s.updateProfile);
    const startOnboarding = useAuthStore((s) => s.startOnboarding);

    const contacts = useContactStore((s) => s.contacts);
    const deleteContact = useContactStore((s) => s.deleteContact);

    // Profile Edit Mode
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user.name || '');
    const [editEmail, setEditEmail] = useState(user.email || '');

    // Audio & Assistant Preferences State
    const [ttsVoice, setTtsVoice] = useState('Emma (Natural Female)');
    const [ttsSpeed, setTtsSpeed] = useState('1.0x');
    const [sensitivity, setSensitivity] = useState('Moderate');
    const [audioDevice, setAudioDevice] = useState('AirPods Pro (Bluetooth)');
    const [localOnlyStorage, setLocalOnlyStorage] = useState(true);

    const initials = user.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'U';

    const handleSaveProfile = (e) => {
        e.preventDefault();
        if (!editName.trim()) return;
        updateProfile({ name: editName.trim(), email: editEmail.trim() });
        setIsEditing(false);
        showToast('Profile updated successfully!', 'success');
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to sign out of ConvoPilot?')) {
            logout();
            showToast('Signed out successfully', 'info');
        }
    };

    const handleDeleteContact = (contactId, name) => {
        if (confirm(`Are you sure you want to delete ${name}?`)) {
            deleteContact(contactId);
            showToast(`Contact "${name}" deleted`, 'info');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>

            {/* Real User Profile Card */}
            <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <div style={{
                        width: 90,
                        height: 90,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--accent) 0%, var(--secondary) 100%)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        fontWeight: 800,
                        fontFamily: 'Manrope, sans-serif',
                        boxShadow: '0 8px 24px rgba(0, 107, 92, 0.2)'
                    }}>
                        {initials}
                    </div>
                    <button
                        onClick={() => {
                            setEditName(user.name);
                            setEditEmail(user.email);
                            setIsEditing(!isEditing);
                        }}
                        style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            background: 'var(--accent)',
                            color: '#ffffff',
                            border: '2px solid #ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                        title="Edit profile"
                    >
                        <Edit2 size={14} />
                    </button>
                </div>

                {isEditing ? (
                    <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', width: '100%', maxWidth: '300px', marginBottom: '1rem' }}>
                        <input
                            className="form-input"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Full Name"
                            required
                        />
                        <input
                            className="form-input"
                            type="email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            placeholder="Email Address"
                            required
                        />
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                                <Save size={14} /> Save Profile
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}>
                                <X size={14} /> Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', marginBottom: '0.15rem' }}>
                            {user.name}
                        </h2>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif', marginBottom: '0.75rem' }}>
                            {user.email}
                        </p>
                    </>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem' }}>
                        <Zap size={12} /> PRO ASSISTANT
                    </span>
                    <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem' }}>
                        <ShieldCheck size={12} /> ENCRYPTED
                    </span>
                </div>
            </div>

            {/* AUDIO & ASSISTANT PREFERENCES */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                        AUDIO & REMINDER PREFERENCES
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                        Voice Assistant Configuration
                    </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Volume2 size={14} color="var(--accent)" /> TTS Voice Accent
                        </label>
                        <select
                            className="input-field"
                            value={ttsVoice}
                            onChange={(e) => {
                                setTtsVoice(e.target.value);
                                showToast(`Voice changed to ${e.target.value}`, 'info');
                            }}
                        >
                            <option value="Emma (Natural Female)">Emma (Natural Female)</option>
                            <option value="James (Natural Male)">James (Natural Male)</option>
                            <option value="Sophia (Neural Female)">Sophia (Neural Female)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Sliders size={14} color="var(--accent)" /> Playback Speed
                        </label>
                        <select
                            className="input-field"
                            value={ttsSpeed}
                            onChange={(e) => setTtsSpeed(e.target.value)}
                        >
                            <option value="0.8x">0.8x (Slower)</option>
                            <option value="1.0x">1.0x (Normal)</option>
                            <option value="1.2x">1.2x (Faster)</option>
                            <option value="1.5x">1.5x (Quick)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Mic size={14} color="var(--amber)" /> Reminder Interrupt Sensitivity
                        </label>
                        <select
                            className="input-field"
                            value={sensitivity}
                            onChange={(e) => setSensitivity(e.target.value)}
                        >
                            <option value="Strict">Strict (Frequent Cue Reminders)</option>
                            <option value="Moderate">Moderate (Standard)</option>
                            <option value="Relaxed">Relaxed (Low Interrupt)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Headphones size={14} color="var(--accent)" /> Earphone / Audio Output
                        </label>
                        <select
                            className="input-field"
                            value={audioDevice}
                            onChange={(e) => setAudioDevice(e.target.value)}
                        >
                            <option value="AirPods Pro (Bluetooth)">AirPods Pro (Bluetooth Earphones)</option>
                            <option value="Device Speaker">Device Built-in Speaker</option>
                            <option value="USB Headset">Wired / USB Headset</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* MANAGE CONTACTS SECTION */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <div>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                            CONTACT DIRECTORY
                        </span>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                            Manage Contacts ({contacts.length})
                        </h3>
                    </div>
                    <button className="btn btn-primary" onClick={() => openContactModal()} style={{ padding: '0.5rem 0.85rem', fontSize: '0.8rem' }}>
                        <Plus size={14} /> Add Contact
                    </button>
                </div>

                {contacts.length === 0 ? (
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', padding: '1rem 0' }}>
                        No contacts added yet. Tap "+ Add Contact" above to start building your directory.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        {contacts.map((c) => (
                            <div
                                key={c.id}
                                style={{
                                    padding: '0.85rem 1rem',
                                    borderRadius: 'var(--radius-lg)',
                                    background: '#ffffff',
                                    border: '1px solid var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div
                                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                                    onClick={() => setActiveTab('contacts', c.id)}
                                >
                                    <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--accent)', color: '#ffffff', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        {c.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                            {c.name}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                            {c.company || c.role || c.email || 'Contact Partner'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <button className="btn btn-secondary" style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }} onClick={() => openContactModal(c)}>
                                        <Edit2 size={12} /> Edit
                                    </button>
                                    <button className="btn btn-red" style={{ padding: '0.4rem 0.65rem', fontSize: '0.75rem' }} onClick={() => handleDeleteContact(c.id, c.name)}>
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* DATA & PRIVACY SECTION */}
            <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                        DATA & PRIVACY
                    </span>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                        Security & Local Processing Controls
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0' }}>
                        <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                Encrypted Local Storage Only
                            </p>
                            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                                Keep all voice session recordings on-device without cloud sync
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={localOnlyStorage}
                            onChange={(e) => setLocalOnlyStorage(e.target.checked)}
                            style={{ width: 20, height: 20, accentColor: 'var(--accent)' }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border)' }}>
                        <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                Microphone Access Granted
                            </p>
                            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                                Permission status for real-time meeting transcription
                            </p>
                        </div>
                        <span className="badge badge-accent" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 size={12} /> Active
                        </span>
                    </div>
                </div>
            </div>

            {/* TUTORIAL & HELP CARD */}
            <div className="glass-card" style={{ padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'rgba(0, 107, 92, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={18} color="var(--accent)" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                App Tutorial & Walkthrough
                            </p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                Replay the interactive tour of all app features & sections
                            </p>
                        </div>
                    </div>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={startOnboarding}
                        style={{ fontSize: '0.775rem', fontWeight: 700, gap: '0.3rem', whiteSpace: 'nowrap' }}
                    >
                        Replay Tour
                    </button>
                </div>
            </div>

            {/* LOGOUT BUTTON */}
            <div>
                <button
                    onClick={handleLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px solid rgba(225, 29, 72, 0.3)',
                        background: 'rgba(225, 29, 72, 0.08)',
                        color: 'var(--rose)',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        letterSpacing: '0.08em',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        fontFamily: 'JetBrains Mono, monospace'
                    }}
                >
                    <LogOut size={16} /> SIGN OUT OF CONVOPILOT
                </button>
            </div>
        </div>
    );
}
