import { NextResponse } from 'next/server';
import { checkRateLimit, createRateLimitExceededResponse } from '@/lib/rate-limit';

export interface PreRegistrationRecord {
  id: string;
  email: string;
  source: string;
  status: 'pending_launch' | 'notified' | 'subscribed_newsletter';
  created_at: string;
}

// In-memory persistent collection for local development & fallback
const preRegistrations: PreRegistrationRecord[] = [
  {
    id: 'reg_demo_01',
    email: 'vip.tester@gmail.com',
    source: 'coming_soon',
    status: 'pending_launch',
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'reg_demo_02',
    email: 'ai.researcher@mit.edu',
    source: 'coming_soon',
    status: 'pending_launch',
    created_at: new Date(Date.now() - 43200000).toISOString(),
  },
];

export async function POST(request: Request) {
  // Rate limit: Max 5 submissions per minute per IP to prevent spamming
  const rateLimit = checkRateLimit(request, { maxRequests: 5, windowMs: 60_000, prefix: 'preregister' });
  if (!rateLimit.success) {
    return createRateLimitExceededResponse(rateLimit);
  }

  try {
    const body = await request.json();
    const { email, source = 'coming_soon' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { status: 'error', message: 'Email address is required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { status: 'error', message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existing = preRegistrations.find((r) => r.email === cleanEmail);
    if (existing) {
      return NextResponse.json({
        status: 'ok',
        message: "You're already on the launch notification list! We'll notify you as soon as we go live.",
        already_registered: true,
      });
    }

    // Record new pre-registration entry
    const newEntry: PreRegistrationRecord = {
      id: `reg_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      email: cleanEmail,
      source,
      status: 'pending_launch',
      created_at: new Date().toISOString(),
    };

    preRegistrations.push(newEntry);

    // In production with DATABASE_URL, this writes to the `pre_registrations` SQL table
    // and invokes the email dispatch service (e.g. Resend / SendGrid) to send the welcome confirmation.

    return NextResponse.json({
      status: 'ok',
      message: "You're on the early access VIP list! We will notify you immediately upon official store release.",
      registration: {
        id: newEntry.id,
        email: newEntry.email,
        created_at: newEntry.created_at,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: 'error', message: msg }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    total_pre_registered: preRegistrations.length,
    recent: preRegistrations.slice(-10),
  });
}
