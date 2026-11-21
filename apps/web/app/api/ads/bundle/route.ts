import { NextResponse } from 'next/server';
import type { AdCreative } from '@pathixo/shared';
import { campaignStore } from '../../../../lib/campaign-store';

// High-yield AI sponsor & affiliate fallback inventory
const FALLBACK_INVENTORY: AdCreative[] = [
  {
    id: 'ad_b2b_cursor',
    headline: 'Build software 10x faster with Cursor — The AI code editor.',
    sponsor_name: 'Cursor',
    url: 'https://cursor.com/?ref=pathixo',
    icon_url: 'https://cursor.com/favicon.ico',
    badge: 'Trending AI',
    is_house_ad: false,
    target_cpm: 25.0,
    ad_token: 'tok_b2b_cursor_2026',
  },
  {
    id: 'ad_b2b_perplexity',
    headline: 'Instant research with verified sources using Perplexity Pro.',
    sponsor_name: 'Perplexity',
    url: 'https://perplexity.ai/pro?ref=pathixo',
    icon_url: 'https://www.perplexity.ai/favicon.ico',
    badge: 'Pro Pick',
    is_house_ad: false,
    target_cpm: 22.0,
    ad_token: 'tok_b2b_pplx_2026',
  },
  {
    id: 'ad_b2b_notion',
    headline: 'Organize your knowledge base & connected workspaces with Notion AI.',
    sponsor_name: 'Notion',
    url: 'https://notion.so/?ref=pathixo',
    icon_url: 'https://www.notion.so/front-static/favicon.ico',
    badge: 'Workspace',
    is_house_ad: false,
    target_cpm: 20.0,
    ad_token: 'tok_b2b_notion_2026',
  },
  {
    id: 'ad_b2b_v0',
    headline: 'Generate production UI components with v0 by Vercel in seconds.',
    sponsor_name: 'Vercel v0',
    url: 'https://v0.dev/?ref=pathixo',
    icon_url: 'https://v0.dev/favicon.ico',
    badge: 'Developer Tool',
    is_house_ad: false,
    target_cpm: 24.0,
    ad_token: 'tok_b2b_v0_2026',
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
