-- ============================================================================
-- Pathixo Rewards — PostgreSQL Production Database Schema
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Devices (Anonymous client device IDs created on first install)
CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(64) PRIMARY KEY,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    browser_family VARCHAR(32) DEFAULT 'chrome',
    extension_version VARCHAR(16) DEFAULT '0.1.0'
);

CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);

-- 2. Users (Optional linked accounts for multi-device sync and cashouts)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(128),
    balance_usd NUMERIC(10, 4) DEFAULT 0.0000 CHECK (balance_usd >= 0),
    lifetime_earned_usd NUMERIC(10, 4) DEFAULT 0.0000,
    referral_code VARCHAR(32) UNIQUE NOT NULL,
    referred_by_code VARCHAR(32),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- 3. Advertiser Campaigns
CREATE TABLE IF NOT EXISTS ad_campaigns (
    id VARCHAR(64) PRIMARY KEY,
    advertiser_email VARCHAR(255) NOT NULL,
    sponsor_name VARCHAR(128) NOT NULL,
    headline VARCHAR(255) NOT NULL,
    target_url TEXT NOT NULL,
    icon_url TEXT,
    badge VARCHAR(64) DEFAULT 'Sponsored',
    cpm_rate_usd NUMERIC(6, 2) NOT NULL DEFAULT 20.00,
    budget_total_usd NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    budget_remaining_usd NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    target_platforms TEXT[] DEFAULT ARRAY['chatgpt', 'claude', 'gemini', 'perplexity', 'deepseek'],
    status VARCHAR(32) DEFAULT 'pending_review' CHECK (status IN ('active', 'paused', 'pending_review', 'exhausted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON ad_campaigns(status);

-- 4. Verified Impressions Ledger
CREATE TABLE IF NOT EXISTS impressions_ledger (
    event_id VARCHAR(64) PRIMARY KEY,
    ad_id VARCHAR(64) NOT NULL,
    ad_token VARCHAR(128) NOT NULL,
    device_id VARCHAR(64) NOT NULL REFERENCES devices(device_id) ON DELETE CASCADE,
    ai_platform VARCHAR(32) NOT NULL,
    dwell_ms INTEGER NOT NULL CHECK (dwell_ms >= 4000),
    credited_usd NUMERIC(8, 4) NOT NULL DEFAULT 0.0120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_impressions_device ON impressions_ledger(device_id);
CREATE INDEX IF NOT EXISTS idx_impressions_created_at ON impressions_ledger(created_at);

-- 5. Cashout Requests ($2.00 minimum floor)
CREATE TABLE IF NOT EXISTS cashout_requests (
    id VARCHAR(64) PRIMARY KEY,
    device_id VARCHAR(64) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount_usd NUMERIC(10, 2) NOT NULL CHECK (amount_usd >= 2.00),
    payout_method VARCHAR(32) NOT NULL CHECK (payout_method IN ('upi', 'paypal', 'gift_card')),
    payout_destination VARCHAR(255) NOT NULL,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
    transaction_reference VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_cashouts_device ON cashout_requests(device_id);
CREATE INDEX IF NOT EXISTS idx_cashouts_status ON cashout_requests(status);

-- 6. Remote Selector Snapshot History
CREATE TABLE IF NOT EXISTS selector_configs (
    version VARCHAR(32) PRIMARY KEY,
    config_json JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
