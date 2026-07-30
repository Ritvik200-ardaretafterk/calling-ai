import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useContactStore } from '../store/useContactStore';
import { useKeyPointStore } from '../store/useKeyPointStore';
import { useTodoStore } from '../store/useTodoStore';
import {
    Mic, Square, Play, Sparkles, CheckCircle2, AlertCircle,
    User, ChevronRight, Plus, Lightbulb, Volume2, ShieldCheck,
    Clock, RefreshCw, FileText, Check, ArrowRight, History
} from 'lucide-react';

export default function VoiceNotesPage() {
    const { activeContactIdFilter, setActiveTab, openContactModal, showToast } = useUIStore();
    const contacts = useContactStore((s) => s.contacts);
    const keyPoints = useKeyPointStore((s) => s.keyPoints);
    const toggleCovered = useKeyPointStore((s) => s.toggleCovered);
    const addTodo = useTodoStore((s) => s.addTodo);

    // Selected Contact state
    const [selectedContactId, setSelectedContactId] = useState(
        activeContactIdFilter || (contacts.length > 0 ? contacts[0].id : '')
    );

    const selectedContact = contacts.find((c) => c.id === selectedContactId) || null;
    const contactKP = keyPoints.filter((k) => k.contact_id === selectedContactId);

    // Session State
    const [isRecording, setIsRecording] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [showAssistantReminder, setShowAssistantReminder] = useState(false);
    const [currentReminderText, setCurrentReminderText] = useState('');

    // Saved Sessions History
    const [savedSessions, setSavedSessions] = useState([]);

    // Live Transcript
    const [transcript, setTranscript] = useState([]);

    const timerRef = useRef(null);

    // Recording Timer (pure seconds counter)
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setSeconds((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    const formatTime = (totalSec) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const handleStartSession = () => {
        setIsRecording(true);
        setSeconds(0);
        showToast('Live Assistant Recording Started', 'info');
    };

    const handleStopSession = () => {
        setIsRecording(false);
        setShowAssistantReminder(false);
        setShowSummaryModal(true);
    };

    const handleSaveSummary = () => {
        const covered = contactKP.filter((k) => k.covered).length;
        const newSession = {
            id: `session-${Date.now()}`,
            title: selectedContact ? `Meeting with ${selectedContact.name}` : 'General Notes Session',
            contactName: selectedContact ? selectedContact.name : 'General Note',
            contactId: selectedContactId,
            date: 'Just now',
            duration: formatTime(seconds),
            coveredCount: covered,
            totalCount: contactKP.length,
            transcriptSnippet: transcript.map(t => t.text).join(' ').slice(0, 120) + '...'
        };

        setSavedSessions([newSession, ...savedSessions]);
        setShowSummaryModal(false);
        showToast('Meeting summary & transcript saved!', 'success');
    };

    const handleAddMissedAsTodos = () => {
        const missed = contactKP.filter((k) => !k.covered);
        missed.forEach((kp) => {
            addTodo({
                title: `Follow-up: ${kp.text}`,
                contact_id: selectedContactId,
                contact_name: selectedContact ? selectedContact.name : null,
                priority: 'High',
                due_date: new Date().toISOString().split('T')[0]
            });
        });
        showToast(`Added ${missed.length} missed key points as follow-up todos!`, 'success');
        handleSaveSummary();
    };

    const coveredCount = contactKP.filter((k) => k.covered).length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
            {/* Header */}
            <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                            <Sparkles size={12} /> LIVE MEETING ENGINE
                        </span>
                        {isRecording && (
                            <span className="badge badge-red" style={{ fontSize: '0.65rem', animation: 'pulse 1.5s infinite' }}>
                                🔴 RECORDING LIVE ({formatTime(seconds)})
                            </span>
                        )}
                    </div>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                        Live Meeting Assistant
                    </h2>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                        Real-time audio transcription, key point tracking, and automated action item syncing.
                    </p>
                </div>

                {!isRecording && (
                    <button className="btn btn-primary" onClick={handleStartSession} style={{ padding: '0.75rem 1.25rem' }}>
                        <Mic size={18} /> START LIVE ASSISTANT
                    </button>
                )}
            </div>

            {/* PRE-SESSION / ACTIVE RECORDING CONTAINER */}
            {!isRecording ? (
                /* BEFORE STARTING: Pick Contact & Review Key Points */
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                        <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>
                                STEP 1: SELECT MEETING CONTEXT
                            </span>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                                Link Contact or General Note
                            </h3>
                        </div>
                        <select
                            className="input-field"
                            value={selectedContactId}
                            onChange={(e) => setSelectedContactId(e.target.value)}
                            style={{ maxWidth: '280px', padding: '0.6rem 0.85rem' }}
                        >
                            <option value="">👤 No Contact (General Voice Note)</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.id}>
                                    👤 {c.name} ({c.company || 'Contact'})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Key Points Checklist Preview */}
                    <div style={{ background: 'var(--bg-base)', borderRadius: 'var(--radius-lg)', padding: '1.1rem', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                📌 Pre-Loaded Key Points ({coveredCount}/{contactKP.length} Covered)
                            </p>
                            {selectedContact && (
                                <button
                                    onClick={() => {
                                        setActiveTab('contacts', selectedContact.id);
                                    }}
                                    style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}
                                >
                                    View {selectedContact.name} Details →
                                </button>
                            )}
                        </div>

                        {contactKP.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {contactKP.map((kp) => (
                                    <div
                                        key={kp.id}
                                        onClick={() => toggleCovered(kp.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.65rem 0.85rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: kp.covered ? 'rgba(0, 107, 92, 0.08)' : '#ffffff',
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <span style={{ fontSize: '0.85rem', color: kp.covered ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: kp.covered ? 'line-through' : 'none' }}>
                                            {kp.text}
                                        </span>
                                        <span className={`badge ${kp.covered ? 'badge-accent' : 'badge-amber'}`} style={{ fontSize: '0.65rem' }}>
                                            {kp.covered ? 'Covered' : 'Pending'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                {selectedContact ? `No specific key points added for ${selectedContact.name}. You can add points anytime.` : 'Select a contact above to auto-load their key action items.'}
                            </p>
                        )}
                    </div>

                    {/* Big Launch Banner */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '2rem 1.5rem',
                        background: 'linear-gradient(135deg, rgba(0, 107, 92, 0.04) 0%, rgba(9, 78, 103, 0.08) 100%)',
                        borderRadius: 'var(--radius-xl)',
                        border: '1px border var(--border)',
                        textAlign: 'center'
                    }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem', boxShadow: '0 8px 24px rgba(0, 107, 92, 0.25)' }}>
                            <Mic size={32} />
                        </div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                            Ready to Start Recording
                        </h4>
                        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '420px', marginBottom: '1.25rem' }}>
                            ConvoPilot will actively listen, transcribe audio, check off points, and prompt you with smart spoken reminders.
                        </p>
                        <button className="btn btn-primary" onClick={handleStartSession} style={{ padding: '0.85rem 2rem', fontSize: '0.95rem' }}>
                            <Mic size={20} /> START MEETING SESSION NOW
                        </button>
                    </div>
                </div>
            ) : (
                /* WHILE RECORDING: Live Waveform, Live Transcript, Key Points Panel */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Visual Cue Alert Toast */}
                    {showAssistantReminder && (
                        <div style={{
                            padding: '0.85rem 1.1rem',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--surface-container-highest)',
                            border: '1px solid var(--amber)',
                            boxShadow: 'var(--shadow-md)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            animation: 'slideDown 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}>
                            <Lightbulb size={22} color="var(--amber)" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                                    🔊 ASSISTANT CUE ALERT
                                </p>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {currentReminderText}
                                </p>
                            </div>
                            <button className="btn-icon" onClick={() => setShowAssistantReminder(false)}>
                                <Check size={16} />
                            </button>
                        </div>
                    )}

                    {/* Active Waveform & Timer Controls Bar */}
                    <div className="glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '32px' }}>
                                {[16, 28, 40, 20, 36, 12, 32, 24, 44, 18].map((h, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            width: 4,
                                            height: `${Math.min(36, Math.max(8, (h + (seconds * (i + 1) * 9) % 32)))}px`,
                                            background: 'var(--rose)',
                                            borderRadius: 2,
                                            transition: 'height 0.15s ease'
                                        }}
                                    />
                                ))}
                            </div>
                            <div>
                                <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--rose)', fontFamily: 'JetBrains Mono, monospace' }}>
                                    {formatTime(seconds)}
                                </span>
                                <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                                    Live Audio Stream
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <button className="btn btn-secondary" onClick={() => showToast('Simulating assistant voice prompt...', 'info')}>
                                <Volume2 size={16} /> Cue Voice
                            </button>
                            <button className="btn btn-red" onClick={handleStopSession} style={{ padding: '0.75rem 1.5rem' }}>
                                <Square size={16} /> STOP & FINISH
                            </button>
                        </div>
                    </div>

                    {/* 2-Column Grid: Live Transcript & Live Key Points Sheet */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
                        {/* Column 1: Live Transcript Stream */}
                        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                                    LIVE SCROLLING TRANSCRIPT
                                </span>
                                <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                                    Speech-to-Text Active
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {transcript.map((msg) => (
                                    <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', fontSize: '0.875rem' }}>
                                        <span style={{ fontSize: '0.725rem', color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace', paddingTop: '2px', width: '38px', flexShrink: 0 }}>
                                            {msg.time}
                                        </span>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)' }}>
                                                {msg.speaker}
                                            </span>
                                            <p style={{ color: 'var(--text-primary)', background: 'var(--bg-base)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', lineHeight: 1.45 }}>
                                                {msg.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Column 2: Live Key Points Panel */}
                        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                                    KEY POINTS ({coveredCount}/{contactKP.length})
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    Tap to check off
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', maxHeight: '340px', overflowY: 'auto' }}>
                                {contactKP.map((kp) => (
                                    <button
                                        key={kp.id}
                                        onClick={() => toggleCovered(kp.id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '0.75rem 0.9rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: kp.covered ? 'rgba(0, 107, 92, 0.08)' : '#ffffff',
                                            border: kp.covered ? '1px solid var(--accent)' : '1px solid var(--border)',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            transition: 'all 0.15s ease'
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                                            <CheckCircle2 size={18} color={kp.covered ? 'var(--accent)' : 'var(--text-tertiary)'} />
                                            <span style={{ fontSize: '0.85rem', fontWeight: kp.covered ? 600 : 500, color: kp.covered ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: kp.covered ? 'line-through' : 'none' }}>
                                                {kp.text}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* POST-SESSION SUMMARY MODAL */}
            {showSummaryModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(22, 29, 30, 0.65)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '520px', background: '#ffffff',
                        borderRadius: 'var(--radius-xl)', padding: '1.75rem',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: '1.25rem'
                    }}>
                        <div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                                SESSION COMPLETE
                            </span>
                            <h3 style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                                Meeting Session Summary
                            </h3>
                        </div>

                        {/* Summary Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div style={{ background: 'rgba(0, 107, 92, 0.08)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>
                                    {coveredCount} / {contactKP.length}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Points Covered</p>
                            </div>
                            <div style={{ background: 'rgba(225, 29, 72, 0.08)', borderRadius: 'var(--radius-md)', padding: '0.85rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--rose)' }}>
                                    {contactKP.length - coveredCount}
                                </p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Points Missed</p>
                            </div>
                        </div>

                        {/* Missed Points Warning */}
                        {contactKP.length - coveredCount > 0 && (
                            <div style={{ background: 'var(--bg-base)', padding: '0.85rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                                <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '0.35rem' }}>
                                    ⚠️ Missed Key Points Action Needed:
                                </p>
                                <ul style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem' }}>
                                    {contactKP.filter(k => !k.covered).map(k => (
                                        <li key={k.id}>{k.text}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Modal Action CTAs */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {contactKP.length - coveredCount > 0 && (
                                <button className="btn btn-primary" onClick={handleAddMissedAsTodos} style={{ justifyContent: 'center' }}>
                                    <Plus size={16} /> Add Missed Points as Follow-up Todos
                                </button>
                            )}
                            <button className="btn btn-secondary" onClick={handleSaveSummary} style={{ justifyContent: 'center' }}>
                                <FileText size={16} /> Save Transcript & Summary Only
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PAST VOICE NOTES / MEETING HISTORY LIST */}
            <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <History size={18} color="var(--accent)" />
                        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                            Past Voice Notes & Session History
                        </h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>
                        {savedSessions.length} Recorded Sessions
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {savedSessions.map((session) => (
                        <div
                            key={session.id}
                            style={{
                                padding: '1rem 1.25rem',
                                borderRadius: 'var(--radius-lg)',
                                background: '#ffffff',
                                border: '1px solid var(--border)',
                                borderLeft: '4px solid var(--accent)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.5rem'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Manrope, sans-serif' }}>
                                        {session.title}
                                    </h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'JetBrains Mono, monospace' }}>
                                        📅 {session.date} • ⏱️ {session.duration}
                                    </span>
                                </div>
                                <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                                    {session.coveredCount}/{session.totalCount} Points Covered
                                </span>
                            </div>

                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                                "{session.transcriptSnippet}"
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                                <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => showToast(`Playing session recording (${session.duration})...`, 'info')}>
                                    <Play size={12} /> Play Audio
                                </button>
                                {session.contactId && (
                                    <button className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }} onClick={() => setActiveTab('contacts', session.contactId)}>
                                        <User size={12} /> Contact Profile
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
