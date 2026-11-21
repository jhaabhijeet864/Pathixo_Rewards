import type { UserEarnings } from '@pathixo/shared';

const earningsDisplay = document.getElementById('earnings-display') as HTMLDivElement;
const todayBadge = document.getElementById('today-impressions-badge') as HTMLSpanElement;
const toggleEnabled = document.getElementById('toggle-enabled') as HTMLInputElement;
const statusDot = document.getElementById('status-dot') as HTMLSpanElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const btnDashboard = document.getElementById('btn-dashboard') as HTMLButtonElement;
const btnCopyRef = document.getElementById('btn-copy-ref') as HTMLButtonElement;
const copyRefText = document.getElementById('copy-ref-text') as HTMLSpanElement;

let currentDeviceId = 'guest';

function updateUI(enabled: boolean, earnings?: UserEarnings, deviceId?: string) {
  toggleEnabled.checked = enabled;

  if (deviceId) {
    currentDeviceId = deviceId;
  }

  if (enabled) {
    statusDot.classList.remove('paused');
    statusText.textContent = 'Sponsored cards are on';
  } else {
    statusDot.classList.add('paused');
    statusText.textContent = 'Sponsored cards are paused';
  }

  if (earnings) {
    earningsDisplay.textContent = `$${earnings.balance_usd.toFixed(4)}`;
    if (todayBadge) {
      const count = earnings.impressions_today || 0;
      todayBadge.textContent = `${count} ${count === 1 ? 'ad' : 'ads'} viewed today`;
    }
  }
}

// Fetch live state from background
browser.runtime.sendMessage({ type: 'GET_STATE' }).then((res: unknown) => {
  const data = res as { deviceId?: string; enabled: boolean; earnings?: UserEarnings } | undefined;
  if (data) {
    updateUI(data.enabled, data.earnings, data.deviceId);
  }
});

// Toggle handler
toggleEnabled.addEventListener('change', () => {
  const isChecked = toggleEnabled.checked;
  updateUI(isChecked);
  browser.runtime.sendMessage({ type: 'SET_ENABLED', enabled: isChecked });
});

// 1-Click Referral Link Copy
btnCopyRef.addEventListener('click', async () => {
  const refUrl = `https://pathixorewards.com/?ref=${encodeURIComponent(currentDeviceId)}`;
  try {
    await navigator.clipboard.writeText(refUrl);
    copyRefText.textContent = '✓ Copied to clipboard!';
    setTimeout(() => {
      copyRefText.textContent = '📋 Copy Referral Link';
    }, 2500);
  } catch {
    copyRefText.textContent = 'Copied: ' + currentDeviceId;
  }
});

// Open Dashboard
btnDashboard.addEventListener('click', () => {
  browser.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
  window.close();
});
