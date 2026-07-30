const express = require('express');
const cors = require('cors');
require('dotenv').config();

const contactsRouter = require('./routes/contacts');
const keyPointsRouter = require('./routes/keyPoints');
const todosRouter = require('./routes/todos');
const { sendVerificationEmail, verifyOtpCode } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 5000;

// Allow all origins (needed for APK WebView)
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── AUTH: Send 6-digit OTP to user's email from smirfan9247@gmail.com ───
app.post('/api/auth/send-verification', async (req, res) => {
    try {
        const { name, email } = req.body;
        if (!email) return res.status(400).json({ success: false, error: 'Email is required.' });

        console.log(`📧 Sending OTP to: ${email}`);
        const result = await sendVerificationEmail(name || 'User', email.trim());
        return res.json({ success: true, message: `Code sent to ${email}` });
    } catch (err) {
        console.error('❌ send-verification error:', err.message);
        return res.status(500).json({ success: false, error: 'Failed to send verification email. Server error.' });
    }
});

// ─── AUTH: Verify OTP code ───
app.post('/api/auth/verify-code', (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) return res.status(400).json({ success: false, error: 'Email and code are required.' });

        const result = verifyOtpCode(email.trim(), code.trim());
        if (!result.valid) {
            return res.status(400).json({ success: false, error: result.message });
        }
        return res.json({ success: true, message: 'Email verified!' });
    } catch (err) {
        console.error('❌ verify-code error:', err.message);
        return res.status(500).json({ success: false, error: 'Verification failed. Server error.' });
    }
});

// ─── Data Routes ───
app.use('/api/contacts', contactsRouter);
app.use('/api/key-points', keyPointsRouter);
app.use('/api/todos', todosRouter);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', appName: 'ConvoPilot API', version: '1.0.0', timestamp: new Date().toISOString() });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 ConvoPilot API running on http://0.0.0.0:${PORT}`);
});
