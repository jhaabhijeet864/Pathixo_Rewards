-- ============================================================================
-- Pathixo Rewards — Mock & Development Seed Data
-- Run after db/schema.sql:
-- psql "$DATABASE_URL" -f db/schema.sql -f db/seed.sql
-- ============================================================================

-- 1. Insert Initial AI Platform Selector Configuration
INSERT INTO selector_configs (platform_id, prompt_form_selector, stop_button_selector, stream_container_selector, response_element_selector)
VALUES 
    ('chatgpt', 'form textarea, div[contenteditable="true"]', 'button[data-testid="stop-button"], button[aria-label="Stop generating"]', 'div.agent-turn, [data-message-author-role="assistant"]', 'div[data-message-author-role="assistant"]'),
    ('claude', 'div[contenteditable="true"]', 'button[aria-label="Stop response"], button[data-testid="stop-button"]', 'div.font-claude-message, div[data-is-streaming="true"]', 'div.font-claude-message'),
    ('gemini', 'div.input-area rich-textarea', 'button[aria-label="Stop response"]', 'div.model-response-text, message-content', 'div.model-response-text'),
    ('perplexity', 'textarea[placeholder*="Ask"]', 'button[aria-label="Stop"]', 'div.prose, [data-testid="answer-content"]', 'div.prose'),
    ('deepseek', 'textarea, div[contenteditable="true"]', 'button[aria-label="Stop"], div[role="button"]:has(svg.stop-icon)', 'div.chat-message-content', 'div.chat-message-content')
ON CONFLICT (platform_id) DO UPDATE SET
    prompt_form_selector = EXCLUDED.prompt_form_selector,
    stop_button_selector = EXCLUDED.stop_button_selector,
    stream_container_selector = EXCLUDED.stream_container_selector,
    response_element_selector = EXCLUDED.response_element_selector,
    updated_at = NOW();

-- 2. Insert Test Devices
INSERT INTO devices (device_id, browser_family, extension_version)
VALUES
    ('dev_demo_chrome_01', 'chrome', '0.1.0'),
    ('dev_demo_firefox_02', 'firefox', '0.1.0'),
    ('dev_demo_brave_03', 'chrome', '0.1.0')
ON CONFLICT (device_id) DO NOTHING;

-- 3. Insert Test Users
INSERT INTO users (id, email, full_name, balance_usd, lifetime_earned_usd, referral_code)
VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'developer@pathixo.com', 'Alex Developer', 4.3500, 18.7200, 'PATHIXO_PRO'),
    ('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380b22', 'founder@startup.io', 'Sarah Founder', 2.1500, 8.4000, 'AI_BUILDER')
ON CONFLICT (email) DO NOTHING;

-- Link device to first user
UPDATE devices SET user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' WHERE device_id = 'dev_demo_chrome_01';

-- 4. Insert Default Seed Campaigns
INSERT INTO ad_campaigns (id, advertiser_email, sponsor_name, headline, target_url, icon_url, badge, cpm_rate_usd, budget_total_usd, budget_remaining_usd, status)
VALUES
    ('camp_cursor', 'growth@cursor.com', 'Cursor', 'Build software faster with AI paired coding in VS Code.', 'https://cursor.com', 'https://cursor.com/favicon.ico', 'Sponsored', 20.00, 200.00, 182.40, 'active'),
    ('camp_supabase', 'marketing@supabase.com', 'Supabase', 'Build in a weekend, scale to millions. Open source Firebase alternative.', 'https://supabase.com', 'https://supabase.com/favicon.ico', 'Featured', 22.00, 250.00, 214.50, 'active'),
    ('camp_resend', 'hello@resend.com', 'Resend', 'Email for developers. 99.9% inbox deliverability with React templates.', 'https://resend.com', 'https://resend.com/favicon.ico', 'Sponsored', 18.00, 150.00, 120.00, 'active'),
    ('camp_vercel', 'partners@vercel.com', 'Vercel', 'Develop, preview, and ship global high-yield applications.', 'https://vercel.com', 'https://vercel.com/favicon.ico', 'Sponsored', 25.00, 300.00, 285.00, 'active')
ON CONFLICT (id) DO UPDATE SET
    budget_remaining_usd = EXCLUDED.budget_remaining_usd,
    status = EXCLUDED.status;

-- 5. Insert Sample Qualified Impressions (Dwell >= 4000ms)
INSERT INTO impressions_ledger (event_id, ad_id, ad_token, device_id, ai_platform, dwell_ms, credited_usd, created_at)
VALUES
    ('evt_seed_001', 'camp_cursor', 'tok_cursor_001', 'dev_demo_chrome_01', 'chatgpt', 5200, 0.0120, NOW() - INTERVAL '2 hours'),
    ('evt_seed_002', 'camp_supabase', 'tok_supabase_002', 'dev_demo_chrome_01', 'claude', 4800, 0.0132, NOW() - INTERVAL '1 hour'),
    ('evt_seed_003', 'camp_resend', 'tok_resend_003', 'dev_demo_chrome_01', 'perplexity', 6100, 0.0108, NOW() - INTERVAL '30 minutes')
ON CONFLICT (event_id) DO NOTHING;

-- 6. Insert Sample Cashout Requests (Meets >= $2.00 threshold)
INSERT INTO cashout_requests (id, device_id, user_id, amount_usd, payout_method, payout_destination, status, created_at)
VALUES
    ('payout_seed_001', 'dev_demo_chrome_01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2.5000, 'upi', 'developer@oksbi', 'completed', NOW() - INTERVAL '3 days'),
    ('payout_seed_002', 'dev_demo_chrome_01', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5.0000, 'paypal', 'developer@gmail.com', 'completed', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;
