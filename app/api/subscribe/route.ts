import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // If we have a Google Script URL, use it
    if (GOOGLE_SCRIPT_URL) {
      const res = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      if (res.ok) {
        return NextResponse.json(
          { message: 'Welcome aboard! 🎉', success: true },
          { status: 200 }
        );
      }
    }

    // Fallback: simple success for demo (logs to console)
    console.log('📧 New subscriber:', normalizedEmail);
    console.log('Note: Configure GOOGLE_SCRIPT_URL for persistent storage');

    return NextResponse.json(
      { message: 'Welcome aboard! 🎉', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}