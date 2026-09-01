import { NextResponse } from 'next/server';
import { verifyAndConsumeOtp, resetPassword, findUserByEmail } from '@/lib/auth-service';

export async function POST(request: Request) {
  try {
    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, verification code, and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'New password must be at least 6 characters' },
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

    // Reset password in disk store
    const success = resetPassword(normalizedEmail, newPassword);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update password. Account not found.' },
        { status: 404 }
      );
    }

    const user = findUserByEmail(normalizedEmail);

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now sign in with your new password.',
      user: {
        email: normalizedEmail,
        name: user?.name,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to reset password' },
      { status: 500 }
    );
  }
}
