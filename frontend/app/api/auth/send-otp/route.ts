import { NextResponse } from 'next/server';
import { findUserByEmail, saveOtp, generateSignedOtp } from '@/lib/auth-service';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if account already exists!
    const existingUser = findUserByEmail(normalizedEmail);
    if (existingUser) {
      return NextResponse.json(
        {
          error: 'An account with this email already exists. Please sign in instead.',
          alreadyRegistered: true,
        },
        { status: 400 }
      );
    }

    // Generate secure 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;

    // Store locally and generate cryptographic signed token
    saveOtp(normalizedEmail, otpCode, expiresAt);
    const signedToken = generateSignedOtp(normalizedEmail, otpCode, expiresAt);

    const brevoApiKey = process.env.BREVO_API_KEY || '';

    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'yonasleykun27@gmail.com';
    const senderName = process.env.BREVO_SENDER_NAME || 'ConstructCMS';

    // Dispatch real email via Brevo REST API
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [{ email: normalizedEmail }],
        subject: 'Your ConstructCMS Verification Code',
        htmlContent: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; background-color: #0e131f; color: #ffffff; border-radius: 12px; border: 1px solid #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #ea580c; font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">CONSTRUCT CMS</h1>
              <p style="color: #94a3b8; font-size: 12px; margin: 4px 0 0 0;">Construction Management Platform</p>
            </div>
            
            <div style="background-color: #131b2e; border: 1px solid #1e293b; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 16px 0;">Use the verification code below to complete your registration:</p>
              <div style="display: inline-block; background-color: #1e293b; border: 2px solid #ea580c; border-radius: 8px; padding: 14px 28px;">
                <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #ea580c; font-family: monospace;">${otpCode}</span>
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0;">This code is valid for <strong>10 minutes</strong>.</p>
            </div>
            
            <p style="color: #64748b; font-size: 11px; text-align: center; margin: 0;">
              If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    });

    if (!brevoResponse.ok) {
      const errorData = await brevoResponse.text();
      console.error('Brevo API error response:', errorData);
      return NextResponse.json(
        { error: 'Failed to send email. Please check your address or try again.' },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      otpToken: signedToken,
    });

    response.cookies.set({
      name: 'cms_otp_token',
      value: signedToken,
      path: '/',
      httpOnly: false,
      maxAge: 600,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to dispatch verification email' },
      { status: 500 }
    );
  }
}
