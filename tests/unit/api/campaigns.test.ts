import { describe, it, expect } from 'vitest';
import { POST, GET, PATCH } from '../../../apps/web/app/api/campaigns/route';

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

  it('should convert INR budget to USD at 1:85 parity', async () => {
    const inrCampaign = {
      advertiser_email: 'india@startup.in',
      headline: 'Build Faster in Bengaluru',
      sponsor_name: 'IndieAI',
      target_url: 'https://indieai.in',
      currency: 'INR',
      budget_inr: 850, // Rs. 850 = $10 USD
      cpm_rate_usd: 20.0,
    };

    const req = new Request('http://localhost:3000/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inrCampaign),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('success');
    expect(json.campaign.currency).toBe('INR');
    expect(json.campaign.budget_total_usd).toBe(10.0);
  });

  it('should retrieve list of campaigns via GET', async () => {
    const res = await GET(new Request('http://localhost:3000/api/campaigns'));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(typeof json.total_campaigns).toBe('number');
    expect(Array.isArray(json.campaigns)).toBe(true);
  });

  it('should retrieve a single campaign by ID via GET', async () => {
    const req = new Request('http://localhost:3000/api/campaigns?id=cmp_demo_cursor');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.campaign.id).toBe('cmp_demo_cursor');
    expect(json.campaign.sponsor_name).toBe('Cursor');
    expect(json.campaign.metrics).toBeDefined();
  });

  it('should filter campaigns by email via GET', async () => {
    const req = new Request('http://localhost:3000/api/campaigns?email=team@cursor.com');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.total_campaigns).toBeGreaterThanOrEqual(1);
    expect(json.campaigns[0].advertiser_email).toBe('team@cursor.com');
  });

  it('should pause, resume, and top-up campaign via PATCH', async () => {
    // 1. Pause
    const pauseReq = new Request('http://localhost:3000/api/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'cmp_demo_cursor', status: 'paused' }),
    });
    const pauseRes = await PATCH(pauseReq);
    expect(pauseRes.status).toBe(200);
    const pauseJson = await pauseRes.json();
    expect(pauseJson.campaign.status).toBe('paused');

    // 2. Resume & add budget
    const resumeReq = new Request('http://localhost:3000/api/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'cmp_demo_cursor', status: 'active', add_budget_usd: 15.0 }),
    });
    const resumeRes = await PATCH(resumeReq);
    expect(resumeRes.status).toBe(200);
    const resumeJson = await resumeRes.json();
    expect(resumeJson.campaign.status).toBe('active');
    expect(resumeJson.campaign.budget_total_usd).toBeGreaterThan(100.0);
  });
});
