import { getSessionFromRequest } from './auth-session';
import { isSuperAdminEmail } from './admin-identity';
export { ADMIN_EMAIL_ALLOWLIST, isSuperAdminEmail } from './admin-identity';

export interface AdminAuthResult {
  authorized: boolean;
  email?: string;
  error?: string;
}

export function verifyAdminSession(req: Request): AdminAuthResult {
  // Explicit fixture support exists only under Vitest's isolated test environment.
  if (process.env.NODE_ENV === 'test') {
    const testEmail = req.headers.get('x-admin-email');
    if (isSuperAdminEmail(testEmail)) return { authorized: true, email: testEmail!.trim().toLowerCase() };
  }
  const session = getSessionFromRequest(req);
  if (session?.role === 'superadmin' && isSuperAdminEmail(session.email)) {
    return { authorized: true, email: session.email };
  }
  return { authorized: false, error: 'Access denied: A verified administrator session is required.' };
}
