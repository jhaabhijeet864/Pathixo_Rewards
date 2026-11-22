import type {
  AdminMetrics,
  AdminUserSummary,
  CircuitBreakerKey,
  AdminAuditLogEntry,
  CashoutRequest,
  SupportedPlatform,
  AdCampaign,
} from '@pathixo/shared';
import { campaignStore, type CampaignStoreItem } from './campaign-store';
import { sendAdminWebhook } from './admin-webhooks';

export interface AdminUserRecord extends AdminUserSummary {
  ip_address?: string;
  notes?: string;
}

export interface AdminPayoutRecord extends CashoutRequest {
  user_email?: string;
  transaction_reference?: string;
  processed_at?: string;
  rejection_reason?: string;
}

class AdminStore {
  private circuitBreakers: Record<CircuitBreakerKey, boolean> = {
    PAUSE_PAID_ADS: false,
    EXTENSION_MAINTENANCE: false,
    FREEZE_PAYOUTS: false,
  };

  private users: Map<string, AdminUserRecord> = new Map();
  private payouts: Map<string, AdminPayoutRecord> = new Map();
  private auditLogs: AdminAuditLogEntry[] = [];
  private bannedEntities: Set<string> = new Set();
  private cwsInstallsCount = 1248;

  constructor() {
    this.seed();
  }

  public seed() {
    this.users.clear();
    this.payouts.clear();
    this.auditLogs = [];
    this.bannedEntities.clear();

    // Initial seed users
    const seedUsers: AdminUserRecord[] = [
      {
        id: 'usr_alex_8829',
        email: 'alex.dev@gmail.com',
        full_name: 'Alex Developer',
        device_ids: ['dev_usr_8829'],
        balance_usd: 2.148,
        lifetime_earned_usd: 5.62,
        impressions_count: 142,
        referral_code: 'ALEX_DEV',
        referral_count: 3,
        is_banned: false,
        fraud_risk_score: 'low',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
        ip_address: '103.21.244.12',
      },
      {
        id: 'usr_priya_4401',
        email: 'priya.ai@startup.in',
        full_name: 'Priya Sharma',
        device_ids: ['dev_usr_4401'],
        balance_usd: 4.89,
        lifetime_earned_usd: 12.4,
        impressions_count: 380,
        referral_code: 'PRIYA_AI',
        referred_by_code: 'ALEX_DEV',
        referral_count: 8,
        is_banned: false,
        fraud_risk_score: 'low',
        created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
        ip_address: '49.36.12.88',
      },
      {
        id: 'usr_bot_9912',
        email: 'clickfarm88@tempmail.org',
        full_name: 'Fast Clicker',
        device_ids: ['dev_bot_9912', 'dev_bot_9913'],
        balance_usd: 1.85,
        lifetime_earned_usd: 1.85,
        impressions_count: 610,
        referral_code: 'FARM_FAST',
        referred_by_code: 'ALEX_DEV',
        referral_count: 12,
        is_banned: false,
        fraud_risk_score: 'high',
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
        ip_address: '185.220.101.5', // Known VPN / suspicious exit node
        notes: 'High dwell-time clustering detected (30 impressions in 20 mins)',
      },
    ];

    for (const u of seedUsers) {
      this.users.set(u.id, u);
    }

    // Initial seed payouts
    const seedPayouts: AdminPayoutRecord[] = [
      {
        id: 'pay_req_101',
        device_id: 'dev_usr_4401',
        user_email: 'priya.ai@startup.in',
        amount_usd: 3.5,
        payout_method: 'upi',
        payout_destination: 'priya@oksbi',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'pay_req_102',
        device_id: 'dev_usr_8829',
        user_email: 'alex.dev@gmail.com',
        amount_usd: 2.0,
        payout_method: 'paypal',
        payout_destination: 'alex.dev@gmail.com',
        status: 'pending',
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
      },
    ];

    for (const p of seedPayouts) {
      this.payouts.set(p.id, p);
    }

    // Initial audit log
    this.logAudit({
      admin_email: 'jhaabhijeet864@gmail.com',
      action_type: 'SYSTEM_INITIALIZED',
      target_entity: 'circuit_breaker',
      target_id: 'SYSTEM_BOOT',
      justification_note: 'Master command center initialized with verified superadmin allowlist.',
    });
  }

  // 1. Metrics & Overview
  public getMetrics(): AdminMetrics {
    const campaigns = campaignStore.getAllCampaigns();

    // Total advertiser money deposited
    let totalInflowUsd = 0;
    for (const c of campaigns) {
      totalInflowUsd += c.budget_total_usd;
    }

    // User liabilities: sum of all active user balances
    let userLiabilityUsd = 0;
    for (const u of this.users.values()) {
      if (!u.is_banned) {
        userLiabilityUsd += u.balance_usd;
      }
    }

    // 60% user pool, 10% referral pool, 30% platform gross profit
    const platformProfitUsd = Number((totalInflowUsd * 0.3).toFixed(2));
    const referralPoolUsd = Number((totalInflowUsd * 0.1).toFixed(2));

    // Active campaigns count
    const activeCampaigns = campaigns.filter((c) => c.status === 'active');

    // Aggregate platform impressions
    const platformDist: AdminMetrics['platform_distribution'] = {
      chatgpt: { impressions: 0, avg_dwell_ms: 5400, share_percentage: 0 },
      claude: { impressions: 0, avg_dwell_ms: 5800, share_percentage: 0 },
      gemini: { impressions: 0, avg_dwell_ms: 4900, share_percentage: 0 },
      perplexity: { impressions: 0, avg_dwell_ms: 6100, share_percentage: 0 },
      deepseek: { impressions: 0, avg_dwell_ms: 7200, share_percentage: 0 },
    };

    let totalPlatformImpressions = 0;
    for (const c of campaigns) {
      if (c.metrics?.platform_impressions) {
        for (const [p, count] of Object.entries(c.metrics.platform_impressions)) {
          const plat = p as SupportedPlatform;
          if (platformDist[plat]) {
            platformDist[plat].impressions += count;
            totalPlatformImpressions += count;
          }
        }
      }
    }

    if (totalPlatformImpressions > 0) {
      for (const p of Object.keys(platformDist) as SupportedPlatform[]) {
        platformDist[p].share_percentage = Math.round(
          (platformDist[p].impressions / totalPlatformImpressions) * 100
        );
      }
    }

    return {
      total_inflow_usd: Number(totalInflowUsd.toFixed(2)),
      user_liability_usd: Number(userLiabilityUsd.toFixed(4)),
      platform_profit_usd: platformProfitUsd,
      referral_pool_usd: referralPoolUsd,
      active_campaigns_count: activeCampaigns.length,
      live_extensions_today: 432,
      cws_installs: this.cwsInstallsCount,
      registered_users_count: this.users.size,
      logins_today: 184,
      platform_distribution: platformDist,
      circuit_breakers: { ...this.circuitBreakers },
    };
  }

  // 2. Global Circuit Breakers
  public getCircuitBreakers(): Record<CircuitBreakerKey, boolean> {
    return { ...this.circuitBreakers };
  }

  public setCircuitBreaker(
    key: CircuitBreakerKey,
    isTripped: boolean,
    adminEmail: string,
    reason?: string
  ): boolean {
    if (this.circuitBreakers[key] === undefined) return false;

    const previousState = this.circuitBreakers[key];
    this.circuitBreakers[key] = isTripped;

    this.logAudit({
      admin_email: adminEmail,
      action_type: isTripped ? 'TRIP_CIRCUIT_BREAKER' : 'RESET_CIRCUIT_BREAKER',
      target_entity: 'circuit_breaker',
      target_id: key,
      previous_state: previousState,
      new_state: isTripped,
      justification_note: reason || `Circuit breaker ${key} set to ${isTripped}`,
    });

    sendAdminWebhook({
      type: 'circuit_breaker',
      title: `Circuit Breaker: ${key} ${isTripped ? 'ACTIVATED 🚨' : 'Normalized 🟢'}`,
      message: `Triggered by ${adminEmail}. Reason: ${reason || 'Manual override'}`,
      metadata: { breaker: key, status: isTripped ? 'TRIPPED' : 'NORMAL' },
    });

    return true;
  }

  // 3. User Moderation & Balance Overrides
  public getAllUsers(): AdminUserRecord[] {
    return Array.from(this.users.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getUser(userIdOrDeviceId: string): AdminUserRecord | undefined {
    // Check by user ID
    if (this.users.has(userIdOrDeviceId)) {
      return this.users.get(userIdOrDeviceId);
    }
    // Check by device ID
    for (const u of this.users.values()) {
      if (u.device_ids.includes(userIdOrDeviceId)) {
        return u;
      }
    }
    return undefined;
  }

  public getUserById(userIdOrDeviceId: string): AdminUserRecord | undefined {
    return this.getUser(userIdOrDeviceId);
  }

  public banUser(
    targetIdentifier: string,
    reason: string,
    adminEmail: string
  ): boolean {
    const user = this.getUser(targetIdentifier);
    if (!user) return false;

    user.is_banned = true;
    this.bannedEntities.add(user.id);
    for (const dev of user.device_ids) {
      this.bannedEntities.add(dev);
    }

    // Zero out balance on termination
    const prevBalance = user.balance_usd;
    user.balance_usd = 0.0;

    this.logAudit({
      admin_email: adminEmail,
      action_type: 'BAN_USER',
      target_entity: 'user',
      target_id: user.id,
      previous_state: { is_banned: false, balance_usd: prevBalance },
      new_state: { is_banned: true, balance_usd: 0.0 },
      justification_note: reason,
    });

    sendAdminWebhook({
      type: 'fraud_alert',
      title: `User Terminated & Blacklisted: ${user.email}`,
      message: `Admin ${adminEmail} banned user ${user.id}. Reason: ${reason}`,
      metadata: { userId: user.id, deviceIds: user.device_ids.join(', ') },
    });

    return true;
  }

  public unbanUser(targetIdentifier: string, adminEmail: string): boolean {
    const user = this.getUser(targetIdentifier);
    if (!user) return false;

    user.is_banned = false;
    this.bannedEntities.delete(user.id);
    for (const dev of user.device_ids) {
      this.bannedEntities.delete(dev);
    }

    this.logAudit({
      admin_email: adminEmail,
      action_type: 'UNBAN_USER',
      target_entity: 'user',
      target_id: user.id,
      previous_state: { is_banned: true },
      new_state: { is_banned: false },
      justification_note: 'Ban manually lifted by admin',
    });

    return true;
  }

  public adjustUserBalance(
    userId: string,
    adjustmentUsd: number,
    reason: string,
    adminEmail: string
  ): { success: boolean; newBalance?: number; error?: string } {
    const user = this.users.get(userId);
    if (!user) return { success: false, error: 'User not found' };

    const prevBalance = user.balance_usd;
    const nextBalance = Math.max(0, Number((prevBalance + adjustmentUsd).toFixed(4)));
    user.balance_usd = nextBalance;

    if (adjustmentUsd > 0) {
      user.lifetime_earned_usd = Number((user.lifetime_earned_usd + adjustmentUsd).toFixed(4));
    }

    this.logAudit({
      admin_email: adminEmail,
      action_type: 'BALANCE_OVERRIDE',
      target_entity: 'user',
      target_id: userId,
      previous_state: { balance_usd: prevBalance },
      new_state: { balance_usd: nextBalance, adjustment: adjustmentUsd },
      justification_note: reason,
    });

    return { success: true, newBalance: nextBalance };
  }

  // 4. Campaign Moderation
  public moderateCampaign(
    campaignId: string,
    updates: Partial<Pick<CampaignStoreItem, 'headline' | 'target_url' | 'badge' | 'status' | 'sponsor_name' | 'icon_url' | 'cpm_rate_usd' | 'budget_total_usd'>>,
    adminEmail: string
  ): CampaignStoreItem | undefined {
    const existing = campaignStore.getCampaign(campaignId);
    if (!existing) return undefined;

    const prevState = JSON.parse(JSON.stringify(existing));
    const updated = campaignStore.updateCampaign(campaignId, updates);

    if (updated) {
      if (updates.cpm_rate_usd !== undefined) updated.cpm_rate_usd = updates.cpm_rate_usd;
      if (updates.budget_total_usd !== undefined) updated.budget_total_usd = updates.budget_total_usd;
      if ((updates as Record<string, unknown>).total_budget_usd !== undefined) {
        updated.budget_total_usd = Number((updates as Record<string, unknown>).total_budget_usd);
      }

      this.logAudit({
        admin_email: adminEmail,
        action_type: 'EDIT_CAMPAIGN',
        target_entity: 'campaign',
        target_id: campaignId,
        previous_state: prevState,
        new_state: updated,
        justification_note: 'Direct admin campaign modification',
      });
    }

    return updated;
  }

  // 5. Payout Settlement
  public getAllPayouts(): AdminPayoutRecord[] {
    return Array.from(this.payouts.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public settlePayout(
    payoutId: string,
    transactionReference: string,
    adminEmail: string
  ): boolean {
    const payout = this.payouts.get(payoutId);
    if (!payout || payout.status !== 'pending') return false;

    payout.status = 'settled' as any;
    payout.transaction_reference = transactionReference.trim();
    payout.processed_at = new Date().toISOString();

    this.logAudit({
      admin_email: adminEmail,
      action_type: 'SETTLE_PAYOUT',
      target_entity: 'payout',
      target_id: payoutId,
      new_state: {
        status: 'settled',
        reference: transactionReference,
        amount: payout.amount_usd,
      },
      justification_note: `Dispatched via ${payout.payout_method.toUpperCase()} (Ref: ${transactionReference})`,
    });

    sendAdminWebhook({
      type: 'payout',
      title: `Payout Settled: $${payout.amount_usd.toFixed(2)} to ${payout.payout_destination}`,
      message: `Admin ${adminEmail} settled payout ${payoutId} via ${payout.payout_method}. UTR/Ref: ${transactionReference}`,
      metadata: {
        amount: payout.amount_usd,
        method: payout.payout_method,
        destination: payout.payout_destination,
        ref: transactionReference,
      },
    });

    return true;
  }

  public rejectPayout(
    payoutId: string,
    reason: string,
    adminEmail: string
  ): boolean {
    const payout = this.payouts.get(payoutId);
    if (!payout || payout.status !== 'pending') return false;

    payout.status = 'rejected';
    payout.rejection_reason = reason;
    payout.processed_at = new Date().toISOString();

    // Auto-refund amount back to user's reward balance
    const user = this.getUser(payout.device_id);
    if (user) {
      user.balance_usd = Number((user.balance_usd + payout.amount_usd).toFixed(4));
    }

    this.logAudit({
      admin_email: adminEmail,
      action_type: 'REJECT_PAYOUT_REFUND',
      target_entity: 'payout',
      target_id: payoutId,
      new_state: { status: 'rejected', refundedUsd: payout.amount_usd },
      justification_note: reason,
    });

    return true;
  }

  // 6. Audit Logging
  public logAudit(entry: Omit<AdminAuditLogEntry, 'id' | 'created_at'>): AdminAuditLogEntry {
    const record: AdminAuditLogEntry = {
      id: `audit_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`,
      created_at: new Date().toISOString(),
      ...entry,
    };
    this.auditLogs.unshift(record);
    return record;
  }

  public getAuditLogs(): AdminAuditLogEntry[] {
    return [...this.auditLogs];
  }

  // 7. CSV Exports
  public exportCSV(type: 'revenue' | 'payouts' | 'pnl' | 'pl'): string {
    if (type === 'revenue') {
      const campaigns = campaignStore.getAllCampaigns();
      const headers = ['Campaign ID', 'Advertiser Email', 'Sponsor', 'Budget ($)', 'CPM ($)', 'Status', 'Created At'];
      const rows = campaigns.map((c) =>
        [c.id, c.advertiser_email, `"${c.sponsor_name}"`, c.budget_total_usd, c.cpm_rate_usd, c.status, c.created_at].join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }

    if (type === 'payouts') {
      const payouts = this.getAllPayouts();
      const headers = ['Payout ID', 'Device ID', 'Destination', 'Amount ($)', 'Method', 'Status', 'Reference / UTR', 'Date'];
      const rows = payouts.map((p) =>
        [p.id, p.device_id, `"${p.payout_destination}"`, p.amount_usd, p.payout_method, p.status, p.transaction_reference || 'N/A', p.created_at].join(',')
      );
      return [headers.join(','), ...rows].join('\n');
    }

    // P&L summary
    const m = this.getMetrics();
    const headers = ['Gross Inflow ($)', 'User Liability 60% ($)', 'Referral Reserve 10% ($)', 'Platform Profit 30% ($)', 'Generated At'];
    const row = [m.total_inflow_usd, m.user_liability_usd, m.referral_pool_usd, m.platform_profit_usd, new Date().toISOString()];
    return [headers.join(','), row.join(',')].join('\n');
  }

  public exportCsv(type: 'revenue' | 'payouts' | 'pnl' | 'pl'): string {
    return this.exportCSV(type);
  }
}

export const adminStore = new AdminStore();
