import { NextResponse } from 'next/server';
import type { AdCreative } from '@pathixo/shared';
import { campaignStore } from '../../../../lib/campaign-store';

// High-yield AI sponsor & Pathixo startup house ad inventory
const FALLBACK_INVENTORY: AdCreative[] = [
  {
    id: 'ad_house_vakxo',
    headline: 'Run AI Agents Locally: 0 API Cost',
    sponsor_name: 'Vakxo',
    url: 'https://vakxo.pathixo.com/',
    icon_url: '/house-ads/pathixo-icon.jpg',
    badge: 'By Pathixo',
    is_house_ad: true,
    target_cpm: 25.0,
    ad_token: 'tok_house_vakxo_001',
  },
  {
    id: 'ad_house_pathixo',
    headline: 'Pathixo AI Labs: Builds AI Native Apps',
    sponsor_name: 'Pathixo',
    url: 'https://pathixo.com/',
    icon_url: '/house-ads/pathixo-icon.jpg',
    badge: 'By Pathixo',
    is_house_ad: true,
    target_cpm: 22.0,
    ad_token: 'tok_house_pathixo_002',
  },
  {
    id: 'ad_house_krocpdf',
    headline: 'Create PDFs and Other Docs: 100% Locally, Anti-ilovePDF',
    sponsor_name: 'KrocPDF',
    url: 'https://jpg-to-pdf-zeta.vercel.app/',
    icon_url: '/house-ads/krocpdf-icon.png',
    badge: '100% Local',
    is_house_ad: true,
    target_cpm: 20.0,
    ad_token: 'tok_house_krocpdf_003',
  },
  {
    id: 'ad_house_blip',
    headline: 'Vanish From Meeting with just a snap',
    sponsor_name: 'Blip',
    url: 'https://blip-hnu8.vercel.app/',
    icon_url: '/house-ads/blip-icon.png',
    badge: 'Chrome Extension',
    is_house_ad: true,
    target_cpm: 20.0,
    ad_token: 'tok_house_blip_004',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deviceId = searchParams.get('device_id') || 'anonymous';

  // Get active paid campaigns from campaignStore
  const activePaid = campaignStore.getActiveCreatives();

  // Combine active paid campaigns with fallback inventory if needed
  const combinedAds: AdCreative[] = [...activePaid];

  // Append fallback ads that are not duplicates
  for (const fallback of FALLBACK_INVENTORY) {
    if (!combinedAds.some((ad) => ad.id === fallback.id || ad.ad_token === fallback.ad_token)) {
      combinedAds.push(fallback);
    }
  }

  return NextResponse.json({
    status: 'ok',
    device_id: deviceId,
    ads: combinedAds,
    timestamp: Date.now(),
  });
}
