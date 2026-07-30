import React, { useState, useEffect, useRef } from 'react';
import { useUIStore } from '../store/useUIStore';
import { useContactStore } from '../store/useContactStore';
import { useKeyPointStore } from '../store/useKeyPointStore';
import { useTodoStore } from '../store/useTodoStore';
import {
    Mic, MicOff, Square, Sparkles,
    Plus, Trash2, Check, PhoneCall, Bookmark, Send, User, UserCheck
} from 'lucide-react';

export default function MeetingAssistant() {
    const { activeContactIdFilter, setActiveTab, showToast } = useUIStore();
    const contacts = useContactStore((s) => s.contacts);
    const keyPoints = useKeyPointStore((s) => s.keyPoints);
    const addKeyPoint = useKeyPointStore((s) => s.addKeyPoint);
    const addTodo = useTodoStore((s) => s.addTodo);

    // Active Contact Selection
    const [selectedContactId, setSelectedContactId] = useState(
        activeContactIdFilter || (contacts.length > 0 ? contacts[0].id : '')
    );
    const contact = contacts.find((c) => c.id === selectedContactId) || null;

    // State
    const [isRecording, setIsRecording] = useState(false);
    const [secondsElapsed, setSecondsElapsed] = useState(0);
    const [transcript, setTranscript] = useState([]);
    const [quickInput, setQuickInput] = useState('');
    const [activeSpeakerRole, setActiveSpeakerRole] = useState('partner'); // 'partner' or 'user'
    const [capturedKeyPoints, setCapturedKeyPoints] = useState([]);
    const [showSummaryModal, setShowSummaryModal] = useState(false);
    const [audioVolume, setAudioVolume] = useState(0);

    const timerRef = useRef(null);
    const recognitionRef = useRef(null);
    const mediaStreamRef = useRef(null);
    const audioContextRef = useRef(null);

    // Quick keypoint template chips for instant 1-touch capture during call
    const quickChips = [
        '📅 Scheduled follow-up call',
        '💰 Agreed on budget / pricing',
        '📩 Send proposal / email',
        '✅ Confirmed action item',
        '📑 Review contract details'
    ];

    // Timer
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setSecondsElapsed((prev) => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    // Start Live Session (Microphone stream + Web Speech if available)
    const startRecording = async () => {
        setIsRecording(true);

        try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaStreamRef.current = stream;

                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    const ctx = new AudioCtx();
                    audioContextRef.current = ctx;
                    const source = ctx.createMediaStreamSource(stream);
                    const analyser = ctx.createAnalyser();
                    analyser.fftSize = 64;
                    source.connect(analyser);

                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    const updateVolume = () => {
                        if (analyser) {
                            analyser.getByteFrequencyData(dataArray);
                            const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
                            setAudioVolume(Math.min(100, Math.round(avg * 1.5)));
                        }
                    };
                    setInterval(updateVolume, 200);
                }
            }
        } catch (e) {
            console.log('Microphone stream fallback mode');
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            try {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-US';

                recognition.onresult = (event) => {
                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        if (event.results[i].isFinal) {
                            const speechText = event.results[i][0].transcript.trim();
                            handleNewSpeechMessage(speechText);
                        }
                    }
                };

                recognition.onend = () => {
                    if (recognitionRef.current && isRecording) {
                        try { recognitionRef.current.start(); } catch (e) { }
                    }
                };

                recognitionRef.current = recognition;
                recognition.start();
            } catch (err) { }
        }

        showToast('Live Assistant active — session in progress', 'info');
    };

    const pauseRecording = () => {
        setIsRecording(false);
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { }
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        }
        if (audioContextRef.current) {
            try { audioContextRef.current.close(); } catch (e) { }
        }
        showToast('Session paused', 'info');
    };

    const handleStopAndSave = () => {
        pauseRecording();
        setShowSummaryModal(true);
    };

    // Handle new incoming speech or note text
    const handleNewSpeechMessage = (text, forcedRole = null) => {
        if (!text.trim()) return;
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const lowerText = text.toLowerCase();
        const roleToUse = forcedRole || activeSpeakerRole;

        const isNotedTrigger = lowerText.includes('noted') || lowerText.includes('note that') || lowerText.includes('key point');

        if (isNotedTrigger && roleToUse === 'user') {
            triggerNotedKeyPoint(text);
        } else {
            setTranscript((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    time: timeStr,
                    speaker: roleToUse === 'user' ? 'You' : (contact ? contact.name : 'Caller'),
                    role: roleToUse,
                    text: text.trim(),
                    isKeyPoint: false
                }
            ]);
        }
    };

    // Trigger NOTED / Quick Chip Key Point action
    const triggerNotedKeyPoint = (customText) => {
        const textToSave = customText || 'Action item noted during call';
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        setCapturedKeyPoints((kpList) => [
            ...kpList,
            {
                id: Date.now(),
                text: textToSave,
                source: 'In-Call Quick Capture'
            }
        ]);

        setTranscript((prev) => [
            ...prev,
            {
                id: Date.now(),
                time: timeStr,
                speaker: 'You (Voice Command)',
                role: 'user',
                text: textToSave,
                isKeyPoint: true
            }
        ]);

        showToast(`✨ Saved Key Point: "${textToSave.slice(0, 30)}..."`, 'success');
    };

    // Add note via quick input box during call
    const handleAddQuickNote = (e) => {
        e.preventDefault();
        if (!quickInput.trim()) return;
        handleNewSpeechMessage(quickInput);
        setQuickInput('');
    };

    // Confirm post-call key points
    const handleConfirmKeyPoints = () => {
        capturedKeyPoints.forEach((kp) => {
            if (selectedContactId) {
                addKeyPoint({
                    contact_id: selectedContactId,
                    text: kp.text
                });
            }
            addTodo({
                title: `Key Point: ${kp.text}`,
                contact_id: selectedContactId,
                contact_name: contact ? contact.name : null,
                priority: 'Medium',
                due_date: new Date().toISOString().split('T')[0]
            });
        });

        showToast(`Saved ${capturedKeyPoints.length} Key Points & Action Todos!`, 'success');
        setShowSummaryModal(false);
        setActiveTab('dashboard');
    };

    const formatTimer = (totalSec) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: 'calc(100vh - 160px)', position: 'relative', paddingBottom: '3.5rem' }}>

            {/* Top Meeting Header */}
            <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: 42,
                        height: 42,
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: '#ffffff',
                        fontWeight: 800,
                        fontSize: '1.1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}>
                        {contact ? contact.name.charAt(0).toUpperCase() : '🎙️'}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)' }}>
                            {contact ? contact.name : 'Live Silent Call Assistant'}
                        </h2>
                        <select
                            className="input-field"
                            value={selectedContactId}
                            onChange={(e) => setSelectedContactId(e.target.value)}
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', marginTop: '0.15rem', maxWidth: '200px' }}
                        >
                            <option value="">👤 Select Contact</option>
                            {contacts.map((c) => (
                                <option key={c.id} value={c.id}>
                                    👤 {c.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.3rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        background: isRecording ? 'rgba(0, 107, 92, 0.12)' : 'var(--surface-container-highest)',
                        color: isRecording ? 'var(--accent)' : 'var(--text-secondary)',
                        fontSize: '0.75rem',
                        fontWeight: 700
                    }}>
                        <div style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: isRecording ? '#006B5C' : '#94a3b8',
                            animation: isRecording ? 'pulse 1.5s infinite' : 'none'
                        }} />
                        <span>{isRecording ? 'LIVE SESSION' : 'IDLE'}</span>
                    </div>

                    <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        fontFamily: 'JetBrains Mono, monospace',
                        padding: '0.3rem 0.65rem',
                        background: '#ffffff',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--text-primary)'
                    }}>
                        {formatTimer(secondsElapsed)}
                    </span>
                </div>
            </div>

            {/* Audio Waveform & Action Controls */}
            <div className="glass-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '22px' }}>
                        {[12, 22, 30, 14, 24, 10, 26, 18, 32, 12].map((h, i) => (
                            <div
                                key={i}
                                style={{
                                    width: 3.5,
                                    height: `${isRecording ? Math.min(26, Math.max(5, (h + audioVolume + (secondsElapsed * (i + 1) * 7) % 20))) : 5}px`,
                                    background: isRecording ? 'var(--accent)' : '#cbd5e1',
                                    borderRadius: 2
                                }}
                            />
                        ))}
                    </div>
                    <span style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        {isRecording ? 'Session Active — tap chips or type notes below' : 'Tap "START LIVE ASSISTANT" before or during your call'}
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {!isRecording ? (
                        <button
                            className="btn btn-primary"
                            onClick={startRecording}
                            style={{ padding: '0.55rem 1.1rem', fontSize: '0.8rem', fontWeight: 700 }}
                        >
                            <Mic size={15} /> START LIVE ASSISTANT
                        </button>
                    ) : (
                        <button
                            className="btn btn-secondary"
                            onClick={pauseRecording}
                            style={{ padding: '0.55rem 0.9rem', fontSize: '0.775rem' }}
                        >
                            <MicOff size={14} /> Pause
                        </button>
                    )}

                    {secondsElapsed > 0 && (
                        <button
                            className="btn btn-red"
                            onClick={handleStopAndSave}
                            style={{ padding: '0.55rem 0.95rem', fontSize: '0.775rem', fontWeight: 700 }}
                        >
                            <Square size={14} /> FINISH SESSION
                        </button>
                    )}
                </div>
            </div>

            {/* Quick 1-Touch Key Point Chips */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                    ⚡ 1-TOUCH IN-CALL QUICK KEY POINTS
                </span>
                <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto', paddingBottom: '0.35rem' }}>
                    {quickChips.map((chip, i) => (
                        <button
                            key={i}
                            onClick={() => triggerNotedKeyPoint(chip)}
                            style={{
                                whiteSpace: 'nowrap',
                                padding: '0.4rem 0.75rem',
                                borderRadius: 'var(--radius-full)',
                                background: '#ffffff',
                                border: '1.5px solid var(--accent)',
                                color: 'var(--text-primary)',
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: 'var(--shadow-sm)',
                                flexShrink: 0
                            }}
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2-Way Live Chat Transcript Container */}
            <div className="glass-card" style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', minHeight: '220px', maxHeight: '340px', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.725rem', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>
                        💬 2-WAY LIVE CALL CHAT TRANSCRIPT
                    </span>
                    <span className="badge badge-accent" style={{ fontSize: '0.625rem' }}>
                        {capturedKeyPoints.length} Key Points Saved
                    </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {transcript.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '1.5rem 1rem', color: 'var(--text-tertiary)' }}>
                            <PhoneCall size={32} color="var(--accent)" style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                            <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {isRecording ? 'Session active — tap 1-Touch chips above or type below' : 'No call points logged yet.'}
                            </p>
                            <p style={{ fontSize: '0.775rem', marginTop: '0.2rem' }}>
                                Tap any quick chip or type notes to log statements from both speakers.
                            </p>
                        </div>
                    )}

                    {transcript.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                gap: '0.25rem'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                <span style={{ fontWeight: 700, color: msg.role === 'user' ? 'var(--amber)' : 'var(--accent)' }}>
                                    {msg.speaker}
                                </span>
                                <span>• {msg.time}</span>
                            </div>

                            <div style={{
                                maxWidth: '85%',
                                padding: '0.7rem 0.9rem',
                                borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                background: msg.role === 'user' ? 'var(--accent)' : '#ffffff',
                                color: msg.role === 'user' ? '#ffffff' : 'var(--text-primary)',
                                border: msg.isKeyPoint ? '2px solid var(--amber)' : '1px solid var(--border)',
                                boxShadow: msg.isKeyPoint ? '0 4px 12px rgba(245, 158, 11, 0.25)' : 'var(--shadow-sm)',
                                fontSize: '0.825rem',
                                lineHeight: 1.45
                            }}>
                                {msg.isKeyPoint && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.65rem', fontWeight: 800, color: msg.role === 'user' ? 'var(--amber)' : 'var(--accent)', marginBottom: '0.25rem' }}>
                                        <Bookmark size={12} /> SAVED KEY POINT
                                    </div>
                                )}
                                <p>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* In-Call Note Input Bar with Speaker Toggle */}
            <form onSubmit={handleAddQuickNote} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Log message as:</span>
                    <button
                        type="button"
                        onClick={() => setActiveSpeakerRole('partner')}
                        style={{
                            padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)',
                            fontSize: '0.7rem', fontWeight: 700,
                            background: activeSpeakerRole === 'partner' ? 'var(--accent)' : 'var(--surface-container-highest)',
                            color: activeSpeakerRole === 'partner' ? '#ffffff' : 'var(--text-secondary)',
                            border: 'none', cursor: 'pointer'
                        }}
                    >
                        👤 {contact ? contact.name : 'Caller'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveSpeakerRole('user')}
                        style={{
                            padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)',
                            fontSize: '0.7rem', fontWeight: 700,
                            background: activeSpeakerRole === 'user' ? 'var(--amber)' : 'var(--surface-container-highest)',
                            color: activeSpeakerRole === 'user' ? '#ffffff' : 'var(--text-secondary)',
                            border: 'none', cursor: 'pointer'
                        }}
                    >
                        🗣️ You
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        className="input-field"
                        placeholder={`Type note as ${activeSpeakerRole === 'user' ? 'You' : (contact ? contact.name : 'Caller')}...`}
                        value={quickInput}
                        onChange={(e) => setQuickInput(e.target.value)}
                        style={{ flex: 1, fontSize: '0.825rem', padding: '0.65rem 0.9rem' }}
                    />
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1rem' }}>
                        <Send size={15} /> Add
                    </button>
                </div>
            </form>

            {/* Post-Call Review & Adjustment Modal */}
            {showSummaryModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(15, 23, 42, 0.65)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
                }}>
                    <div style={{
                        width: '100%', maxWidth: '520px', background: '#ffffff',
                        borderRadius: '24px', padding: '1.5rem',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column', gap: '1.1rem',
                        maxHeight: '85vh', overflowY: 'auto',
                        border: '2px solid var(--accent)'
                    }}>
                        <div>
                            <span className="badge badge-accent" style={{ fontSize: '0.65rem' }}>
                                📋 POST-CALL KEY POINT REVIEW
                            </span>
                            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'Manrope, sans-serif', color: 'var(--text-primary)', marginTop: '0.35rem' }}>
                                Confirm Captured Key Points
                            </h3>
                            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                                Review and adjust key points captured during your call before saving to {contact ? contact.name : 'Contact'} record.
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            {capturedKeyPoints.length === 0 ? (
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                                    No key points were captured yet. Add key points below.
                                </p>
                            ) : (
                                capturedKeyPoints.map((kp, idx) => (
                                    <div
                                        key={kp.id}
                                        style={{
                                            padding: '0.75rem 0.9rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: 'rgba(0, 107, 92, 0.06)',
                                            border: '1px solid var(--accent)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '0.75rem'
                                        }}
                                    >
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', flex: 1 }}>
                                            <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--accent)' }}>
                                                {kp.source || 'Captured Key Point'}
                                            </span>
                                            <input
                                                className="input-field"
                                                value={kp.text}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    setCapturedKeyPoints((list) =>
                                                        list.map((item, i) => (i === idx ? { ...item, text: val } : item))
                                                    );
                                                }}
                                                style={{ fontSize: '0.825rem', padding: '0.35rem 0.6rem' }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => setCapturedKeyPoints((list) => list.filter((_, i) => i !== idx))}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose)' }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        <button
                            className="btn btn-secondary"
                            onClick={() => {
                                setCapturedKeyPoints((list) => [
                                    ...list,
                                    { id: Date.now(), text: 'New custom key point', source: 'Manual addition' }
                                ]);
                            }}
                            style={{ justifyContent: 'center', padding: '0.6rem', fontSize: '0.775rem' }}
                        >
                            <Plus size={14} /> Add Another Key Point
                        </button>

                        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => setShowSummaryModal(false)}
                                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem' }}
                            >
                                Back to Call
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleConfirmKeyPoints}
                                style={{ flex: 1, justifyContent: 'center', padding: '0.75rem', fontWeight: 800 }}
                            >
                                <Check size={16} /> Save Key Points & Todos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
