import { describe, it, expect, beforeEach } from 'vitest';
import { GET as getOverview } from '../../../apps/web/app/api/admin/overview/route';
import { GET as getCircuitBreakers, POST as postCircuitBreakers } from '../../../apps/web/app/api/admin/circuit-breakers/route';
import { GET as getCampaigns, PATCH as patchCampaigns } from '../../../apps/web/app/api/admin/campaigns/route';
import { GET as getUsers } from '../../../apps/web/app/api/admin/users/route';
import { POST as moderateUser } from '../../../apps/web/app/api/admin/users/moderate/route';
import { GET as getPayouts } from '../../../apps/web/app/api/admin/payouts/route';
import { POST as settlePayout } from '../../../apps/web/app/api/admin/payouts/settle/route';
import { POST as rejectPayout } from '../../../apps/web/app/api/admin/payouts/reject/route';
import { GET as getCsvReport } from '../../../apps/web/app/api/admin/reports/csv/route';
import { GET as getAuditLogs } from '../../../apps/web/app/api/admin/audit-logs/route';
import { adminStore } from '../../../apps/web/lib/admin-store';
import { campaignStore } from '../../../apps/web/lib/campaign-store';

const SUPERADMIN_EMAIL = 'jhaabhijeet864@gmail.com';
const UNAUTHORIZED_EMAIL = 'random.hacker@gmail.com';

describe('Admin Console API Suite', () => {
  beforeEach(() => {
    adminStore.seed();
    campaignStore.seed();
  });

  describe('1. Strict Access Control & Route Guarding', () => {
    it('should reject requests without authorization headers with HTTP 403', async () => {
      const req = new Request('http://localhost:3000/api/admin/overview');
      const res = await getOverview(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.status).toBe('error');
      expect(json.message).toContain('Access denied');
    });

    it('should reject unauthorized emails not in allowlist with HTTP 403', async () => {
      const req = new Request('http://localhost:3000/api/admin/overview', {
        headers: { 'x-admin-email': UNAUTHORIZED_EMAIL },
      });
      const res = await getOverview(req);
      expect(res.status).toBe(403);
    });

    it('should authorize hardcoded superadmin jhaabhijeet864@gmail.com with HTTP 200', async () => {
      const req = new Request('http://localhost:3000/api/admin/overview', {
        headers: { 'x-admin-email': SUPERADMIN_EMAIL },
      });
      const res = await getOverview(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ok');
      expect(json.metrics).toBeDefined();
      expect(json.admin_email).toBe(SUPERADMIN_EMAIL);
      expect(json.metrics.cws_installs).toBeGreaterThanOrEqual(0);
      expect(json.metrics.total_inflow_usd).toBeGreaterThanOrEqual(0);
    });
  });

  describe('2. Emergency Global Circuit Breakers', () => {
    it('should fetch current circuit breaker statuses', async () => {
      const req = new Request('http://localhost:3000/api/admin/circuit-breakers', {
        headers: { 'x-admin-email': SUPERADMIN_EMAIL },
      });
      const res = await getCircuitBreakers(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.circuit_breakers.PAUSE_PAID_ADS).toBe(false);
      expect(json.circuit_breakers.EXTENSION_MAINTENANCE).toBe(false);
      expect(json.circuit_breakers.FREEZE_PAYOUTS).toBe(false);
    });

    it('should trip and reset circuit breakers with audit logging', async () => {
      const postReq = new Request('http://localhost:3000/api/admin/circuit-breakers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': SUPERADMIN_EMAIL,
        },
        body: JSON.stringify({
          breaker_key: 'PAUSE_PAID_ADS',
          is_tripped: true,
          reason: 'Emergency test of house ads fallback',
        }),
      });

      const res = await postCircuitBreakers(postReq);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.circuit_breakers.PAUSE_PAID_ADS).toBe(true);

      // Verify audit trail logged the breaker trip
      const logs = adminStore.getAuditLogs();
      expect(logs[0].action_type).toBe('TRIP_CIRCUIT_BREAKER');
      expect(logs[0].target_id).toBe('PAUSE_PAID_ADS');
    });
  });

  describe('3. Campaign & Creative Moderation', () => {
    it('should fetch all campaigns and allow pausing/editing', async () => {
      const getReq = new Request('http://localhost:3000/api/admin/campaigns', {
        headers: { 'x-admin-email': SUPERADMIN_EMAIL },
      });
      const getRes = await getCampaigns(getReq);
      expect(getRes.status).toBe(200);
      const getJson = await getRes.json();
      expect(getJson.campaigns.length).toBeGreaterThan(0);

      const targetId = getJson.campaigns[0].id;

      // Edit campaign
      const patchReq = new Request('http://localhost:3000/api/admin/campaigns', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': SUPERADMIN_EMAIL,
        },
        body: JSON.stringify({
          campaign_id: targetId,
          status: 'paused',
          headline: 'Updated Master Creative Headline',
          total_budget_usd: 500,
        }),
      });

      const patchRes = await patchCampaigns(patchReq);
      expect(patchRes.status).toBe(200);
      const patchJson = await patchRes.json();
      expect(patchJson.campaign.status).toBe('paused');
      expect(patchJson.campaign.headline).toBe('Updated Master Creative Headline');
      expect(patchJson.campaign.budget_total_usd).toBe(500);
    });
  });

  describe('4. User Moderation, Banning & Balance Adjustments', () => {
    it('should ban a user and zero their balance', async () => {
      adminStore.registerUser({
        id: 'usr_bot_9912',
        email: 'bot@clickfarm.io',
        device_ids: ['dev_bot_1123'],
        balance_usd: 14.5,
        impressions_count: 500,
        lifetime_earned_usd: 14.5,
        referral_count: 0,
        fraud_risk_score: 'high',
        is_banned: false,
        created_at: new Date().toISOString(),
      });

      const banReq = new Request('http://localhost:3000/api/admin/users/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': SUPERADMIN_EMAIL,
        },
        body: JSON.stringify({
          user_id: 'usr_bot_9912',
          action: 'ban',
          reason: 'Click farm activity detected',
        }),
      });

      const res = await moderateUser(banReq);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe('ok');

      // Check updated user status
      const user = adminStore.getUserById('usr_bot_9912');
      expect(user?.is_banned).toBe(true);
      expect(user?.balance_usd).toBe(0);
    });

    it('should credit or debit a user balance with reason', async () => {
      adminStore.registerUser({
        id: 'usr_alex_8829',
        email: 'alex@company.com',
        device_ids: ['dev_alex_991'],
        balance_usd: 2.148,
        impressions_count: 80,
        lifetime_earned_usd: 2.148,
        referral_count: 2,
        fraud_risk_score: 'low',
        is_banned: false,
        created_at: new Date().toISOString(),
      });

      const adjustReq = new Request('http://localhost:3000/api/admin/users/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': SUPERADMIN_EMAIL,
        },
        body: JSON.stringify({
          user_id: 'usr_alex_8829',
          action: 'adjust_balance',
          adjustment_type: 'credit',
          adjustment_amount: 1.5,
          reason: 'Goodwill bonus for reporting an ad render bug',
        }),
      });

      const res = await moderateUser(adjustReq);
      expect(res.status).toBe(200);

      const user = adminStore.getUserById('usr_alex_8829');
      // Original was 2.148 + 1.5 = 3.648
      expect(user?.balance_usd).toBeCloseTo(3.648, 2);
    });
  });

  describe('5. Payout Settlement (UTR Entry) and Rejection with Auto-Refund', () => {
    it('should settle payout with bank UTR transaction reference', async () => {
      adminStore.registerPayout({
        id: 'pay_req_101',
        device_id: 'dev_alex_991',
        user_email: 'alex@company.com',
        amount_usd: 2.0,
        payout_method: 'upi',
        payout_destination: 'alex@okaxis',
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      const req = new Request('http://localhost:3000/api/admin/payouts/settle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': SUPERADMIN_EMAIL,
        },
        body: JSON.stringify({
          payout_id: 'pay_req_101',
          transaction_reference: 'UTR_504928174982',
        }),
      });

      const res = await settlePayout(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.payout.status).toBe('completed');
      expect(json.payout.transaction_reference).toBe('UTR_504928174982');
    });

    it('should reject payout and automatically refund amount to user balance', async () => {
      adminStore.registerUser({
        id: 'usr_alex_8829',
        email: 'alex@company.com',
        device_ids: ['dev_usr_8829'],
        balance_usd: 1.0,
        impressions_count: 50,
        lifetime_earned_usd: 3.0,
        referral_count: 0,
        fraud_risk_score: 'low',
        is_banned: false,
        created_at: new Date().toISOString(),
      });
      adminStore.registerPayout({
        id: 'pay_req_102',
        device_id: 'dev_usr_8829',
        user_email: 'alex@company.com',
        amount_usd: 2.0,
        payout_method: 'paypal',
        payout_destination: 'alex@paypal.com',
        status: 'pending',
        created_at: new Date().toISOString(),
      });

      // Find initial user balance for pay_req_102 (dev_usr_8829 -> usr_alex_8829)
      const initialUser = adminStore.getUserById('usr_alex_8829');
      const initialBalance = initialUser?.balance_usd || 0;

      const req = new Request('http://localhost:3000/api/admin/payouts/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': SUPERADMIN_EMAIL,
        },
        body: JSON.stringify({
          payout_id: 'pay_req_102',
          reason: 'Invalid PayPal account name mismatch',
        }),
      });

      const res = await rejectPayout(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.payout.status).toBe('rejected');
      expect(json.payout.rejection_reason).toBe('Invalid PayPal account name mismatch');

      // Verify user received the $2.00 refund back into their balance!
      const refundedUser = adminStore.getUserById('usr_alex_8829');
      expect(refundedUser?.balance_usd).toBeCloseTo(initialBalance + 2.0, 2);
    });
  });

  describe('6. Accounting Reports & CSV Exports', () => {
    it('should export profit & loss summary CSV', async () => {
      const req = new Request('http://localhost:3000/api/admin/reports/csv?type=pl', {
        headers: { 'x-admin-email': SUPERADMIN_EMAIL },
      });

      const res = await getCsvReport(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toContain('text/csv');

      const csv = await res.text();
      expect(csv).toContain('Gross Inflow ($)');
      expect(csv).toContain('User Liability 60% ($)');
      expect(csv).toContain('Platform Profit 30% ($)');
    });

    it('should export revenue and payouts CSVs', async () => {
      const revReq = new Request('http://localhost:3000/api/admin/reports/csv?type=revenue', {
        headers: { 'x-admin-email': SUPERADMIN_EMAIL },
      });
      const revRes = await getCsvReport(revReq);
      expect(revRes.status).toBe(200);
      const revCsv = await revRes.text();
      expect(revCsv).toContain('Campaign ID,Advertiser Email,Sponsor');

      const payReq = new Request('http://localhost:3000/api/admin/reports/csv?type=payouts', {
        headers: { 'x-admin-email': SUPERADMIN_EMAIL },
      });
      const payRes = await getCsvReport(payReq);
      expect(payRes.status).toBe(200);
      const payCsv = await payRes.text();
      expect(payCsv).toContain('Payout ID,Device ID,Destination,Amount');
    });
  });

  describe('7. Immutable Audit Logs', () => {
    it('should record every administrative action into audit logs', async () => {
      const req = new Request('http://localhost:3000/api/admin/audit-logs?limit=50', {
        headers: { 'x-admin-email': SUPERADMIN_EMAIL },
      });
      const res = await getAuditLogs(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(Array.isArray(json.logs)).toBe(true);
      expect(json.logs.length).toBeGreaterThan(0);
      expect(json.logs[0].admin_email).toBe(SUPERADMIN_EMAIL);
    });
  });
});
