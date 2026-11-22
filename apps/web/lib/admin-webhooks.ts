export interface AdminWebhookEvent {
  type: 'deposit' | 'payout' | 'fraud_alert' | 'circuit_breaker';
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  timestamp?: string;
}

export async function sendAdminWebhook(event: AdminWebhookEvent): Promise<boolean> {
  const webhookUrl = process.env.ADMIN_WEBHOOK_URL;
  const timestamp = event.timestamp || new Date().toISOString();

  console.log(`[Admin Webhook] [${event.type.toUpperCase()}] ${event.title}: ${event.message}`, event.metadata || '');

  if (!webhookUrl) {
    // Graceful no-op when webhook URL is not configured
    return true;
  }

  try {
    const payload = {
      content: `**[Pathixo Admin Alert]** ${event.title}\n${event.message}`,
      embeds: [
        {
          title: event.title,
          description: event.message,
          color: event.type === 'fraud_alert' ? 0xff0000 : event.type === 'deposit' ? 0x10b981 : 0x3b82f6,
          fields: event.metadata
            ? Object.entries(event.metadata).map(([k, v]) => ({
                name: k,
                value: String(v),
                inline: true,
              }))
            : [],
          timestamp,
        },
      ],
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.debug('[Admin Webhook] Failed to deliver webhook notification:', err);
    return false;
  }
}
