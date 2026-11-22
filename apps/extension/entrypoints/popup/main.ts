import type { UserEarnings } from '@pathixo/shared';
import type { AuthUser } from '../../lib/storage';

const unauthView = document.getElementById('unauthenticated-view') as HTMLDivElement;
const authView = document.getElementById('authenticated-view') as HTMLDivElement;
const headerSwitch = document.getElementById('header-switch') as HTMLLabelElement;
const earningsDisplay = document.getElementById('earnings-display') as HTMLDivElement;
const toggleEnabled = document.getElementById('toggle-enabled') as HTMLInputElement;
const statusDot = document.getElementById('status-dot') as HTMLSpanElement;
const statusText = document.getElementById('status-text') as HTMLSpanElement;
const btnDashboard = document.getElementById('btn-dashboard') as HTMLButtonElement;
const btnLogin = document.getElementById('btn-login') as HTMLButtonElement;
const userBadgeRow = document.getElementById('user-badge-row') as HTMLDivElement;
const userEmailBadge = document.getElementById('user-email-badge') as HTMLSpanElement;

let currentDeviceId = 'guest';

function updateUI(
  enabled: boolean,
  earnings?: UserEarnings,
  deviceId?: string,
  user?: AuthUser | null
) {
  if (toggleEnabled) {
    toggleEnabled.checked = enabled;
  }

  if (deviceId) {
    currentDeviceId = deviceId;
  }

  const isLoggedIn = !!(user && user.logged_in);

  if (isLoggedIn) {
    if (unauthView) unauthView.style.display = 'none';
    if (authView) authView.style.display = 'flex';
    if (headerSwitch) headerSwitch.style.display = 'inline-block';

    if (userEmailBadge && user?.email) {
      userEmailBadge.textContent = user.email;
      if (userBadgeRow) userBadgeRow.style.display = 'block';
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
      earningsDisplay.textContent = `$${earnings.balance_usd.toFixed(5)}`;
    }
  } else {
    // Show activation onboarding state
    if (unauthView) unauthView.style.display = 'block';
    if (authView) authView.style.display = 'none';
    if (headerSwitch) headerSwitch.style.display = 'none';
  }
}

// Fetch live state from background
browser.runtime.sendMessage({ type: 'GET_STATE' }).then((res: unknown) => {
  const data = res as {
    deviceId?: string;
    enabled: boolean;
    earnings?: UserEarnings;
    user?: AuthUser | null;
  } | undefined;
  if (data) {
    updateUI(data.enabled, data.earnings, data.deviceId, data.user);
  }
});

// Toggle handler
if (toggleEnabled) {
  toggleEnabled.addEventListener('change', () => {
    const isChecked = toggleEnabled.checked;
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

// Open Login / Activation
if (btnLogin) {
  btnLogin.addEventListener('click', () => {
    browser.runtime.sendMessage({ type: 'OPEN_LOGIN' });
    window.close();
  });
}
