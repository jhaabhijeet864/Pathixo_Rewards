import type { UserEarnings } from '@pathixo/shared';

const earningsDisplay = document.getElementById('earnings-display') as HTMLDivElement;
const toggleEnabled = document.getElementById('toggle-enabled') as HTMLInputElement;
const statusDot = document.getElementById('status-dot') as HTMLSpanElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const btnDashboard = document.getElementById('btn-dashboard') as HTMLButtonElement;

let currentDeviceId = 'guest';

function updateUI(enabled: boolean, earnings?: UserEarnings, deviceId?: string) {
  if (toggleEnabled) {
    toggleEnabled.checked = enabled;
  }

  if (deviceId) {
    currentDeviceId = deviceId;
  }

  if (statusDot && statusText) {
    if (enabled) {
      statusDot.classList.remove('paused');
      statusText.textContent = 'Sponsored cards are on';
    } else {
      statusDot.classList.add('paused');
      statusText.textContent = 'Sponsored cards are paused';
    }
  }

  if (earnings && earningsDisplay) {
    earningsDisplay.textContent = `$${earnings.balance_usd.toFixed(4)}`;
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
if (toggleEnabled) {
  toggleEnabled.addEventListener('change', () => {
    const isChecked = toggleEnabled.checked;
    updateUI(isChecked);
    browser.runtime.sendMessage({ type: 'SET_ENABLED', enabled: isChecked });
  });
}

// Open Dashboard
if (btnDashboard) {
  btnDashboard.addEventListener('click', () => {
    browser.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
    window.close();
  });
}
