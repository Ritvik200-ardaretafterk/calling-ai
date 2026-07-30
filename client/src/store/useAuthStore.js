import { create } from 'zustand';

/* ── localStorage helpers ── */
const safe = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { } },
    del: (k) => { try { localStorage.removeItem(k); } catch { } },
};

const savedUser = (() => {
    try { const u = safe.get('convopilot_user'); return u ? JSON.parse(u) : null; } catch { return null; }
})();

/* ── API call helper supporting iPhone / Network IP devices ── */
const api = async (path, body) => {
    const host = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';

    // Generate candidate URLs for mobile devices on LAN (iPhone, Android, tablet)
    const urls = [
        path, // Relative path (proxied by Vite dev server)
        `http://${host}:5000${path}`, // Direct IP of host machine (e.g. http://172.25.210.110:5000/api/...)
        `http://localhost:5000${path}`,
        `http://127.0.0.1:5000${path}`,
    ];

    let lastError = 'Cannot reach server. Please check your network connection.';

    for (const url of urls) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

            const r = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await r.json();
            if (r.ok && data.success) {
                return { ok: true, data };
            }
            if (data.error) {
                lastError = data.error;
            }
        } catch (err) {
            // try next candidate endpoint
        }
    }

    return { ok: false, data: { error: lastError } };
};

/* ── Store ── */
export const useAuthStore = create((set) => ({
    isAuthenticated: safe.get('convopilot_auth') === 'true' && savedUser !== null,
    user: savedUser,
    pendingVerificationEmail: null,

    /* 1) SIGNUP → Send OTP email from smirfan9247@gmail.com */
    signup: async (name, email, password) => {
        const { ok, data } = await api('/api/auth/send-verification', { name, email });
        if (!ok) return { success: false, error: data.error || 'Failed to send verification email.' };
        set({ pendingVerificationEmail: email });
        return { success: true };
    },

    /* 2) VERIFY OTP → Only valid 6-digit code grants access */
    verifyOtp: async (email, code) => {
        if (!code || code.length < 6) return { success: false, error: 'Enter the full 6-digit code from your email.' };
        const { ok, data } = await api('/api/auth/verify-code', { email, code });
        if (!ok) return { success: false, error: data.error || 'Wrong code. Check your inbox.' };

        const u = { id: String(Date.now()), name: email.split('@')[0], email };
        safe.set('convopilot_auth', 'true');
        safe.set('convopilot_user', JSON.stringify(u));
        set({ isAuthenticated: true, user: u, pendingVerificationEmail: null });
        return { success: true };
    },

    /* 3) RESEND OTP */
    resendOtp: async (email) => {
        const { ok, data } = await api('/api/auth/send-verification', { name: 'User', email });
        if (!ok) return { success: false, error: data.error || 'Failed to resend code.' };
        return { success: true };
    },

    /* 4) LOGIN (existing user) */
    login: async (email, password) => {
        if (!email || !password) return { success: false, error: 'Enter email and password.' };
        const u = { id: String(Date.now()), name: email.split('@')[0], email };
        safe.set('convopilot_auth', 'true');
        safe.set('convopilot_user', JSON.stringify(u));
        set({ isAuthenticated: true, user: u, pendingVerificationEmail: null });
        return { success: true };
    },

    /* 5) LOGOUT */
    logout: () => {
        safe.set('convopilot_auth', 'false');
        safe.del('convopilot_user');
        set({ isAuthenticated: false, user: null, pendingVerificationEmail: null });
    },

    /* Backwards-compat aliases */
    get signupWithSupabase() { return this.signup; },
    get loginWithSupabase() { return this.login; },
    get verifyOtpCode() { return this.verifyOtp; },
    get resendVerificationEmail() { return this.resendOtp; },
}));
