# Blurby Chrome Extension — Privacy Policy

**Last updated:** 2026-03-24

## What data the extension accesses

The Blurby Chrome extension accesses the **content of the currently active web page** only when you explicitly trigger it (via the "Send to Blurby" button, context menu, or keyboard shortcut). It extracts:

- Page title
- Author name (if available)
- Article text content
- Word count
- Publication date (if available)
- Source URL
- Primary image URL (for cover display)

## Where data is sent

Extracted content is sent to **one** of the following destinations, depending on your configuration:

1. **Your local Blurby desktop application** — via a localhost-only WebSocket connection (ws://127.0.0.1:48924). Data never leaves your computer.
2. **Your personal cloud storage** (Google Drive or Microsoft OneDrive) — only if you have signed in and configured cloud sync. Data is stored in your own cloud account's Blurby app folder.

## What data is stored locally

The extension stores the following in Chrome's local storage:

- Connection settings (connection mode, pairing token)
- Cloud authentication tokens (if signed in)
- Last 5 recently sent article titles (for the popup display)
- Default reading mode preference

## What data is NOT collected

- No browsing history is collected or transmitted
- No analytics or telemetry data is sent to any server
- No data is sent to Blurby's servers (there are none — Blurby is a local-first application)
- No data is sold or shared with third parties

## Permissions explained

- **activeTab**: Required to extract content from the current page when you click "Send to Blurby"
- **storage**: Required to save your extension settings locally
- **contextMenus**: Required for the right-click "Send to Blurby" menu item
- **scripting**: Required to inject the content extraction script into the active tab
- **identity** (optional): Required only if you choose to use cloud sync via Google or Microsoft

## Contact

For questions about this privacy policy, open an issue at: https://github.com/gorillabrown/Blurby/issues
