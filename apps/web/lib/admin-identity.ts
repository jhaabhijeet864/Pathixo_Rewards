export const ADMIN_EMAIL_ALLOWLIST = ['jhaabhijeet864@gmail.com'] as const;

export function isSuperAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return (ADMIN_EMAIL_ALLOWLIST as readonly string[]).includes(email.trim().toLowerCase());
}
