import { describe, it, expect } from 'vitest';
import { POST, GET } from '../../../apps/web/app/api/campaigns/route';

describe('API Route: /api/campaigns', () => {
  it('should reject requests missing required fields', async () => {
    const req = new Request('http://localhost:3000/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ headline: 'Only headline' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.status).toBe('error');
    expect(json.message).toContain('Missing required campaign parameters');
  });

  it('should create an active campaign and configure default CPM/budget', async () => {
    const validCampaign = {
      advertiser_email: 'sponsor@example.com',
      headline: 'Next-Gen Developer Assistant',
      sponsor_name: 'DevAI Corp',
      target_url: 'https://example.com/devai',
      icon_url: 'https://example.com/favicon.ico',
    };

    const req = new Request('http://localhost:3000/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validCampaign),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.campaign.id).toMatch(/^cmp_[a-f0-9]{12}$/);
    expect(json.campaign.status).toBe('active');
    expect(json.campaign.cpm_rate_usd).toBe(20.0);
    expect(json.campaign.budget_total_usd).toBe(100.0);
  });

  it('should retrieve list of campaigns via GET', async () => {
    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(typeof json.total_campaigns).toBe('number');
    expect(Array.isArray(json.campaigns)).toBe(true);
  });
});
