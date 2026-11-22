'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Radio,
  Sliders,
  CheckCircle,
  XCircle,
  HelpCircle,
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

type AdminTab = 'overview' | 'campaigns' | 'advertisers' | 'users' | 'payouts' | 'audit';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminEmail, setAdminEmail] = useState('jhaabhijeet864@gmail.com');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [timeAgoText, setTimeAgoText] = useState('Just now');

  // Core Data State
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [campaigns, setCampaigns] = useState<AdCampaign[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [payouts, setPayouts] = useState<AdminPayoutRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogEntry[]>([]);

  // Search & Filter State
  const [userSearch, setUserSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [payoutTabFilter, setPayoutTabFilter] = useState<'pending' | 'completed' | 'rejected' | 'all'>('pending');
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

  const [isCwsModalOpen, setIsCwsModalOpen] = useState(false);
  const [cwsInputCount, setCwsInputCount] = useState<number>(0);

  // Toast Notice
  const [statusNotice, setStatusNotice] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setStatusNotice({ message, type });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // 1. Initial Load of All Datasets (Silent background refresh supported)
  const loadAllData = useCallback(
    async (showFullLoader = false) => {
      if (showFullLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        // 1. Overview Metrics
        const mRes = await fetch('/api/admin/overview', {
          headers: { 'x-admin-email': adminEmail },
        });
        if (mRes.ok) {
          const mData = await mRes.json();
          if (mData.metrics) {
            setMetrics(mData.metrics);
            setCwsInputCount(mData.metrics.cws_installs || 0);
          }
        } else {
          const currentMetrics = adminStore.getMetrics();
          setMetrics(currentMetrics);
          setCwsInputCount(currentMetrics.cws_installs || 0);
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

        setLastSyncedAt(new Date());
      } catch {
        const fallbackMetrics = adminStore.getMetrics();
        setMetrics(fallbackMetrics);
        setCwsInputCount(fallbackMetrics.cws_installs || 0);
        setCampaigns(campaignStore.getAllCampaigns());
        setUsers(adminStore.getAllUsers());
        setPayouts(adminStore.getAllPayouts());
        setAuditLogs(adminStore.getAuditLogs());
        setLastSyncedAt(new Date());
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [adminEmail]
  );

  // Auto-refresh interval (every 10s) + window focus listener for real-time live sync
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

    loadAllData(true);

    // Live polling interval (10 seconds)
    const interval = setInterval(() => {
      loadAllData(false);
    }, 10000);

    // Refresh immediately when window regains focus
    const onFocus = () => loadAllData(false);
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [loadAllData]);

  // Relative time updater for "Last synced X seconds ago"
  useEffect(() => {
    const timer = setInterval(() => {
      const diffMs = Date.now() - lastSyncedAt.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 5) {
        setTimeAgoText('Just now');
      } else if (diffSec < 60) {
        setTimeAgoText(`${diffSec}s ago`);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        setTimeAgoText(`${diffMin}m ago`);
      }
    }, 2000);

    return () => clearInterval(timer);
  }, [lastSyncedAt]);

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Update CWS Installs Counter via Live API
  const handleSaveCwsInstalls = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const count = Number(cwsInputCount);
      const res = await fetch('/api/admin/overview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': adminEmail,
        },
        body: JSON.stringify({ cws_installs: count }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.metrics) setMetrics(data.metrics);
        showToast(`Official Chrome Web Store downloads synced: ${count.toLocaleString()}`);
      } else {
        adminStore.setCwsInstalls(count);
        setMetrics(adminStore.getMetrics());
        showToast(`Official CWS installs updated to ${count.toLocaleString()}!`);
      }
    } catch {
      adminStore.setCwsInstalls(Number(cwsInputCount));
      setMetrics(adminStore.getMetrics());
      showToast('CWS Installs updated locally!');
    } finally {
      setIsCwsModalOpen(false);
    }
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
        showToast(`Campaign "${camp.sponsor_name}" ${nextStatus === 'active' ? 'activated' : 'paused'}!`);
      } else {
        adminStore.moderateCampaign(camp.id, { status: nextStatus }, adminEmail);
        setCampaigns(campaignStore.getAllCampaigns());
        showToast(`Campaign "${camp.sponsor_name}" updated!`);
      }
    } catch {
      adminStore.moderateCampaign(camp.id, { status: nextStatus }, adminEmail);
      setCampaigns(campaignStore.getAllCampaigns());
      showToast(`Campaign "${camp.sponsor_name}" updated!`);
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
        showToast(`Campaign creative updated successfully!`);
      } else {
        adminStore.moderateCampaign(editingCampaign.id, updates, adminEmail);
        setCampaigns(campaignStore.getAllCampaigns());
        showToast(`Campaign creative updated!`);
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
        showToast(`User ${user.email} ${action === 'ban' ? 'BANNED' : 'RESTORED'}!`);
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
        showToast(`Balance updated: ${adjustType === 'credit' ? '+' : '-'}$${adjustAmount}`);
      } else {
        const delta = adjustType === 'credit' ? Number(adjustAmount) : -Number(adjustAmount);
        adminStore.adjustUserBalance(adjustingUser.id, delta, adjustReason, adminEmail);
        setUsers(adminStore.getAllUsers());
        showToast(`Balance adjusted!`);
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
        showToast(`Payout ${settlingPayout.id} marked as SETTLED!`);
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
        showToast(`Payout rejected and refunded!`);
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
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (!userSearch) return true;
      const q = userSearch.toLowerCase();
      return (
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q) ||
        u.device_ids.some((d) => d.toLowerCase().includes(q)) ||
        u.referral_code?.toLowerCase().includes(q)
      );
    });
  }, [users, userSearch]);

  const filteredCampaigns = useMemo(() => {
    return campaigns.filter((c) => {
      if (campaignFilter === 'all') return true;
      return c.status === campaignFilter;
    });
  }, [campaigns, campaignFilter]);

  const paidAdvertisers = useMemo(() => {
    return campaigns.filter(
      (c) => !c.id.startsWith('cmp_house_') && c.advertiser_email !== 'founder@pathixo.com'
    );
  }, [campaigns]);

  const pendingPayoutsCount = useMemo(() => {
    return payouts.filter((p) => p.status === 'pending').length;
  }, [payouts]);

  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      if (payoutTabFilter === 'all') return true;
      return p.status === payoutTabFilter;
    });
  }, [payouts, payoutTabFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* STATUS TOAST NOTIFICATION */}
      {statusNotice && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border shadow-2xl flex items-center gap-3 text-xs font-semibold transition-all duration-300 animate-in slide-in-from-bottom-3 ${
            statusNotice.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
          }`}
        >
          {statusNotice.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{statusNotice.message}</span>
        </div>
      )}

      {/* 1. STREAMLINED EXECUTIVE HEADER & LIVE PULSE BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Admin Command Console
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Enclave</span>
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Real-time telemetry, campaign moderation, fraud controls, and instant settlement rails.
          </p>
        </div>

        {/* Live sync controls */}
        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0d121c] text-xs text-slate-300">
            <span
              className={`w-2 h-2 rounded-full ${
                isRefreshing ? 'bg-amber-400 animate-spin' : 'bg-emerald-400'
              }`}
            />
            <span className="text-[11px] text-slate-400">
              Synced <strong className="text-white font-mono">{timeAgoText}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => loadAllData(false)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-[#0d121c] text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
            title="Manual data refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          <button
            type="button"
            onClick={() => downloadCsv('pl')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export P&amp;L</span>
          </button>
        </div>
      </div>

      {/* 2. STREAMLINED TAB NAVIGATION BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-800/80 pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>Overview &amp; Telemetry</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('campaigns')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'campaigns'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Campaigns ({campaigns.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('advertisers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'advertisers'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Advertisers ({paidAdvertisers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'users'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>User Directory ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'payouts'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Payout Rails</span>
          {pendingPayoutsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
              {pendingPayoutsCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Audit &amp; Bookkeeping</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: OVERVIEW & TELEMETRY                                    */}
      {/* ============================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 CORE FINANCIAL CARDS (60/10/30 SPLIT) */}
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Advertiser Inflow */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Prepaid Ad Inflow</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                ${(metrics?.total_inflow_usd ?? 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>100% upfront prepaid</span>
                <span className="text-emerald-400 font-semibold">100%</span>
              </div>
            </div>

            {/* User Rewards Pool (60%) */}
            <div className="rounded-xl border border-emerald-500/30 bg-[#0d141e] p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                <span>User Payout Pool (60%)</span>
                <span className="text-[10px] bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                  60% Target
                </span>
              </div>
              <div className="text-3xl font-black text-emerald-300 font-mono">
                ${(metrics?.user_liability_usd ?? 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-emerald-500/80 flex items-center justify-between">
                <span>Wait-time reward reserve</span>
                <span>Active Liability</span>
              </div>
            </div>

            {/* Platform Gross Margin (30%) */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Platform Profit (30%)</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                ${(metrics?.platform_profit_usd ?? 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Net platform retention</span>
                <span className="text-white font-semibold">30% Share</span>
              </div>
            </div>

            {/* Referral Reserve Pool (10%) */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] p-5 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <span>Referral Reserve (10%)</span>
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-black text-white font-mono">
                ${(metrics?.referral_pool_usd ?? 0).toFixed(2)}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>10% downstream royalties</span>
                <span className="text-blue-400 font-semibold">10% Pool</span>
              </div>
            </div>
          </div>

          {/* DUAL-METRIC TELEMETRY & REACH CARDS */}
          <div className="grid gap-3.5 sm:grid-cols-3">
            {/* Chrome Web Store Installs with 1-Click Update */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Official CWS Installs</span>
                  <button
                    type="button"
                    onClick={() => setIsCwsModalOpen(true)}
                    className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Sync</span>
                  </button>
                </div>
                <div className="text-3xl font-black text-white font-mono mt-2">
                  {(metrics?.cws_installs ?? 0).toLocaleString()}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Chrome Web Store Developer API official download metric. Click sync to update.
              </p>
            </div>

            {/* Real-Time Active Devices */}
            <div className="rounded-xl border border-emerald-500/20 bg-[#0d141e] p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                  <span>Active Extensions Live Now</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-3xl font-black text-emerald-400 font-mono mt-2">
                  {(metrics?.live_extensions_today ?? 0).toLocaleString()}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Direct Pathixo heartbeat pings recorded across browser extensions.
              </p>
            </div>

            {/* Verified Member Accounts */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
                  <span>Registered Member Accounts</span>
                  <Users className="w-4 h-4 text-slate-500" />
                </div>
                <div className="text-3xl font-black text-white font-mono mt-2">
                  {(metrics?.registered_users_count ?? 0).toLocaleString()}
                </div>
              </div>
              <p className="text-[11px] text-slate-500 leading-normal">
                Google and GitHub authenticated users with active rewards balances.
              </p>
            </div>
          </div>

          {/* AI PLATFORM BREAKDOWN & DWELL TIME */}
          <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">AI Platform Impression Distribution</h3>
                <p className="text-[11px] text-slate-400">
                  Real-time wait-time dwell metrics across supported AI assistant models.
                </p>
              </div>
              <Globe className="w-4 h-4 text-slate-500" />
            </div>

            <div className="grid gap-3 sm:grid-cols-5 pt-1">
              {[
                {
                  name: 'ChatGPT',
                  key: 'chatgpt' as SupportedPlatform,
                  count: metrics?.platform_distribution?.chatgpt?.impressions ?? 0,
                  dwell: Number(((metrics?.platform_distribution?.chatgpt?.avg_dwell_ms ?? 0) / 1000).toFixed(1)),
                  color: 'bg-emerald-500',
                  share: metrics?.platform_distribution?.chatgpt?.share_percentage ?? 0,
                },
                {
                  name: 'Claude',
                  key: 'claude' as SupportedPlatform,
                  count: metrics?.platform_distribution?.claude?.impressions ?? 0,
                  dwell: Number(((metrics?.platform_distribution?.claude?.avg_dwell_ms ?? 0) / 1000).toFixed(1)),
                  color: 'bg-amber-500',
                  share: metrics?.platform_distribution?.claude?.share_percentage ?? 0,
                },
                {
                  name: 'Gemini',
                  key: 'gemini' as SupportedPlatform,
                  count: metrics?.platform_distribution?.gemini?.impressions ?? 0,
                  dwell: Number(((metrics?.platform_distribution?.gemini?.avg_dwell_ms ?? 0) / 1000).toFixed(1)),
                  color: 'bg-blue-500',
                  share: metrics?.platform_distribution?.gemini?.share_percentage ?? 0,
                },
                {
                  name: 'Perplexity',
                  key: 'perplexity' as SupportedPlatform,
                  count: metrics?.platform_distribution?.perplexity?.impressions ?? 0,
                  dwell: Number(((metrics?.platform_distribution?.perplexity?.avg_dwell_ms ?? 0) / 1000).toFixed(1)),
                  color: 'bg-cyan-500',
                  share: metrics?.platform_distribution?.perplexity?.share_percentage ?? 0,
                },
                {
                  name: 'DeepSeek',
                  key: 'deepseek' as SupportedPlatform,
                  count: metrics?.platform_distribution?.deepseek?.impressions ?? 0,
                  dwell: Number(((metrics?.platform_distribution?.deepseek?.avg_dwell_ms ?? 0) / 1000).toFixed(1)),
                  color: 'bg-indigo-500',
                  share: metrics?.platform_distribution?.deepseek?.share_percentage ?? 0,
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3.5 rounded-lg bg-[#080c14] border border-slate-800/80 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">{item.share}%</span>
                  </div>

                  <div>
                    <div className="text-lg font-bold text-white font-mono">
                      {item.count.toLocaleString()} <span className="text-[10px] text-slate-500 font-sans">views</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Avg Dwell: <strong className="text-emerald-400 font-mono">{item.dwell}s</strong>
                    </div>
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${Math.max(item.share, 4)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CAMPAIGNS & CREATIVE MODERATION                        */}
      {/* ============================================================== */}
      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Live Ad Campaigns &amp; Creatives</h2>
              <p className="text-xs text-slate-400">
                Inspect headlines, review target URLs, change CPM rates, and toggle live ad propagation.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d121c] p-1 rounded-lg border border-slate-800">
              {(['all', 'active', 'paused'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setCampaignFilter(mode)}
                  className={`px-3 py-1 rounded text-xs font-semibold capitalize transition cursor-pointer ${
                    campaignFilter === mode
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] overflow-hidden shadow-sm">
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12 px-4 bg-[#080c14]">
                <Layers className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">No Campaigns Found</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  No ad campaigns match the &quot;{campaignFilter}&quot; filter.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080c14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-5 py-3">Brand / Sponsor</th>
                      <th className="px-5 py-3">Headline &amp; Target Link</th>
                      <th className="px-5 py-3">Badge</th>
                      <th className="px-5 py-3">CPM / Budget</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredCampaigns.map((camp) => (
                      <tr key={camp.id} className="hover:bg-slate-900/30 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            {camp.icon_url ? (
                              <img
                                src={camp.icon_url}
                                alt={camp.sponsor_name}
                                className="w-7 h-7 rounded-lg object-contain bg-slate-900 border border-slate-800 p-0.5"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-xs">
                                {camp.sponsor_name.slice(0, 1)}
                              </div>
                            )}
                            <div>
                              <span className="font-bold text-white text-xs block">{camp.sponsor_name}</span>
                              <span className="text-[10px] font-mono text-slate-500">{camp.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 max-w-xs">
                          <p className="font-medium text-slate-200 truncate">{camp.headline}</p>
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

                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-800/80 text-slate-300 border border-slate-700/60">
                            {camp.badge || 'Sponsored'}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-200 font-mono">
                            ${camp.cpm_rate_usd.toFixed(2)} <span className="text-[10px] text-slate-500 font-sans">CPM</span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            ${(camp.metrics?.spent_usd ?? 0).toFixed(2)} / ${camp.budget_total_usd.toFixed(2)}
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide inline-flex items-center gap-1 ${
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

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditCampaign(camp)}
                              className="p-1.5 rounded-lg border border-slate-800 bg-[#080c14] text-slate-300 hover:text-white hover:border-slate-700 transition cursor-pointer"
                              title="Edit Creative & CPM"
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
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ADVERTISERS & INFLOW LEDGER                             */}
      {/* ============================================================== */}
      {activeTab === 'advertisers' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300 text-xs">Strict Advertiser Prepaid No-Refund Policy</p>
              <p className="mt-0.5 leading-relaxed text-amber-300/80 text-[11px]">
                Advertisers commit upfront funds to sponsor wait-time slots across AI models. All deposits are
                non-refundable once allocated. For manual budget reallocations or inquiries, advertisers contact{' '}
                <span className="font-mono font-bold text-white">founder@pathixo.com</span>.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Advertiser Inflow Ledger</h3>
                <p className="text-[11px] text-slate-400">Prepaid sponsor budgets and consumed view spend.</p>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Active External Advertisers: {paidAdvertisers.length}
              </span>
            </div>

            {paidAdvertisers.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-slate-800 bg-[#080c14]">
                <DollarSign className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">No External Advertisers Yet</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  The network is currently serving Pathixo startup house ads (Vakxo, Pathixo, KrocPDF, Blip).
                  Once external advertisers launch campaigns via the public portal, their prepaid budgets and payment
                  records will appear here in real time.
                </p>
                <div className="mt-4">
                  <Link
                    href="/advertise"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    <span>Open Public Advertiser Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080c14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
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
                  <tbody className="divide-y divide-slate-800/60">
                    {paidAdvertisers.map((adv) => {
                      const consumed = adv.metrics?.spent_usd ?? 0;
                      const remaining =
                        adv.budget_remaining_usd ?? Math.max(0, adv.budget_total_usd - consumed);
                      return (
                        <tr key={adv.id} className="hover:bg-slate-900/30">
                          <td className="px-5 py-3.5 font-bold text-white">{adv.sponsor_name}</td>
                          <td className="px-5 py-3.5 font-mono text-slate-300">{adv.advertiser_email}</td>
                          <td className="px-5 py-3.5 font-semibold text-white font-mono">
                            ${adv.budget_total_usd.toFixed(2)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-400 font-mono">${consumed.toFixed(2)}</td>
                          <td className="px-5 py-3.5 font-bold text-emerald-400 font-mono">
                            ${remaining.toFixed(2)}
                          </td>
                          <td className="px-5 py-3.5 text-slate-400">
                            {adv.currency === 'INR' ? 'Razorpay (UPI)' : 'Stripe (Card)'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950/80 text-emerald-400 border border-emerald-500/40">
                              {adv.status === 'active' ? 'Paid / Live' : adv.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: USER & DEVICE DIRECTORY                                 */}
      {/* ============================================================== */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Registered Users &amp; Connected Devices</h2>
              <p className="text-xs text-slate-400">
                Inspect accounts, jump into read-only dashboards, manage risk scores, or ban malicious clickers.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search email, device, ref code..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-[#0d121c] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] overflow-hidden shadow-sm">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 px-4 bg-[#080c14]">
                <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">
                  {userSearch ? 'No Users Match Search' : 'No Registered Users Yet'}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  {userSearch
                    ? 'Try clearing the search query to see all accounts.'
                    : 'As users sign in with Google or GitHub across the extension and dashboard, their profiles, device telemetry, dwell times, and balances will populate here.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080c14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-5 py-3">User / Email</th>
                      <th className="px-5 py-3">Device IDs</th>
                      <th className="px-5 py-3">Available Balance</th>
                      <th className="px-5 py-3">Views / Earned</th>
                      <th className="px-5 py-3">Referral Code</th>
                      <th className="px-5 py-3">Risk Level</th>
                      <th className="px-5 py-3 text-right">Master Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-900/30 transition">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-white text-xs">{user.full_name || 'Extension Member'}</div>
                          <div className="font-mono text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <span>{user.email}</span>
                            {user.is_banned && (
                              <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-800 text-[9px] font-bold">
                                BANNED
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-3.5 font-mono text-[11px] text-slate-400">
                          {user.device_ids.map((dev) => (
                            <div key={dev} className="flex items-center gap-1">
                              <span>{dev.slice(0, 14)}...</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(dev, dev)}
                                className="text-slate-500 hover:text-slate-300 cursor-pointer"
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

                        <td className="px-5 py-3.5">
                          <div className="font-black text-white text-xs font-mono">
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
                            <span>Adjust</span>
                          </button>
                        </td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-300">{user.impressions_count} views</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            ${user.lifetime_earned_usd.toFixed(2)} earned
                          </div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="font-mono font-bold text-emerald-400">
                            {user.referral_code || 'NONE'}
                          </span>
                          <span className="block text-[10px] text-slate-500">
                            {user.referral_count} invites
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
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

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
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
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: PAYOUT SETTLEMENT RAILS                                 */}
      {/* ============================================================== */}
      {activeTab === 'payouts' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white">Payout Settlement Rails</h2>
              <p className="text-xs text-slate-400">
                1-click copy UPI VPAs and PayPal emails, record bank UTR references, or reject &amp; auto-refund balances.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#0d121c] p-1 rounded-lg border border-slate-800">
              {(['pending', 'completed', 'rejected', 'all'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setPayoutTabFilter(mode)}
                  className={`px-3 py-1 rounded text-xs font-semibold capitalize transition cursor-pointer ${
                    payoutTabFilter === mode
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'completed' ? 'Settled' : mode}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] overflow-hidden shadow-sm">
            {filteredPayouts.length === 0 ? (
              <div className="text-center py-12 px-4 bg-[#080c14]">
                <Clock className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-white">
                  {payoutTabFilter === 'all'
                    ? 'No Payout Claims Yet'
                    : `No ${payoutTabFilter === 'completed' ? 'Settled' : payoutTabFilter} Claims`}
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                  When users reach the $2.00 threshold and submit UPI or PayPal cashout requests, claims will appear
                  here for instant settlement or refund.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#080c14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-5 py-3">Claim ID</th>
                      <th className="px-5 py-3">Member / Email</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">Payment Destination (VPA / Email)</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Settlement Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredPayouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-slate-900/30 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-white text-xs">{payout.id}</td>

                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-slate-300">{payout.user_email || 'Linked Account'}</div>
                          <div className="font-mono text-[10px] text-slate-500">{payout.device_id.slice(0, 12)}...</div>
                        </td>

                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                            {payout.payout_method}
                          </span>
                        </td>

                        <td className="px-5 py-3.5">
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

                        <td className="px-5 py-3.5 font-black text-white text-xs font-mono">
                          ${payout.amount_usd.toFixed(2)}
                        </td>

                        <td className="px-5 py-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
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

                        <td className="px-5 py-3.5 text-right">
                          {payout.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
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
                            <span className="text-slate-500 text-xs">Settled</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: AUDIT TRAIL & BOOKKEEPING                               */}
      {/* ============================================================== */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          {/* CSV BOOKKEEPING EXPORT CARDS */}
          <div>
            <h2 className="text-base font-bold text-white">Bookkeeping &amp; Tax Exports</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              1-click audit-ready CSV spreadsheets for financial accounting and bank reconciliations.
            </p>
          </div>

          <div className="grid gap-3.5 sm:grid-cols-3">
            {/* Card 1: Advertiser Inflows */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs">Advertiser Inflow Ledger</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Upfront prepaid ad deposits, consumed view spend, and advertiser payment details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadCsv('revenue')}
                className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Export Revenue CSV</span>
              </button>
            </div>

            {/* Card 2: User Payouts */}
            <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-2">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs">User Payouts &amp; Bank UTRs</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Settled claims with bank UTR numbers, PayPal transaction references, and dates.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadCsv('payouts')}
                className="w-full py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Export Payouts CSV</span>
              </button>
            </div>

            {/* Card 3: P&L Summary */}
            <div className="rounded-xl border border-emerald-500/30 bg-[#0d141e] p-5 flex flex-col justify-between space-y-3">
              <div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 mb-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-white text-xs">Executive P&amp;L (60/10/30)</h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Gross inflow, 60% user reward pool liability, 10% referral reserve, and 30% gross profit.
                </p>
              </div>
              <button
                type="button"
                onClick={() => downloadCsv('pl')}
                className="w-full py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-slate-950" />
                <span>Export Executive P&amp;L</span>
              </button>
            </div>
          </div>

          {/* IMMUTABLE AUDIT TRAIL LOGS */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Immutable Administrative Audit Log</h3>
                <p className="text-[11px] text-slate-400">
                  Every action, moderation change, and balance adjustment is permanently recorded.
                </p>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                Tamper-Proof
              </span>
            </div>

            <div className="rounded-xl border border-slate-800/80 bg-[#0d121c] overflow-hidden shadow-sm">
              {auditLogs.length === 0 ? (
                <div className="text-center py-10 px-4 bg-[#080c14]">
                  <Shield className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <h4 className="text-xs font-bold text-white">No Audit Logs Recorded Yet</h4>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto mt-0.5">
                    Administrative actions and circuit breaker events will appear here automatically.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#080c14] border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="px-5 py-3">Timestamp</th>
                        <th className="px-5 py-3">Action</th>
                        <th className="px-5 py-3">Admin</th>
                        <th className="px-5 py-3">Target Entity</th>
                        <th className="px-5 py-3">Details / Audit Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-900/30">
                          <td className="px-5 py-3 font-mono text-slate-400 text-[11px]">
                            {new Date(log.created_at).toLocaleString()}
                          </td>

                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                              {log.action_type}
                            </span>
                          </td>

                          <td className="px-5 py-3 font-mono text-emerald-300 text-[11px]">{log.admin_email}</td>

                          <td className="px-5 py-3 font-mono text-slate-300 text-[11px]">{log.target_id || 'System'}</td>

                          <td className="px-5 py-3 text-slate-400 max-w-md text-[11px]">
                            {log.justification_note || JSON.stringify(log.new_state || {})}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: EDIT CAMPAIGN MODAL                                   */}
      {/* ============================================================== */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0d121c] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Campaign Creative</h3>
                <p className="text-[11px] text-slate-400 font-mono">ID: {editingCampaign.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingCampaign(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCampaignEdit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Headline Text</label>
                <input
                  type="text"
                  required
                  value={editHeadline}
                  onChange={(e) => setEditHeadline(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Landing Page URL</label>
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={(e) => setEditUrl(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
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
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Icon Path / URL</label>
                  <input
                    type="text"
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    placeholder="/house-ads/... or https://..."
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
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
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
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
                    className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCampaign(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-sm"
                >
                  Save &amp; Propagate
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
              <h3 className="text-sm font-bold text-white">Settle Cashout Claim</h3>
              <button
                type="button"
                onClick={() => setSettlingPayout(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#080c14] p-3 rounded-xl border border-slate-800 text-xs space-y-1">
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

            <form onSubmit={handleConfirmSettlement} className="space-y-3.5 text-xs">
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
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  This transaction ID will be stored and visible to the user in their payout history.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettlingPayout(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-sm"
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
          <div className="w-full max-w-md bg-[#0d121c] border border-rose-500/40 rounded-2xl p-6 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-rose-300">Reject Payout &amp; Refund Balance</h3>
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

            <form onSubmit={handleConfirmRejection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Rejection</label>
                <select
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
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
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition shadow-sm"
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
          <div className="w-full max-w-md bg-[#0d121c] border border-slate-700 rounded-2xl p-6 space-y-3.5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Manual Balance Adjustment</h3>
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
              <span className="font-bold text-emerald-400 font-mono">${adjustingUser.balance_usd.toFixed(4)}</span>)
            </div>

            <form onSubmit={handleSaveBalanceAdjustment} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('credit')}
                  className={`py-2 rounded-xl font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    adjustType === 'credit'
                      ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                      : 'bg-[#080c14] border-slate-800 text-slate-400'
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
                      : 'bg-[#080c14] border-slate-800 text-slate-400'
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
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
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
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-sm"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 5: CHROME WEB STORE INSTALL SYNC MODAL                   */}
      {/* ============================================================== */}
      {isCwsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d121c] border border-slate-700 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Sync Chrome Web Store Installs</h3>
              <button
                type="button"
                onClick={() => setIsCwsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Google&apos;s Chrome Web Store Developer API aggregates install statistics once every 24 hours. Enter
              the latest official count to sync the dual-metric telemetry engine.
            </p>

            <form onSubmit={handleSaveCwsInstalls} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Download Count</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={cwsInputCount}
                  onChange={(e) => setCwsInputCount(Number(e.target.value))}
                  className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3.5 py-2 text-white focus:border-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCwsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition shadow-sm"
                >
                  Save &amp; Sync Metric
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
