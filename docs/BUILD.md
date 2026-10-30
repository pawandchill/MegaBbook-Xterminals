# Build and Distribution Guide

## Prerequisites

- Node.js 20+
- npm 10+
- Windows 11 for final packaging and installer testing
- Visual Studio Build Tools if native dependencies require compilation

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

This starts the Vite renderer and Electron main process in watch mode.

## Production build

```bash
npm run build
```

The `electron-builder` package produces a Windows installer in `dist-release/`.

## Type checking and tests

```bash
npm run typecheck
npm run test
npm run lint
```

## Packaging notes

- `electron-builder` is configured in `package.json` with the NSIS target for Windows.
- Final output is generated in `dist-release`.
- The app assets and runtime files are included from `dist/**/*`, `database/**/*`, and `assets/**/*`.

## Recommended release checklist

- verify installer launches on clean Windows 11 environment
- confirm SSH connectivity to a sample Linux host
- validate SFTP uploads/downloads
- ensure credential storage works via Windows Credential Manager
- test auto-reconnect and terminal persistence
- verify dark/light theme switching
- validate app tray behavior and notifications
