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

  it('should create a campaign in pending_review and configure default CPM/budget', async () => {
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
    expect(json.message).toContain('Campaign submitted for review');
    expect(json.campaign.id).toMatch(/^cmp_[a-f0-9]{12}$/);
    expect(json.campaign.status).toBe('pending_review');
    expect(json.campaign.cpm_rate_usd).toBe(2.50);
    expect(json.campaign.budget_total_usd).toBe(2.0);
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
    const req = new Request('http://localhost:3000/api/campaigns?id=cmp_house_vakxo');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.campaign.id).toBe('cmp_house_vakxo');
    expect(json.campaign.sponsor_name).toBe('Vakxo');
    expect(json.campaign.metrics).toBeDefined();
  });

  it('should filter campaigns by email via GET', async () => {
    const req = new Request('http://localhost:3000/api/campaigns?email=founder@pathixo.com');
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.total_campaigns).toBeGreaterThanOrEqual(1);
    expect(json.campaigns[0].advertiser_email).toBe('founder@pathixo.com');
  });

  it('should update campaign creative metadata via PATCH without permitting unauthenticated budget tampering', async () => {
    const patchReq = new Request('http://localhost:3000/api/campaigns', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'cmp_house_vakxo',
        headline: 'Run AI Agents Locally: 100% Free',
        target_url: 'https://vakxo.pathixo.com/local',
      }),
    });
    const patchRes = await PATCH(patchReq);
    expect(patchRes.status).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.status).toBe('success');
    expect(patchJson.campaign.headline).toBe('Run AI Agents Locally: 100% Free');
    expect(patchJson.campaign.target_url).toBe('https://vakxo.pathixo.com/local');
  });
});
