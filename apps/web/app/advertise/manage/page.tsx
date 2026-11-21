'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import type { AdCampaign } from '@pathixo/shared';

// Default feather/leaf brand icon matching user's screenshot
function BrandFeatherIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </svg>
  );
}

function CampaignManagerContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams?.get('id') || null;

  const [campaign, setCampaign] = useState<AdCampaign | null>(null);
  const [loading, setLoading] = useState<boolean>(Boolean(campaignId));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form states (empty defaults, populated dynamically from loaded campaign)
  const [sponsorName, setSponsorName] = useState('');
  const [adCopy, setAdCopy] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [iconUrl, setIconUrl] = useState<string>('');
  const [iconFileName, setIconFileName] = useState<string>('No file chosen');
  const [removeIcon, setRemoveIcon] = useState<boolean>(false);

  // Fetch campaign details on mount if an ID is present
  useEffect(() => {
    if (!campaignId) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchCampaign = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/campaigns?id=${encodeURIComponent(campaignId)}`);
        const data = await res.json();
        if (res.ok && data.campaign && isMounted) {
          const c = data.campaign;
          setCampaign(c);
          setSponsorName(c.sponsor_name || '');
          setAdCopy(c.headline || '');
          setTargetUrl(c.target_url || '');
          setIconUrl(c.icon_url || '');
        } else if (isMounted) {
          setErrorMsg(data.message || 'Campaign not found');
        }
      } catch {
        if (isMounted) setErrorMsg('Failed to load campaign');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCampaign();
    return () => {
      isMounted = false;
    };
  }, [campaignId]);

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFileName(file.name);
      setRemoveIcon(false);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setIconUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes via PATCH /api/campaigns
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMsg(null);

    const finalIcon = removeIcon ? '' : iconUrl;

    try {
      const res = await fetch('/api/campaigns', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: campaign.id,
          sponsor_name: sponsorName,
          headline: adCopy,
          target_url: targetUrl,
          icon_url: finalIcon,
        }),
      });

      const data = await res.json();
      if (res.ok && data.campaign) {
        setCampaign(data.campaign);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      } else {
        setErrorMsg(data.message || 'Failed to save changes');
      }
    } catch {
      setErrorMsg('Network error while saving changes');
    } finally {
      setIsSaving(false);
    }
  };

  if (!campaignId) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Manage your campaign
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            This page unlocks when an advertiser launches a campaign. No active campaign ID was provided.
          </p>
          <div className="pt-2">
            <Link
              href="/advertise"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#059669] hover:bg-[#047857] px-6 py-3 text-sm font-bold text-white shadow-sm transition active:scale-[0.99]"
            >
              <span>Create an Ad Campaign</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Sparkles className="h-6 w-6 text-emerald-600 animate-spin mx-auto" />
        <div className="text-sm text-slate-500 font-medium">Loading campaign details...</div>
      </div>
    );
  }

  if (errorMsg && !campaign) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-20 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm space-y-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Campaign Not Found
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
            {errorMsg}. Please verify the campaign link or create a new campaign on the Advertise page.
          </p>
          <div className="pt-3">
            <Link
              href="/advertise"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition"
            >
              <span>Go to Campaign Builder</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const cpm = campaign?.cpm_rate_usd ?? 2.0;
  const budgetRemaining = campaign?.budget_remaining_usd ?? 0.0;
  const impressionsRemaining = Math.max(0, Math.round((budgetRemaining / Math.max(0.001, cpm)) * 1000));
  const impressionsServed = campaign?.metrics?.total_impressions || 0;
  const clicks = campaign?.metrics?.total_clicks || 0;
  const ctrText = impressionsServed > 0 ? `${((clicks / impressionsServed) * 100).toFixed(2)}%` : '0.00%';

  const isPending = campaign?.status === 'pending_review' || !campaign?.status;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
      {/* Page Title */}
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-8">
        Manage your campaign
      </h1>

      {saveSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800 shadow-xs">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>Your ad changes have been saved and applied to live preview!</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMsg}
        </div>
      )}

      {/* CARD 1: Your Campaign & Metrics Grid */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-bold text-slate-900">Your campaign</h2>
          <span
            className={`rounded-full px-3 py-0.5 text-xs font-semibold ${
              isPending
                ? 'border border-amber-300 bg-amber-50 text-amber-700'
                : campaign?.status === 'active'
                ? 'border border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border border-slate-300 bg-slate-100 text-slate-700'
            }`}
          >
            {isPending ? 'Pending review' : campaign?.status === 'active' ? 'Active' : 'Paused'}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          We review every campaign before it goes live, usually within 24 hours. You can edit your ad below until the review starts.
        </p>

        {/* 2 Rows x 3 Columns Metrics Grid */}
        <div className="mt-6 grid grid-cols-3 gap-y-6 gap-x-4 border-t border-slate-100 pt-6">
          <div>
            <span className="text-sm font-normal text-slate-500">Bid per 1,000</span>
            <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900">
              ${cpm.toFixed(2)}
            </div>
          </div>

          <div>
            <span className="text-sm font-normal text-slate-500">Budget remaining</span>
            <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900">
              ${budgetRemaining.toFixed(2)}
            </div>
          </div>

          <div>
            <span className="text-sm font-normal text-slate-500">Impressions remaining</span>
            <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900">
              {impressionsRemaining.toLocaleString()}
            </div>
          </div>

          <div>
            <span className="text-sm font-normal text-slate-500">Impressions served</span>
            <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900">
              {impressionsServed.toLocaleString()}
            </div>
          </div>

          <div>
            <span className="text-sm font-normal text-slate-500">Clicks</span>
            <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900">
              {clicks.toLocaleString()}
            </div>
          </div>

          <div>
            <span className="text-sm font-normal text-slate-500">CTR</span>
            <div className="mt-1 text-lg sm:text-xl font-bold text-slate-900">
              {ctrText}
            </div>
          </div>
        </div>
      </div>

      {/* CARD 2: Live Preview */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          LIVE PREVIEW
        </span>
        <p className="mt-1 text-sm text-slate-500">
          Your ad shows in the chat while the AI is thinking, right under the user&apos;s message.
        </p>

        {/* Mock Chat Frame */}
        <div className="mt-6 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          {/* User Prompt (Right-aligned bubble) */}
          <div className="flex justify-end">
            <div className="rounded-2xl bg-slate-100 px-4 py-2.5 text-sm font-normal text-slate-800 shadow-2xs">
              Help me plan a weekend getaway
            </div>
          </div>

          {/* Ad Creative Line (Left-aligned) */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center gap-2.5 min-w-0">
              {!removeIcon && (
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-50 border border-slate-200/70 overflow-hidden">
                  {iconUrl ? (
                    <img src={iconUrl} alt="Logo" className="h-5 w-5 object-contain" />
                  ) : (
                    <BrandFeatherIcon className="h-4 w-4" />
                  )}
                </div>
              )}
              <a
                href={targetUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-sm sm:text-base font-medium text-[#1d4ed8] hover:underline"
              >
                {adCopy || 'Your ad copy appears here'}
              </a>
            </div>

            {/* Separator Line */}
            <div className="border-t border-slate-200/80"></div>

            {/* Thinking Status */}
            <div className="flex items-center gap-2 text-sm text-slate-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              <span>Thinking</span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Edit your ad */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Edit your ad</h2>

        <form onSubmit={handleSaveChanges} className="space-y-5">
          {/* Sponsor name */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Sponsor name
            </label>
            <input
              type="text"
              required
              value={sponsorName}
              onChange={(e) => setSponsorName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition"
              placeholder="e.g. Acme Corp"
            />
          </div>

          {/* Ad copy */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Ad copy
            </label>
            <input
              type="text"
              required
              maxLength={64}
              value={adCopy}
              onChange={(e) => setAdCopy(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition"
              placeholder="e.g. Your ad copy appears here"
            />
            <div className="mt-1.5 text-xs text-slate-400">
              {adCopy.length}/64 characters (min 3)
            </div>
          </div>

          {/* Destination URL */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-1.5">
              Destination URL
            </label>
            <input
              type="url"
              required
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition"
              placeholder="https://example.com"
            />
          </div>

          {/* Icon (optional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-0.5">
              Icon (optional)
            </label>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              A small square logo shown next to your ad. JPG, PNG, or WEBP. Large images are resized automatically.
            </p>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white p-1">
                {iconUrl && !removeIcon ? (
                  <img src={iconUrl} alt="Ad icon" className="h-7 w-7 object-contain" />
                ) : (
                  <BrandFeatherIcon className="h-5 w-5" />
                )}
              </div>

              <label className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition">
                <span>Choose File</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <span className="text-xs text-slate-500 truncate max-w-xs">{iconFileName}</span>
            </div>

            <label className="mt-2.5 flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={removeIcon}
                onChange={(e) => setRemoveIcon(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span>Remove the current icon</span>
            </label>
          </div>

          {/* Save changes Button */}
          <button
            type="submit"
            disabled={isSaving || adCopy.length < 3}
            className="w-full rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 text-sm shadow-sm transition active:scale-[0.99] disabled:opacity-50 mt-6 cursor-pointer"
          >
            {isSaving ? 'Saving changes...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CampaignManagePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      <Navbar />
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="py-24 text-center text-sm text-slate-500">
              Loading campaign dashboard...
            </div>
          }
        >
          <CampaignManagerContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
