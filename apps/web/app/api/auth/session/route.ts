import { NextResponse } from 'next/server';
import { isSuperAdminEmail } from '@/lib/admin-identity';
import { clearSessionCookie, createSessionToken, getSessionFromRequest, setSessionCookie } from '@/lib/auth-session';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({
    authenticated: true,
    user: { email: session.email, name: session.name, role: session.role },
  });
}

export async function POST(request: Request) {
  // This identity shortcut exists only for local UI development and automated tests.
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { status: 'error', message: 'Sign-in provider is not configured. No account was created.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ status: 'error', message: 'Enter a valid email address.' }, { status: 400 });
    }
    const name = email.split('@')[0];
    const role = isSuperAdminEmail(email) ? 'superadmin' : 'user';
    const token = createSessionToken(email, name, role);
    if (!token) return NextResponse.json({ status: 'error', message: 'Session signing is not configured.' }, { status: 503 });
    const response = NextResponse.json({ status: 'ok', user: { email, name, role, logged_in: true } });
    setSessionCookie(response, token);
    return response;
  } catch {
    return NextResponse.json({ status: 'error', message: 'Invalid sign-in request.' }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ status: 'ok' });
  clearSessionCookie(response);
  return response;
}
