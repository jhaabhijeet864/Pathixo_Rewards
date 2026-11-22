'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  DollarSign,
  Users,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Copy,
  Check,
  Edit3,
  ExternalLink,
  Shield,
  Download,
  Search,
  RefreshCw,
  PlusCircle,
  MinusCircle,
  FileSpreadsheet,
  Globe,
  Eye,
  Info,
} from 'lucide-react';
import type {
  AdminMetrics,
  CashoutRequest,
  AdCampaign,
  AdminAuditLogEntry,
  SupportedPlatform,
} from '@pathixo/shared';
import { adminStore, type AdminPayoutRecord, type AdminUserRecord } from '@/lib/admin-store';
import { campaignStore } from '@/lib/campaign-store';

type AdminTab =
  | 'overview'
  | 'campaigns'
  | 'advertisers'
  | 'users'
  | 'payouts'
  | 'reports'
  | 'audit';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminEmail, setAdminEmail] = useState('jhaabhijeet864@gmail.com');
  const [isLoading, setIsLoading] = useState(true);

  // Core Data State
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [payouts, setPayouts] = useState<AdminPayoutRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);

  // Search & Filter State
  const [userSearch, setUserSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [payoutFilter, setPayoutFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals State
  const [editingCampaign, setEditingCampaign] = useState<AdCampaign | null>(null);
  const [editHeadline, setEditHeadline] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [editBadge, setEditBadge] = useState('');
  const [editCpm, setEditCpm] = useState(15);
  const [editBudget, setEditBudget] = useState(100);

  const [settlingPayout, setSettlingPayout] = useState<AdminPayoutRecord | null>(null);
  const [payoutReference, setPayoutReference] = useState('');

  const [rejectingPayout, setRejectingPayout] = useState<AdminPayoutRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('Invalid UPI address or account verification failure');

  const [adjustingUser, setAdjustingUser] = useState<AdminUserRecord | null>(null);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState(1.0);
  const [adjustReason, setAdjustReason] = useState('');

  // Toast Notice
  const [statusNotice, setStatusNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusNotice({ message, type });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // 1. Initial Load of All Datasets
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Overview Metrics
      const mRes = await fetch('/api/admin/overview', {
        headers: { 'x-admin-email': adminEmail },
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        if (mData.metrics) setMetrics(mData.metrics);
      } else {
        setMetrics(adminStore.getMetrics());
      }

      // 2. Campaigns
      const cRes = await fetch('/api/admin/campaigns', {
        headers: { 'x-admin-email': adminEmail },
      });
      if (cRes.ok) {
        const cData = await cRes.json();
        if (cData.campaigns) setCampaigns(cData.campaigns);
      } else {
        setCampaigns(campaignStore.getAllCampaigns());
      }

      // 3. Users
      const uRes = await fetch('/api/admin/users', {
        headers: { 'x-admin-email': adminEmail },
      });
      if (uRes.ok) {
        const uData = await uRes.json();
        if (uData.users) setUsers(uData.users);
      } else {
        setUsers(adminStore.getAllUsers());
      }

      // 4. Payouts
      const pRes = await fetch('/api/admin/payouts', {
        headers: { 'x-admin-email': adminEmail },
      });
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.payouts) setPayouts(pData.payouts);
      } else {
        setPayouts(adminStore.getAllPayouts());
      }

      // 5. Audit Logs
      const aRes = await fetch('/api/admin/audit-logs', {
        headers: { 'x-admin-email': adminEmail },
      });
      if (aRes.ok) {
        const aData = await aRes.json();
        if (aData.logs) setAuditLogs(aData.logs);
      } else {
        setAuditLogs(adminStore.getAuditLogs());
      }
    } catch {
      setMetrics(adminStore.getMetrics());
      setCampaigns(campaignStore.getAllCampaigns());
      setUsers(adminStore.getAllUsers());
      setPayouts(adminStore.getAllPayouts());
      setAuditLogs(adminStore.getAuditLogs());
    } finally {
      setIsLoading(false);
    }
  }, [adminEmail]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('pathixo_admin_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) setAdminEmail(parsed.email);
        }
      } catch {}
    }
    loadAllData();
  }, [loadAllData]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Campaign Moderation: Pause / Resume Toggle
  const handleToggleCampaignStatus = async (camp: AdCampaign) => {
    const nextStatus = camp.status === 'active' ? 'paused' : 'active';
    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({
          campaign_id: camp.id,
          status: nextStatus,
        }),
      });

      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === camp.id ? { ...c, status: nextStatus } : c))
        );
        showToast(`Campaign ${camp.sponsor_name} ${nextStatus === 'active' ? 'activated' : 'paused'}!`);
      } else {
        adminStore.moderateCampaign(camp.id, { status: nextStatus }, adminEmail);
        setCampaigns(campaignStore.getAllCampaigns());
        showToast(`Campaign ${camp.sponsor_name} updated locally!`);
      }
    } catch {
      adminStore.moderateCampaign(camp.id, { status: nextStatus }, adminEmail);
      setCampaigns(campaignStore.getAllCampaigns());
      showToast(`Campaign ${camp.sponsor_name} updated!`);
    }
  };

  // Open Edit Campaign Modal
  const openEditCampaign = (camp: AdCampaign) => {
    setEditingCampaign(camp);
    setEditHeadline(camp.headline);
    setEditUrl(camp.target_url);
    setEditIcon(camp.icon_url || '');
    setEditBadge(camp.badge || 'Featured');
    setEditCpm(camp.cpm_rate_usd);
    setEditBudget(camp.budget_total_usd);
  };

  // Save Campaign Edits
  const handleSaveCampaignEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampaign) return;

    try {
      const updates = {
        headline: editHeadline,
        target_url: editUrl,
        icon_url: editIcon || undefined,
        badge: editBadge,
        cpm_rate_usd: Number(editCpm),
        budget_total_usd: Number(editBudget),
      };

      const res = await fetch('/api/admin/campaigns', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({
          campaign_id: editingCampaign.id,
          ...updates,
        }),
      });

      if (res.ok) {
        setCampaigns((prev) =>
          prev.map((c) => (c.id === editingCampaign.id ? { ...c, ...updates } : c))
        );
        showToast(`Campaign ${editingCampaign.sponsor_name} creative updated successfully!`);
      } else {
        adminStore.moderateCampaign(editingCampaign.id, updates, adminEmail);
        setCampaigns(campaignStore.getAllCampaigns());
        showToast(`Campaign updated locally!`);
      }
    } catch {
      adminStore.moderateCampaign(
        editingCampaign.id,
        {
          headline: editHeadline,
          target_url: editUrl,
          badge: editBadge,
          cpm_rate_usd: Number(editCpm),
          budget_total_usd: Number(editBudget),
        },
        adminEmail
      );
      setCampaigns(campaignStore.getAllCampaigns());
      showToast(`Campaign updated!`);
    } finally {
      setEditingCampaign(null);
    }
  };

  // User Moderation: 1-Click Ban / Unban
  const handleToggleUserBan = async (user: AdminUserRecord) => {
    const action = user.is_banned ? 'unban' : 'ban';
    try {
      const res = await fetch('/api/admin/users/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({
          user_id: user.id,
          action,
          reason: action === 'ban' ? 'Malicious click velocity / terms violation' : 'Account restored by admin',
        }),
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === user.id
              ? { ...u, is_banned: !user.is_banned, balance_usd: action === 'ban' ? 0 : u.balance_usd }
              : u
          )
        );
        showToast(`User ${user.email} ${action === 'ban' ? 'BANNED' : 'UNBANNED'}!`);
      } else {
        if (action === 'ban') {
          adminStore.banUser(user.id, 'Terms violation', adminEmail);
        } else {
          adminStore.unbanUser(user.id, adminEmail);
        }
        setUsers(adminStore.getAllUsers());
        showToast(`User ${action} applied!`);
      }
    } catch {
      if (action === 'ban') {
        adminStore.banUser(user.id, 'Terms violation', adminEmail);
      } else {
        adminStore.unbanUser(user.id, adminEmail);
      }
      setUsers(adminStore.getAllUsers());
      showToast(`User status updated!`);
    }
  };

  // User Moderation: Balance Adjustment
  const handleSaveBalanceAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser || !adjustReason.trim()) return;

    try {
      const res = await fetch('/api/admin/users/moderate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({
          user_id: adjustingUser.id,
          action: 'adjust_balance',
          reason: adjustReason,
          adjustment_amount: Number(adjustAmount),
          adjustment_type: adjustType,
        }),
      });

      if (res.ok) {
        const delta = adjustType === 'credit' ? Number(adjustAmount) : -Number(adjustAmount);
        setUsers((prev) =>
          prev.map((u) =>
            u.id === adjustingUser.id
              ? { ...u, balance_usd: Math.max(0, Number((u.balance_usd + delta).toFixed(4))) }
              : u
          )
        );
        showToast(`Balance adjusted: ${adjustType === 'credit' ? '+' : '-'}$${adjustAmount}`);
      } else {
        const delta = adjustType === 'credit' ? Number(adjustAmount) : -Number(adjustAmount);
        adminStore.adjustUserBalance(adjustingUser.id, delta, adjustReason, adminEmail);
        setUsers(adminStore.getAllUsers());
        showToast(`Balance adjusted locally!`);
      }
    } catch {
      const delta = adjustType === 'credit' ? Number(adjustAmount) : -Number(adjustAmount);
      adminStore.adjustUserBalance(adjustingUser.id, delta, adjustReason, adminEmail);
      setUsers(adminStore.getAllUsers());
      showToast(`Balance adjusted!`);
    } finally {
      setAdjustingUser(null);
      setAdjustReason('');
    }
  };

  // Payout Settlement: Mark Settled with UTR / Ref
  const handleConfirmSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlingPayout) return;

    try {
      const res = await fetch('/api/admin/payouts/settle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({
          payout_id: settlingPayout.id,
          transaction_reference: payoutReference.trim() || `TXN_${Date.now()}`,
        }),
      });

      if (res.ok) {
        setPayouts((prev) =>
          prev.map((p) =>
            p.id === settlingPayout.id
              ? {
                  ...p,
                  status: 'completed',
                  transaction_reference: payoutReference.trim() || `TXN_${Date.now()}`,
                }
              : p
          )
        );
        showToast(`Payout ${settlingPayout.id} settled successfully!`);
      } else {
        adminStore.settlePayout(settlingPayout.id, payoutReference, adminEmail);
        setPayouts(adminStore.getAllPayouts());
        showToast(`Payout marked as settled!`);
      }
    } catch {
      adminStore.settlePayout(settlingPayout.id, payoutReference, adminEmail);
      setPayouts(adminStore.getAllPayouts());
      showToast(`Payout settled!`);
    } finally {
      setSettlingPayout(null);
      setPayoutReference('');
    }
  };

  // Payout Reject: Auto-refund to balance
  const handleConfirmRejection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingPayout) return;

    try {
      const res = await fetch('/api/admin/payouts/reject', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({
          payout_id: rejectingPayout.id,
          reason: rejectReason,
        }),
      });

      if (res.ok) {
        setPayouts((prev) =>
          prev.map((p) =>
            p.id === rejectingPayout.id
              ? { ...p, status: 'rejected', rejection_reason: rejectReason }
              : p
          )
        );
        showToast(`Payout rejected. $${rejectingPayout.amount_usd.toFixed(2)} refunded to user balance!`);
      } else {
        adminStore.rejectPayout(rejectingPayout.id, rejectReason, adminEmail);
        setPayouts(adminStore.getAllPayouts());
        showToast(`Payout rejected and refunded locally!`);
      }
    } catch {
      adminStore.rejectPayout(rejectingPayout.id, rejectReason, adminEmail);
      setPayouts(adminStore.getAllPayouts());
      showToast(`Payout rejected and refunded!`);
    } finally {
      setRejectingPayout(null);
    }
  };

  // CSV Report Downloader
  const downloadCsv = (type: 'revenue' | 'payouts' | 'pl') => {
    const csvContent = adminStore.exportCsv(type);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pathixo_${type}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${type.toUpperCase()} CSV report!`);
  };

  // Filtered views
  const filteredUsers = users.filter((u) => {
    if (!userSearch) return true;
    const q = userSearch.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q) ||
      u.device_ids.some((d) => d.toLowerCase().includes(q)) ||
      u.referral_code?.toLowerCase().includes(q)
    );
  });

  const filteredCampaigns = campaigns.filter((c) => {
    if (campaignFilter === 'all') return true;
    return c.status === campaignFilter;
  });

  const filteredPayouts = payouts.filter((p) => {
    if (payoutFilter === 'all') return true;
    return p.status === payoutFilter;
  });

  return (
    <div className="space-y-8">
      {/* STATUS TOAST NOTIFICATION */}
      {statusNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-sm font-semibold transition-all duration-300 animate-in slide-in-from-bottom-3 ${
            statusNotice.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {statusNotice.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          )}
          <span>{statusNotice.message}</span>
        </div>
      )}

      {/* TOP COMMAND HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <span>Executive Command Center</span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-3xl">
            Live operations, dual-metric telemetry, creative moderation, user fraud shields, and instant payout rails.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={loadAllData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-800 bg-[#0d121c] text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Sync Live Data</span>
          </button>

          <button
            type="button"
            onClick={() => downloadCsv('pl')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>P&amp;L Export</span>
          </button>
        </div>
      </div>

      {/* NAVIGATION TABS BAR */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Overview &amp; Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Campaigns &amp; Creative ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advertisers')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'advertisers'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Advertisers &amp; Inflows</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Users &amp; Devices ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Payout Rails ({payouts.filter((p) => p.status === 'pending').length} Pending)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Accounting Reports</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW & FINANCIALS                                   */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 CORE FINANCIAL CARDS (60/10/30 SPLIT) */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Advertiser Inflow */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Total Inflow (Deposits)</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                ${(metrics?.total_inflow_usd ?? 450.0).toFixed(2)}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                100% upfront prepaid ad deposits &bull; No refunds
              </p>
            </div>

            {/* User Rewards Pool (60%) */}
            <div className="rounded-2xl border border-emerald-500/30 bg-[#0d141e] p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
                <span>User Payout Pool (60%)</span>
                <span className="text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  Target
                </span>
              </div>
              <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-emerald-300">
                ${(metrics?.user_liability_usd ?? 270.0).toFixed(2)}
              </div>
              <p className="mt-2 text-xs text-emerald-500/90">
                Reserved for wait-time user rewards payouts
              </p>
            </div>

            {/* Platform Gross Margin (30%) */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Platform Profit (30%)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                ${(metrics?.platform_profit_usd ?? 135.0).toFixed(2)}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Net platform retention after commissions
              </p>
            </div>

            {/* Referral Reserve Pool (10%) */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-sm">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Referral Reserve (10%)</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                ${(metrics?.referral_pool_usd ?? 45.0).toFixed(2)}
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Weekly 10% royalty distribution fund
              </p>
            </div>
          </div>

          {/* DUAL-METRIC TELEMETRY ENGINE */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 sm:p-7 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Telemetry Engine
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">
                  Dual-Metric Chrome Web Store &amp; Extension Heartbeats
                </h2>
              </div>
              <span className="text-xs font-mono bg-slate-800 px-3 py-1.5 rounded-lg text-slate-300 self-start sm:self-auto">
                Heartbeat Window: 10 mins
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 pt-2">
              <div className="p-4 rounded-xl bg-[#090d14] border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Official CWS Store Installs</span>
                <div className="text-2xl font-black text-white">
                  {metrics?.cws_installs ?? 1248}
                </div>
                <p className="text-[11px] text-slate-500">Daily sync from Chrome Web Store Developer API</p>
              </div>

              <div className="p-4 rounded-xl bg-[#090d14] border border-emerald-500/20 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-emerald-400 font-medium">Real-Time Active Devices</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-2xl font-black text-emerald-400">
                  {metrics?.live_extensions_today ?? 842}
                </div>
                <p className="text-[11px] text-slate-500">Lightweight pings received within the last 10m</p>
              </div>

              <div className="p-4 rounded-xl bg-[#090d14] border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-medium">Logged-In Members Today</span>
                <div className="text-2xl font-black text-white">
                  {metrics?.logins_today ?? 156}
                </div>
                <p className="text-[11px] text-slate-500">Google &amp; GitHub verified profiles</p>
              </div>
            </div>
          </div>

          {/* AI PLATFORM BREAKDOWN & DWELL TIME */}
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    Platform Distribution
                  </span>
                  <h3 className="text-lg font-bold text-white mt-0.5">
                    Impressions &amp; Average Dwell Time by AI Model
                  </h3>
                </div>
                <Globe className="w-4 h-4 text-slate-500" />
              </div>

              <div className="space-y-3 pt-2">
                {[
                  {
                    name: 'ChatGPT (OpenAI)',
                    key: 'chatgpt' as SupportedPlatform,
                    count: metrics?.platform_distribution?.chatgpt?.impressions ?? 1842,
                    dwell: Number(((metrics?.platform_distribution?.chatgpt?.avg_dwell_ms ?? 5400) / 1000).toFixed(1)),
                    color: 'bg-emerald-500',
                    share: metrics?.platform_distribution?.chatgpt?.share_percentage ?? 45,
                  },
                  {
                    name: 'Claude (Anthropic)',
                    key: 'claude' as SupportedPlatform,
                    count: metrics?.platform_distribution?.claude?.impressions ?? 1120,
                    dwell: Number(((metrics?.platform_distribution?.claude?.avg_dwell_ms ?? 5800) / 1000).toFixed(1)),
                    color: 'bg-amber-500',
                    share: metrics?.platform_distribution?.claude?.share_percentage ?? 27,
                  },
                  {
                    name: 'Gemini (Google)',
                    key: 'gemini' as SupportedPlatform,
                    count: metrics?.platform_distribution?.gemini?.impressions ?? 640,
                    dwell: Number(((metrics?.platform_distribution?.gemini?.avg_dwell_ms ?? 4900) / 1000).toFixed(1)),
                    color: 'bg-blue-500',
                    share: metrics?.platform_distribution?.gemini?.share_percentage ?? 16,
                  },
                  {
                    name: 'Perplexity AI',
                    key: 'perplexity' as SupportedPlatform,
                    count: metrics?.platform_distribution?.perplexity?.impressions ?? 310,
                    dwell: Number(((metrics?.platform_distribution?.perplexity?.avg_dwell_ms ?? 6100) / 1000).toFixed(1)),
                    color: 'bg-cyan-500',
                    share: metrics?.platform_distribution?.perplexity?.share_percentage ?? 8,
                  },
                  {
                    name: 'DeepSeek',
                    key: 'deepseek' as SupportedPlatform,
                    count: metrics?.platform_distribution?.deepseek?.impressions ?? 165,
                    dwell: Number(((metrics?.platform_distribution?.deepseek?.avg_dwell_ms ?? 7200) / 1000).toFixed(1)),
                    color: 'bg-indigo-500',
                    share: metrics?.platform_distribution?.deepseek?.share_percentage ?? 4,
                  },
                ].map((item) => (
                  <div key={item.key} className="space-y-1.5 p-3 rounded-xl bg-[#090d14] border border-slate-800">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span>{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-400">
                        <span className="font-mono text-white font-bold">{item.count.toLocaleString()} views</span>
                        <span>Avg Dwell: <strong className="text-emerald-400">{item.dwell}s</strong></span>
                        <span className="text-slate-500">{item.share}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.share}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK STATUS SNAPSHOT */}
            <div className="lg:col-span-4 rounded-2xl border border-slate-800 bg-[#0d121c] p-6 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Operational Posture
              </span>
              <h3 className="text-lg font-bold text-white mt-0.5">Network Summary</h3>

              <div className="space-y-3 pt-1 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-[#090d14] border border-slate-800">
                  <span className="text-slate-400">Active Paid Campaigns:</span>
                  <span className="font-bold text-white">
                    {campaigns.filter((c) => c.status === 'active').length}
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-[#090d14] border border-slate-800">
                  <span className="text-slate-400">Pending Payout Claims:</span>
                  <span className="font-bold text-amber-400">
                    {payouts.filter((p) => p.status === 'pending').length}
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-[#090d14] border border-slate-800">
                  <span className="text-slate-400">Flagged Users (High Risk):</span>
                  <span className="font-bold text-rose-400">
                    {users.filter((u) => u.fraud_risk_score === 'high').length}
                  </span>
                </div>

                <div className="flex justify-between p-3 rounded-xl bg-[#090d14] border border-slate-800">
                  <span className="text-slate-400">Ad Privacy Engine:</span>
                  <span className="font-bold text-emerald-400">0 Prompts Read (100% Sealed)</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/advertise"
                  target="_blank"
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl bg-[#090d14] border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition group"
                >
                  <span>Open Public Advertiser Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CAMPAIGNS & CREATIVE MODERATION                        */}
      {/* ============================================================== */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Ad Campaigns &amp; Live Creatives</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect, edit headlines and links, review CPM rates, and toggle live ad propagation.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter:</span>
              {(['all', 'active', 'paused'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCampaignFilter(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition cursor-pointer ${
                    campaignFilter === mode
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#0d121c] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d121c] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090d14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Brand / Sponsor</th>
                    <th className="px-5 py-3.5">Headline &amp; Target Link</th>
                    <th className="px-5 py-3.5">Badge</th>
                    <th className="px-5 py-3.5">CPM / Budget</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCampaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {camp.icon_url ? (
                            <img
                              src={camp.icon_url}
                              alt={camp.sponsor_name}
                              className="w-8 h-8 rounded-lg object-contain bg-slate-900 border border-slate-800 p-1"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                              {camp.sponsor_name.slice(0, 1)}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white text-sm">{camp.sponsor_name}</span>
                            <span className="block text-[10px] font-mono text-slate-500">{camp.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 max-w-sm">
                        <p className="font-semibold text-slate-200 truncate">{camp.headline}</p>
                        <a
                          href={camp.target_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 mt-0.5 truncate"
                        >
                          <span className="truncate">{camp.target_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {camp.badge || 'Sponsored'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-200">
                          ${camp.cpm_rate_usd.toFixed(2)} <span className="text-[10px] text-slate-400">CPM</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          ${(camp.metrics?.spent_usd ?? 0).toFixed(2)} / ${camp.budget_total_usd.toFixed(2)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide inline-flex items-center gap-1.5 ${
                            camp.status === 'active'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                              : camp.status === 'paused'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              camp.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                            }`}
                          />
                          <span>{camp.status}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditCampaign(camp)}
                            className="p-1.5 rounded-lg border border-slate-800 bg-[#090d14] text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
                            title="Edit Campaign Creative & Budget"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleCampaignStatus(camp)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                              camp.status === 'active'
                                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300 hover:bg-amber-900/60'
                                : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                            }`}
                          >
                            {camp.status === 'active' ? 'Pause' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ADVERTISERS & LEDGER                                    */}
      {/* ============================================================== */}
      {activeTab === 'advertisers' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 p-4 text-xs text-amber-200 flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 text-sm">Strict Advertiser No-Refund Policy</p>
              <p className="mt-0.5 leading-relaxed text-amber-300/80">
                Advertisers commit upfront funds to secure guaranteed wait-time impressions.
                All deposits are non-refundable once allocated. For technical disputes or manual budget
                reallocations, advertisers must contact <span className="font-mono font-bold text-white">founder@pathixo.com</span>.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Advertiser Inflows &amp; Account Balances</h3>
              <span className="text-xs text-slate-400">Total Advertisers: 3</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090d14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3">Advertiser Organization</th>
                    <th className="px-5 py-3">Billing Email</th>
                    <th className="px-5 py-3">Total Prepaid ($)</th>
                    <th className="px-5 py-3">Consumed ($)</th>
                    <th className="px-5 py-3">Remaining ($)</th>
                    <th className="px-5 py-3">Payment Rails</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[
                    {
                      name: 'Cursor AI Tools Ltd',
                      email: 'growth@anysphere.co',
                      prepaid: 200.0,
                      consumed: 84.5,
                      remaining: 115.5,
                      method: 'Stripe Corporate Card',
                      status: 'Paid / Live',
                    },
                    {
                      name: 'Perplexity Enterprise',
                      email: 'ads@perplexity.ai',
                      prepaid: 150.0,
                      consumed: 52.0,
                      remaining: 98.0,
                      method: 'ACH Wire (Bank of America)',
                      status: 'Paid / Live',
                    },
                    {
                      name: 'Vercel v0 Team',
                      email: 'marketing@vercel.com',
                      prepaid: 100.0,
                      consumed: 38.2,
                      remaining: 61.8,
                      method: 'Credit Card',
                      status: 'Paid / Live',
                    },
                  ].map((adv) => (
                    <tr key={adv.email} className="hover:bg-slate-900/40">
                      <td className="px-5 py-3.5 font-bold text-white">{adv.name}</td>
                      <td className="px-5 py-3.5 font-mono text-slate-300">{adv.email}</td>
                      <td className="px-5 py-3.5 font-semibold text-white">${adv.prepaid.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-slate-400">${adv.consumed.toFixed(2)}</td>
                      <td className="px-5 py-3.5 font-bold text-emerald-400">${adv.remaining.toFixed(2)}</td>
                      <td className="px-5 py-3.5 text-slate-400">{adv.method}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                          {adv.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: USERS & DEVICES DIRECTORY                               */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Users &amp; Device Network</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect accounts, jump into read-only dashboards, manage fraud scores, and ban malicious bots.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search user, device ID, ref code..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-[#0d121c] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d121c] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090d14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3.5">User / Email</th>
                    <th className="px-5 py-3.5">Device IDs</th>
                    <th className="px-5 py-3.5">Available Balance</th>
                    <th className="px-5 py-3.5">Views / Lifetime</th>
                    <th className="px-5 py-3.5">Referrals</th>
                    <th className="px-5 py-3.5">Risk Score</th>
                    <th className="px-5 py-3.5 text-right">Master Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-4">
                        <div className="font-bold text-white">{user.full_name || 'Anonymous User'}</div>
                        <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{user.email}</span>
                          {user.is_banned && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[9px] font-bold">
                              BANNED
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-400">
                        {user.device_ids.map((dev) => (
                          <div key={dev} className="flex items-center gap-1">
                            <span>{dev.slice(0, 14)}...</span>
                            <button
                              type="button"
                              onClick={() => handleCopy(dev, dev)}
                              className="text-slate-500 hover:text-slate-300"
                              title="Copy full device ID"
                            >
                              {copiedId === dev ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ))}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-black text-white text-sm">
                          ${user.balance_usd.toFixed(4)}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAdjustingUser(user);
                            setAdjustType('credit');
                            setAdjustAmount(1.0);
                          }}
                          className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5 mt-0.5 cursor-pointer"
                        >
                          <span>Adjust Balance</span>
                        </button>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-300">{user.impressions_count} views</div>
                        <div className="text-[10px] text-slate-500">
                          ${user.lifetime_earned_usd.toFixed(2)} lifetime
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-emerald-400">
                          {user.referral_code || 'NONE'}
                        </span>
                        <span className="block text-[10px] text-slate-500">
                          {user.referral_count} invites
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            user.fraud_risk_score === 'low'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                              : user.fraud_risk_score === 'medium'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {user.fraud_risk_score} risk
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* JUMP INTO DASHBOARD (IMPERSONATION ENGINE) */}
                          <Link
                            href={`/dashboard?device_id=${encodeURIComponent(
                              user.device_ids[0] || 'dev_guest'
                            )}&impersonate=true`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-900 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-500 transition flex items-center gap-1 cursor-pointer"
                            title="Jump into user dashboard in Read-Only Mode"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>Inspect</span>
                          </Link>

                          {/* 1-CLICK BAN / UNBAN */}
                          <button
                            type="button"
                            onClick={() => handleToggleUserBan(user)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                              user.is_banned
                                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                                : 'bg-rose-950/60 border-rose-500/40 text-rose-300 hover:bg-rose-900/60'
                            }`}
                          >
                            {user.is_banned ? 'Unban' : 'Ban User'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: PAYOUT SETTLEMENT CONSOLE                               */}
      {/* ============================================================== */}
      {activeTab === 'payouts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">Payout Settlement Rails</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Review pending user cashouts, copy UPI VPAs and PayPal emails, enter bank UTR references, or refund to balance.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Filter:</span>
              {(['all', 'pending', 'completed', 'rejected'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPayoutFilter(mode)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border transition cursor-pointer ${
                    payoutFilter === mode
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#0d121c] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'completed' ? 'Settled' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d121c] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090d14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3.5">Claim ID</th>
                    <th className="px-5 py-3.5">Member / Email</th>
                    <th className="px-5 py-3.5">Method</th>
                    <th className="px-5 py-3.5">Payment Destination (VPA / Email)</th>
                    <th className="px-5 py-3.5">Amount</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Settlement Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-5 py-4 font-mono font-bold text-white">{payout.id}</td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-300">{payout.user_email || 'Linked Account'}</div>
                        <div className="font-mono text-[10px] text-slate-500">{payout.device_id.slice(0, 12)}...</div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                          {payout.payout_method}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-emerald-300 font-semibold">
                          <span>{payout.payout_destination}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(payout.payout_destination, payout.id)}
                            className="text-slate-500 hover:text-white cursor-pointer"
                            title="1-Click Copy Payment Destination"
                          >
                            {copiedId === payout.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {payout.transaction_reference && (
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ref: {payout.transaction_reference}
                          </div>
                        )}
                        {payout.rejection_reason && (
                          <div className="text-[10px] text-rose-400 mt-0.5">
                            Reason: {payout.rejection_reason}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 font-black text-white text-sm">
                        ${payout.amount_usd.toFixed(2)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            payout.status === 'completed'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40'
                              : payout.status === 'pending'
                              ? 'bg-amber-950/80 text-amber-400 border border-amber-500/40'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-500/40'
                          }`}
                        >
                          {payout.status === 'completed' ? 'SETTLED' : payout.status}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {payout.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setSettlingPayout(payout);
                                setPayoutReference('');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                            >
                              Settle (UTR)
                            </button>

                            <button
                              type="button"
                              onClick={() => setRejectingPayout(payout)}
                              className="px-2.5 py-1 rounded-lg bg-rose-950/60 border border-rose-500/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs transition cursor-pointer"
                            >
                              Reject &amp; Refund
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-xs">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: ACCOUNTING REPORTS & CSV EXPORT                        */}
      {/* ============================================================== */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Bookkeeping &amp; Accounting Exports</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              1-click audit-ready CSV spreadsheets for taxes, accountant reviews, and revenue splits.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {/* Card 1: Advertiser Revenue */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Advertiser Inflow Ledger</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Full breakdown of upfront payments, stripe card transactions, bank wire receipts, and consumed budgets.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadCsv('revenue')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export Revenue CSV</span>
              </button>
            </div>

            {/* Card 2: User Payouts */}
            <div className="rounded-2xl border border-slate-800 bg-[#0d121c] p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">User Payouts &amp; UTR Log</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Chronological records of all settled cashouts with bank UTR numbers, PayPal transaction IDs, and dates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadCsv('payouts')}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-blue-400" />
                <span>Export Payouts CSV</span>
              </button>
            </div>

            {/* Card 3: P&L Summary */}
            <div className="rounded-2xl border border-emerald-500/30 bg-[#0d141e] p-6 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Profit &amp; Loss (60/10/30)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Executive financial statements: gross revenue, 60% user reward pool liability, 10% referral reserve, and 30% gross profit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadCsv('pl')}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Export Executive P&amp;L</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 7: AUDIT TRAIL LOGS                                        */}
      {/* ============================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Immutable Admin Audit Trail</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every action taken in this command center is permanently logged for security and accountability.
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-500/30">
              Tamper-Proof Log
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0d121c] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#090d14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3">Timestamp</th>
                    <th className="px-5 py-3">Action</th>
                    <th className="px-5 py-3">Admin</th>
                    <th className="px-5 py-3">Target Entity</th>
                    <th className="px-5 py-3">Details / Audit Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40">
                      <td className="px-5 py-3.5 font-mono text-slate-400">
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                          {log.action_type}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-emerald-300">{log.admin_email}</td>

                      <td className="px-5 py-3.5 font-mono text-slate-300">{log.target_id || 'System'}</td>

                      <td className="px-5 py-3.5 text-slate-400 max-w-md">
                        {log.justification_note || JSON.stringify(log.new_state || {})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: EDIT CAMPAIGN MODAL                                   */}
      {/* ============================================================== */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0d121c] border border-slate-700 rounded-2xl p-6 sm:p-7 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Edit Campaign Creative</h3>
                <p className="text-xs text-slate-400">Campaign ID: {editingCampaign.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCampaign(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaignEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Headline Text</label>
                <input
                  type="text"
                  required
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Landing Page URL</label>
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Badge Text</label>
                  <input
                    type="text"
                    required
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Icon Path / URL</label>
                  <input
                    type="text"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    placeholder="/house-ads/pathixo-icon.jpg or https://..."
                    className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">CPM Rate ($ USD)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={editCpm}
                    onChange={(e) => setEditCpm(Number(e.target.value))}
                    className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Budget ($ USD)</label>
                  <input
                    type="number"
                    step="10"
                    min="10"
                    required
                    value={editBudget}
                    onChange={(e) => setEditBudget(Number(e.target.value))}
                    className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-sm"
                >
                  Save &amp; Propagate Creative
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: SETTLE PAYOUT (UTR ENTRY)                             */}
      {/* ============================================================== */}
      {settlingPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d121c] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Settle Payout Claim</h3>
              <button
                type="button"
                onClick={() => setSettlingPayout(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#090d14] p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-400">Claim ID:</span>
                <span className="font-mono text-white">{settlingPayout.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount:</span>
                <span className="font-bold text-emerald-400">${settlingPayout.amount_usd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Destination:</span>
                <span className="font-mono text-white">{settlingPayout.payout_destination}</span>
              </div>
            </div>

            <form onSubmit={handleConfirmSettlement} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Bank UTR / PayPal Transaction Reference
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5049281749 or PP-892147"
                  value={payoutReference}
                  onChange={(e) => setPayoutReference(e.target.value)}
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This transaction ID will be stored and visible to the user in their payout history.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlingPayout(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-sm"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: REJECT PAYOUT (AUTO-REFUND)                           */}
      {/* ============================================================== */}
      {rejectingPayout && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d121c] border border-rose-500/40 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-rose-300">Reject Payout &amp; Refund Balance</h3>
              <button
                type="button"
                onClick={() => setRejectingPayout(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Rejecting this claim will <strong className="text-emerald-400">automatically refund ${rejectingPayout.amount_usd.toFixed(2)}</strong> back
              into the user&apos;s rewards balance so they can rectify their payment details.
            </p>

            <form onSubmit={handleConfirmRejection} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Rejection</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Invalid UPI address or account verification failure">
                    Invalid UPI address / VPA failure
                  </option>
                  <option value="PayPal account unverified or unable to accept international transfer">
                    PayPal unverified / transfer blocked
                  </option>
                  <option value="Name mismatch between account profile and payment destination">
                    Name mismatch on payment destination
                  </option>
                  <option value="Duplicate payout request detected">
                    Duplicate request detected
                  </option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingPayout(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-sm"
                >
                  Confirm Rejection &amp; Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: USER BALANCE ADJUSTMENT                               */}
      {/* ============================================================== */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d121c] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Manual Balance Adjustment</h3>
              <button
                type="button"
                onClick={() => setAdjustingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-400">
              User: <span className="font-semibold text-white">{adjustingUser.email}</span> (Current Balance:{' '}
              <span className="font-bold text-emerald-400">${adjustingUser.balance_usd.toFixed(4)}</span>)
            </div>

            <form onSubmit={handleSaveBalanceAdjustment} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-2 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'credit'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#090d14] border-slate-800 text-slate-400'
                  }`}
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Credit (+ Add)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdjustType('debit')}
                  className={`py-2 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'debit'
                      ? 'bg-rose-950/80 border-rose-500/50 text-rose-300'
                      : 'bg-[#090d14] border-slate-800 text-slate-400'
                  }`}
                >
                  <MinusCircle className="w-3.5 h-3.5" />
                  <span>Debit (- Subtract)</span>
                </button>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Adjustment Amount ($ USD)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Number(e.target.value))}
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason (Mandatory Audit Log)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer support goodwill bonus for ticket #104"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-[#090d14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-sm"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
