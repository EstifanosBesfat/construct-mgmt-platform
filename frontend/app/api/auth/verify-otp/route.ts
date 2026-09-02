import { NextResponse } from 'next/server';
import { verifyAndConsumeOtp, saveUser } from '@/lib/auth-service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, password, name, otpToken } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify OTP against cryptographic signed token or fallback stores
    const cookieToken = (request as any).cookies?.get?.('cms_otp_token')?.value;
    const token = otpToken || cookieToken;
    const result = verifyAndConsumeOtp(normalizedEmail, code, token);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Save user with Full Name
    const fullName = name && typeof name === 'string' && name.trim() ? name.trim() : normalizedEmail.split('@')[0];

    saveUser({
      email: normalizedEmail,
      name: fullName,
      password: password,
      createdAt: new Date().toISOString(),
    });

    const response = NextResponse.json({
      success: true,
      message: 'Account registered and verified successfully!',
      user: {
        email: normalizedEmail,
        name: fullName,
      },
    });

    response.cookies.set({
      name: 'cms_auth_session',
      value: normalizedEmail,
      path: '/',
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify code' },
      { status: 500 }
    );
  }
}
