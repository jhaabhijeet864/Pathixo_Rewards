import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import type { NextResponse } from 'next/server';

export const SESSION_COOKIE = 'pathixo_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const LOCAL_ONLY_SECRET = 'pathixo-local-development-session-secret-v1';

export interface AuthSession {
  email: string;
  name: string;
  role: 'user' | 'superadmin';
  issuedAt: number;
  expiresAt: number;
}

function sessionSecret(): string | null {
  if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32) return process.env.AUTH_SECRET;
  return process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? LOCAL_ONLY_SECRET
    : null;
}

function sign(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

export function createSessionToken(email: string, name: string, role: AuthSession['role']): string | null {
  const secret = sessionSecret();
  if (!secret) return null;
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthSession = {
    email: email.trim().toLowerCase(),
    name: name.trim().slice(0, 128),
    role,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_SECONDS,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encoded}.${sign(encoded, secret)}`;
}

export function verifySessionToken(token: string | null | undefined): AuthSession | null {
  const secret = sessionSecret();
  if (!secret || !token || token.length > 2048) return null;
  const [encoded, receivedSignature, extra] = token.split('.');
  if (!encoded || !receivedSignature || extra) return null;
  const expected = Buffer.from(sign(encoded, secret));
  const received = Buffer.from(receivedSignature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;
  try {
    const value = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Partial<AuthSession>;
    const now = Math.floor(Date.now() / 1000);
    if (
      typeof value.email !== 'string' || !value.email.includes('@') ||
      typeof value.name !== 'string' ||
      (value.role !== 'user' && value.role !== 'superadmin') ||
      typeof value.issuedAt !== 'number' || typeof value.expiresAt !== 'number' ||
      value.issuedAt > now + 60 || value.expiresAt <= now ||
      value.expiresAt - value.issuedAt > SESSION_TTL_SECONDS
    ) return null;
    return value as AuthSession;
  } catch {
    return null;
  }
}

export function getSessionFromRequest(request: Request): AuthSession | null {
  const cookieHeader = request.headers.get('cookie') || '';
  const entry = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return verifySessionToken(entry?.slice(SESSION_COOKIE.length + 1));
}

export function accountStoreKey(email: string): string {
  return `acct_${createHash('sha256').update(email.trim().toLowerCase()).digest('hex').slice(0, 32)}`;
}

export function setSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
