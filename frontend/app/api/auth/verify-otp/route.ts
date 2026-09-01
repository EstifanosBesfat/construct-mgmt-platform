import { NextResponse } from 'next/server';
import { verifyAndConsumeOtp, saveUser } from '@/lib/auth-service';

export async function POST(request: Request) {
  try {
    const { email, code, password, name } = await request.json();

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

    // Verify OTP against disk store
    const result = verifyAndConsumeOtp(normalizedEmail, code);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Save user permanently to disk with Full Name
    const fullName = name && typeof name === 'string' && name.trim() ? name.trim() : normalizedEmail.split('@')[0];

    const saved = saveUser({
      email: normalizedEmail,
      name: fullName,
      password: password,
      createdAt: new Date().toISOString(),
    });

    if (!saved) {
      return NextResponse.json(
        { error: 'Failed to create user account on server' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account registered and verified successfully!',
      user: {
        email: normalizedEmail,
        name: fullName,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to verify code' },
      { status: 500 }
    );
  }
}
