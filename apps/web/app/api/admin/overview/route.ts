import { NextResponse } from 'next/server';
import { verifyAdminSession } from '../../../../lib/admin-auth';
import { adminStore } from '../../../../lib/admin-store';

export async function GET(req: Request) {
  const auth = verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { status: 'error', message: auth.error || 'Access denied' },
      { status: 403 }
    );
  }

  const metrics = adminStore.getMetrics();
  return NextResponse.json({
    status: 'ok',
    admin_email: auth.email,
    metrics,
  });
}

export async function POST(req: Request) {
  const auth = verifyAdminSession(req);
  if (!auth.authorized) {
    return NextResponse.json(
      { status: 'error', message: auth.error || 'Access denied' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    if (typeof body.cws_installs === 'number') {
      adminStore.setCwsInstalls(body.cws_installs);
      adminStore.logAudit({
        admin_email: auth.email || 'jhaabhijeet864@gmail.com',
        action_type: 'SYNC_CWS_INSTALLS',
        target_entity: 'cws_telemetry',
        target_id: 'CWS_STORE',
        justification_note: `Chrome Web Store installs count updated to ${body.cws_installs}`,
        new_state: { cws_installs: body.cws_installs },
      });
    }

    return NextResponse.json({
      status: 'ok',
      metrics: adminStore.getMetrics(),
    });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Failed to update metrics' },
      { status: 400 }
    );
  }
}
