# Security Policy — Pathixo Rewards

Pathixo Rewards takes security and user privacy seriously. This document outlines our vulnerability disclosure policy and technical security practices.

---

## 1. Supported Versions

Security patches are actively provided for the following versions:

| Package | Version | Supported |
| :--- | :--- | :--- |
| `pathixo-rewards` (Monorepo root) | 0.1.x | Yes |
| `@pathixo/extension` | 0.1.x | Yes |
| `@pathixo/web` | 0.1.x | Yes |
| `@pathixo/shared` | 0.1.x | Yes |

---

## 2. Reporting a Vulnerability

If you discover a security vulnerability, please report it privately:

- **Email**: Send vulnerability reports to `security@pathixo.com`
- **Include**:
  - A summary of the vulnerability
  - Affected components (extension, web portal, or API)
  - Detailed steps or proof-of-concept to reproduce
  - Potential impact assessment

### Response Timeline
- **Initial acknowledgement**: Within 48 hours
- **Assessment and triage**: Within 7 business days
- **Fix and disclosure**: Scheduled based on severity

Please do not open public GitHub issues for undisclosed security vulnerabilities.

---

## 3. Extension Security Architecture

The Pathixo Rewards browser extension is engineered to enforce strict security boundaries:

1. **Restricted Permissions**:
   The extension requests only `storage` permission and explicit host permissions for the 5 supported AI domains. It does not request broad permissions such as `<all_urls>`, `webRequest`, `cookies`, or `tabs`.

2. **Isolated Shadow DOM**:
   Ad cards are injected into isolated Shadow DOM trees (`mode: 'open'`) to guarantee that host web page scripts cannot tamper with extension UI elements, and extension styling cannot bleed into host pages.

3. **No Sinks for Dynamic Code**:
   The extension code is compiled ahead of time. It strictly avoids `eval()`, `new Function()`, and direct `innerHTML` assignments.

4. **Zero Prompt Inspection**:
   Content scripts inspect only interaction controls (such as send and stop buttons) to detect generation timing. The extension never accesses, buffers, or transmits conversation transcripts.
