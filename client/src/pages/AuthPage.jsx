import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { Sparkles, Mail, Lock, User, RefreshCw, KeyRound } from 'lucide-react';

export default function AuthPage() {
    const [screen, setScreen] = useState('login'); // login | signup | verify
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    const [busy, setBusy] = useState(false);
    const [errMsg, setErrMsg] = useState('');

    const signup = useAuthStore((s) => s.signup);
    const login = useAuthStore((s) => s.login);
    const verifyOtp = useAuthStore((s) => s.verifyOtp);
    const resendOtp = useAuthStore((s) => s.resendOtp);
    const showToast = useUIStore((s) => s.showToast);

    /* ── Login ── */
    const doLogin = async (e) => {
        e.preventDefault();
        setErrMsg('');
        if (!email.trim() || !password) { setErrMsg('Enter both email and password.'); return; }
        setBusy(true);
        try {
            const r = await login(email.trim(), password);
            if (r.success) showToast('Welcome back!', 'success');
            else setErrMsg(r.error || 'Login failed.');
        } catch (err) { setErrMsg('Something went wrong.'); }
        setBusy(false);
    };

    /* ── Signup → Send OTP ── */
    const doSignup = async (e) => {
        e.preventDefault();
        setErrMsg('');
        if (!email.trim() || !password) { setErrMsg('Email and password are required.'); return; }
        setBusy(true);
        try {
            const r = await signup(name.trim() || email.split('@')[0], email.trim(), password);
            if (r.success) {
                setScreen('verify');
                showToast(`OTP code sent to ${email}!`, 'success');
            } else {
                setErrMsg(r.error || 'Could not send verification email.');
            }
        } catch (err) { setErrMsg('Something went wrong. Check your connection.'); }
        setBusy(false);
    };

    /* ── Verify OTP ── */
    const doVerify = async (e) => {
        e.preventDefault();
        setErrMsg('');
        if (!otp.trim() || otp.trim().length < 6) { setErrMsg('Enter the full 6-digit code.'); return; }
        setBusy(true);
        try {
            const r = await verifyOtp(email.trim(), otp.trim());
            if (r.success) showToast('Email verified! Welcome to ConvoPilot.', 'success');
            else setErrMsg(r.error || 'Wrong code.');
        } catch (err) { setErrMsg('Verification failed. Try again.'); }
        setBusy(false);
    };

    /* ── Resend OTP ── */
    const doResend = async () => {
        setErrMsg('');
        setBusy(true);
        try {
            const r = await resendOtp(email.trim());
            if (r.success) showToast(`New code sent to ${email}`, 'success');
            else setErrMsg(r.error || 'Could not resend.');
        } catch { setErrMsg('Resend failed.'); }
        setBusy(false);
    };

    /* ── Shared styles ── */
    const labelSt = { fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', fontFamily: 'JetBrains Mono,monospace', display: 'block', marginBottom: '0.35rem' };
    const iconSt = { position: 'absolute', left: 14, top: 14 };
    const inputWrapSt = { position: 'relative' };

    return (
        <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: '1.5rem' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: 440, padding: '2.5rem 2rem', boxShadow: '0 20px 50px rgba(0,32,34,.12)', borderRadius: 28, background: '#fff', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                {/* Icon */}
                <div style={{ width: 56, height: 56, borderRadius: 18, background: 'rgba(0,107,92,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem' }}>
                    {screen === 'verify' ? <Mail size={28} color="var(--accent)" /> : <Sparkles size={28} color="var(--accent)" />}
                </div>

                {/* ─── Error banner ─── */}
                {errMsg && (
                    <div style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 12, background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: '0.82rem', marginBottom: '1rem', textAlign: 'left' }}>
                        {errMsg}
                    </div>
                )}

                {/* ═══════════════ VERIFY SCREEN ═══════════════ */}
                {screen === 'verify' && (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Manrope,sans-serif', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Verify Your Email</h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                            We sent a 6-digit OTP code to <strong>{email}</strong>.<br />Check your inbox (and spam folder) and enter it below.
                        </p>

                        <form onSubmit={doVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left' }}>
                            <div>
                                <label style={labelSt}>6-DIGIT VERIFICATION CODE</label>
                                <div style={inputWrapSt}>
                                    <KeyRound size={18} color="var(--text-tertiary)" style={iconSt} />
                                    <input type="text" className="form-input" placeholder="123456" maxLength={6}
                                        value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        style={{ paddingLeft: '2.6rem', fontSize: '1.1rem', letterSpacing: '.2em', fontWeight: 700, fontFamily: 'JetBrains Mono,monospace' }} />
                                </div>
                            </div>

                            <button type="submit" disabled={busy} className="btn btn-primary"
                                style={{ width: '100%', padding: '0.85rem', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
                                {busy ? 'Verifying…' : 'Verify & Enter App'}
                            </button>
                        </form>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontSize: '0.8rem' }}>
                            <button type="button" onClick={doResend} disabled={busy}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <RefreshCw size={14} /> Resend Code
                            </button>
                            <button type="button" onClick={() => { setScreen('signup'); setErrMsg(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                Back
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════ LOGIN SCREEN ═══════════════ */}
                {screen === 'login' && (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'Manrope,sans-serif', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Welcome to ConvoPilot</h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1.5rem' }}>Sign in with your email to access your workspace.</p>

                        <form onSubmit={doLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
                            <div>
                                <label style={labelSt}>EMAIL ADDRESS</label>
                                <div style={inputWrapSt}>
                                    <Mail size={18} color="var(--text-tertiary)" style={iconSt} />
                                    <input type="email" className="form-input" placeholder="you@example.com"
                                        value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '2.6rem' }} />
                                </div>
                            </div>
                            <div>
                                <label style={labelSt}>PASSWORD</label>
                                <div style={inputWrapSt}>
                                    <Lock size={18} color="var(--text-tertiary)" style={iconSt} />
                                    <input type="password" className="form-input" placeholder="••••••••"
                                        value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: '2.6rem' }} />
                                </div>
                            </div>
                            <button type="submit" disabled={busy} className="btn btn-primary"
                                style={{ width: '100%', padding: '0.85rem', marginTop: '.4rem', fontSize: '0.9rem', fontWeight: 800, justifyContent: 'center' }}>
                                {busy ? 'Signing in…' : 'Sign In'}
                            </button>
                        </form>

                        <div style={{ marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            Need an account?{' '}
                            <button type="button" onClick={() => { setScreen('signup'); setErrMsg(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', padding: 0 }}>
                                Create an account
                            </button>
                        </div>
                    </div>
                )}

                {/* ═══════════════ SIGNUP SCREEN ═══════════════ */}
                {screen === 'signup' && (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, fontFamily: 'Manrope,sans-serif', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Create Account</h1>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginBottom: '1.5rem' }}>An official verification email will be sent to your inbox.</p>

                        <form onSubmit={doSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', textAlign: 'left' }}>
                            <div>
                                <label style={labelSt}>FULL NAME</label>
                                <div style={inputWrapSt}>
                                    <User size={18} color="var(--text-tertiary)" style={iconSt} />
                                    <input type="text" className="form-input" placeholder="Your Name"
                                        value={name} onChange={(e) => setName(e.target.value)} style={{ paddingLeft: '2.6rem' }} />
                                </div>
                            </div>
                            <div>
                                <label style={labelSt}>EMAIL ADDRESS</label>
                                <div style={inputWrapSt}>
                                    <Mail size={18} color="var(--text-tertiary)" style={iconSt} />
                                    <input type="email" className="form-input" placeholder="you@example.com"
                                        value={email} onChange={(e) => setEmail(e.target.value)} style={{ paddingLeft: '2.6rem' }} />
                                </div>
                            </div>
                            <div>
                                <label style={labelSt}>PASSWORD</label>
                                <div style={inputWrapSt}>
                                    <Lock size={18} color="var(--text-tertiary)" style={iconSt} />
                                    <input type="password" className="form-input" placeholder="••••••••"
                                        value={password} onChange={(e) => setPassword(e.target.value)} style={{ paddingLeft: '2.6rem' }} />
                                </div>
                            </div>
                            <button type="submit" disabled={busy} className="btn btn-primary"
                                style={{ width: '100%', padding: '0.85rem', marginTop: '.4rem', fontSize: '0.9rem', fontWeight: 800, justifyContent: 'center' }}>
                                {busy ? 'Sending OTP…' : 'Sign Up & Send Verification'}
                            </button>
                        </form>

                        <div style={{ marginTop: '1.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                            Already have an account?{' '}
                            <button type="button" onClick={() => { setScreen('login'); setErrMsg(''); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 800, cursor: 'pointer', padding: 0 }}>
                                Sign in
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
