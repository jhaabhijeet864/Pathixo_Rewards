export const ADMIN_EMAIL_ALLOWLIST = [
  'jhaabhijeet864@gmail.com',
] as const;

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return (ADMIN_EMAIL_ALLOWLIST as readonly string[]).includes(normalized);
}

export interface AdminAuthResult {
  authorized: boolean;
  email?: string;
  error?: string;
}

export function verifyAdminSession(req: Request): AdminAuthResult {
  // 1. Check custom admin header
  const adminHeader = req.headers.get('x-admin-email');
  if (adminHeader && isSuperAdminEmail(adminHeader)) {
    return { authorized: true, email: adminHeader.trim().toLowerCase() };
  }

  // 2. Check Authorization Bearer header (e.g., Bearer jhaabhijeet864@gmail.com or signed token)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (isSuperAdminEmail(token)) {
      return { authorized: true, email: token.toLowerCase() };
    }
  }

  // 3. Fallback: Check search params for testing / development
  try {
    const url = new URL(req.url);
    const queryEmail = url.searchParams.get('admin_email');
    if (queryEmail && isSuperAdminEmail(queryEmail)) {
      return { authorized: true, email: queryEmail.trim().toLowerCase() };
    }
  } catch {
    // URL parsing fallback
  }

  return {
    authorized: false,
    error: 'Access denied: Valid superadmin authorization required.',
  };
}
