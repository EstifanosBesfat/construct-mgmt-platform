import { NextResponse } from 'next/server';
import { findUserByEmail } from '@/lib/auth-service';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = findUserByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'No account found with this email. Please register first.' },
        { status: 404 }
      );
    }

    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Incorrect password. Please try again.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Signed in successfully',
      user: {
        email: user.email,
        name: user.name || user.email.split('@')[0],
      },
    });

    // Set secure authentication cookie for Next.js route protection
    response.cookies.set({
      name: 'cms_auth_session',
      value: user.email,
      path: '/',
      httpOnly: false, // Accessible to client and middleware
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    );
  }
}
