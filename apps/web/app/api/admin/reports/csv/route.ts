import { NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../../lib/admin-auth';
import { adminStore } from '../../../../../lib/admin-store';

export async function GET(req: Request) {
  const auth = verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { status: 'error', message: auth.error || 'Access denied' },
      { status: 403 }
    );
  }

  const url = new URL(req.url);
  const typeParam = url.searchParams.get('type') as 'revenue' | 'payouts' | 'pnl' | null;
  const type = typeParam && ['revenue', 'payouts', 'pnl'].includes(typeParam) ? typeParam : 'pnl';

  const csvContent = adminStore.exportCSV(type);
  const filename = `pathixo_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
