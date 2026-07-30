const nodemailer = require('nodemailer');
require('dotenv').config();

// Create Nodemailer Transporter
const createTransporter = () => {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587');
    const user = process.env.EMAIL_USER || 'smirfan9247@gmail.com';
    const pass = process.env.EMAIL_PASS || 'nuxz mkkl fkff tenm';

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass }
    });
};

// Memory store for verification codes (email -> { code, expiresAt, name })
const otpStore = new Map();

// Generate 6-digit OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendVerificationEmail = async (name, email) => {
    const code = generateOtp();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    const cleanEmail = email.toLowerCase().trim();
    otpStore.set(cleanEmail, { code, expiresAt, name });

    const transporter = createTransporter();
    const fromAddress = `"ConvoPilot Support" <smirfan9247@gmail.com>`;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7f6; margin: 0; padding: 20px; color: #1e293b; }
            .container { max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 20px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; }
            .logo { width: 48px; height: 48px; background: rgba(0, 107, 92, 0.1); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #006B5C; margin-bottom: 20px; }
            h2 { color: #0f172a; font-size: 22px; margin-top: 0; margin-bottom: 8px; font-weight: 800; }
            p { font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 24px; }
            .otp-box { background: #f0fdf4; border: 2px dashed #006B5C; border-radius: 14px; padding: 20px; text-align: center; margin: 24px 0; }
            .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 8px; color: #006B5C; margin: 0; }
            .footer { font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="logo">⚡</div>
            <h2>Verify Your Email Address</h2>
            <p>Hi <strong>${name || 'there'}</strong>,</p>
            <p>Welcome to <strong>ConvoPilot</strong>! Please enter the official 6-digit verification code below in the app to complete your registration and unlock your workspace.</p>
            
            <div class="otp-box">
                <p style="margin:0 0 6px 0; font-size:12px; font-weight:700; color:#006B5C; text-transform:uppercase;">YOUR 6-DIGIT OTP CODE</p>
                <div class="otp-code">${code}</div>
            </div>

            <p style="font-size: 13px; color: #64748b;">This code expires in 15 minutes. If you did not request this account creation, please ignore this email.</p>
            
            <div class="footer">
                © ConvoPilot Inc. • Smart Conversation Assistant
            </div>
        </div>
    </body>
    </html>
    `;

    try {
        await transporter.sendMail({
            from: fromAddress,
            to: cleanEmail,
            subject: `${code} is your ConvoPilot verification code`,
            html: htmlContent
        });
        console.log(`✅ Real verification email dispatched to ${cleanEmail} via smirfan9247@gmail.com`);
        return { sent: true, email: cleanEmail };
    } catch (err) {
        console.error('❌ Failed to send verification email via Gmail SMTP:', err.message);
        throw err;
    }
};

const verifyOtpCode = (email, inputCode) => {
    const cleanEmail = email.toLowerCase().trim();
    const record = otpStore.get(cleanEmail);

    if (!record) {
        return { valid: false, message: 'No verification code was sent to this email. Please request a new code.' };
    }

    if (Date.now() > record.expiresAt) {
        otpStore.delete(cleanEmail);
        return { valid: false, message: 'Verification code has expired. Please click resend code.' };
    }

    if (record.code.trim() !== inputCode.trim()) {
        return { valid: false, message: 'Incorrect verification code. Please check your inbox for the code.' };
    }

    otpStore.delete(cleanEmail);
    return { valid: true };
};

module.exports = {
    sendVerificationEmail,
    verifyOtpCode
};
