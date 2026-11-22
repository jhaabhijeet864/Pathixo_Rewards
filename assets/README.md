# Pathixo Rewards — Brand Asset Pack

This pack uses the exact uploaded Rise logo artwork. The source PNG is included unchanged at `source/original-upload.png`. The mark has not been redrawn, recolored, simplified, or embellished.

## Quick start
- **Chrome Extension (Manifest V3):** copy `chrome-extension/icons/` into your extension and merge `icons` and `action.default_icon` from `chrome-extension/manifest.example.json` into your existing `manifest.json`.
- **Website:** copy `web/icons/`, `web/favicon.ico`, `web/pathixo-rewards.svg`, and `web/manifest.webmanifest` into your public assets. Use `web/head-snippet.html`.
- **Next.js App Router:** copy files from `nextjs/app/` into your `app/` directory. Optional explicit metadata example: `nextjs/usage.tsx`.
- **PWA:** serve `web/manifest.webmanifest` at `/manifest.webmanifest` and the icon files at `/icons/`.
- **Windows / Electron:** `desktop/pathixo-rewards.ico`.
- **macOS / Electron:** `desktop/pathixo-rewards.icns`.
- **Linux desktop:** `web/icons/pathixo-rewards-512.png`.
- **Tauri:** copy `tauri/icons/` into `src-tauri/icons/`; see `tauri/usage.txt`.

## Contents
| Folder | Use |
|---|---|
| `source/` | Original upload, unchanged |
| `master/` | 1024×1024 transparent master, cropped transparent artwork, SVG wrapper |
| `chrome-extension/icons/` | 16, 32, 48, 128 px Chrome assets |
| `web/icons/` | PNG sizes 16, 24, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512, 1024 px |
| `web/` | Favicon PNGs + ICO, SVG wrapper, PWA manifest, HTML snippet |
| `desktop/` | Multi-resolution Windows ICO and macOS ICNS |
| `tauri/icons/` | Tauri-compatible PNG, ICO, ICNS names |
| `nextjs/app/` | Next.js `icon.png`, `apple-icon.png`, `favicon.ico` |
| `previews/` | Light/dark previews and size lineup |

## SVG note
The uploaded artwork is an RGBA raster. To preserve it exactly, the SVG embeds the transparent PNG master. It is **not a traced vector path**. Tracing could subtly change contours, so no redraw was made.

PNG exports retain transparency; no background was added. The square master uses transparent padding and preserves the logo's proportions. Smaller PNGs are resampled from the transparent master using Lanczos filtering.

Dominant sampled colors are approximately electric green `#22F964` and charcoal `#1C2028`. The original has slight per-pixel variation, retained in the exports.

## Chrome Manifest V3 snippet
```json
{
  "icons": {
    "16": "icons/icon16.png",
    "32": "icons/icon32.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  },
  "action": {
    "default_title": "Pathixo Rewards",
    "default_icon": {
      "16": "icons/icon16.png",
      "32": "icons/icon32.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  }
}
```
Merge these entries into your existing manifest. Keep your current permissions, content scripts, service worker, and other configuration.

## Toolbar contrast
The charcoal speech-bubble shape may blend into very dark browser themes. The bright green arrow remains visible. This pack does not add a badge or background because the chosen logo is to remain unchanged.
