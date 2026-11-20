import type { UserEarnings } from '@pathixo/shared';

const earningsDisplay = document.getElementById('earnings-display') as HTMLDivElement;
const toggleEnabled = document.getElementById('toggle-enabled') as HTMLInputElement;
const statusDot = document.getElementById('status-dot') as HTMLSpanElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const btnDashboard = document.getElementById('btn-dashboard') as HTMLButtonElement;

function updateUI(enabled: boolean, earnings?: UserEarnings) {
  toggleEnabled.checked = enabled;

  if (enabled) {
    statusDot.classList.remove('paused');
    statusText.textContent = 'Sponsored cards are on';
  } else {
    statusDot.classList.add('paused');
    statusText.textContent = 'Sponsored cards are paused';
  }

  if (earnings) {
    earningsDisplay.textContent = `$${earnings.balance_usd.toFixed(4)}`;
  }
}

// Fetch live state from background
browser.runtime.sendMessage({ type: 'GET_STATE' }).then((res) => {
  if (res) {
    updateUI(res.enabled, res.earnings);
  }
});

// Toggle handler
toggleEnabled.addEventListener('change', () => {
  const isChecked = toggleEnabled.checked;
  updateUI(isChecked);
  browser.runtime.sendMessage({ type: 'SET_ENABLED', enabled: isChecked });
});

// Open Dashboard
btnDashboard.addEventListener('click', () => {
  browser.runtime.sendMessage({ type: 'OPEN_DASHBOARD' });
  window.close();
});
