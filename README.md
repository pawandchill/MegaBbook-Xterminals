# MegaBbook Xterminal

MegaBbook Xterminal is a production-oriented Windows desktop terminal and SSH client built with Electron, React, TypeScript, xterm.js, SQLite, and ssh2. It provides multi-tab terminal workflows, SSH connection management, SFTP file browsing, secure credential storage, and a modern Fluent-inspired UI optimized for system administrators and power users.

## Features

- Multi-tab terminal sessions with split panes and session persistence
- SSH host management with favorites, quick connect, history, and tagging
- SSH shell, port forwarding, local forwarding, remote forwarding, and SOCKS proxy support
- SFTP file manager with upload, download, rename, delete, permissions, and progress tracking
- Searchable terminal sessions with log export
- Secure credential storage via Windows Credential Manager (keytar)
- SQLite-based local metadata and settings persistence
- Dark/light themes with Fluent-inspired interface
- High-performance TypeScript architecture with dependency injection and modular services
- Installer generation via electron-builder for Windows deployment

## Product goals

This product is designed for enterprise reliability and scalability, supporting a high volume of session activity, secure credential handling, and stable terminal performance on Windows 11 and modern Windows Server environments.

## Tech stack

- Electron + React + TypeScript
- xterm.js with search and fit addons
- Node.js backend services
- SQLite for local persistence
- ssh2 for SSH and SFTP operations
- keytar for secure OS credential management
- Zustand for UI state
- Tailwind CSS for theming and layout
- Vitest for unit tests

## Project structure

- `frontend/` — React user interface and xterm terminal UI
- `backend/` — Node.js services and shell management
- `shared/` — domain models and shared types
- `database/` — schema and migration SQL
- `docs/` — architecture and build documents
- `tests/` — automated unit tests

## Quick start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the app in development mode:
   ```bash
   npm run dev
   ```

3. Build the production package for Windows:
   ```bash
   npm run build
   ```

## Scripts

- `npm run dev` — start the Vite renderer and Electron main process in watch mode
- `npm run build` — build the renderer, compile the Electron main process, and package for Windows
- `npm run test` — run the unit tests
- `npm run lint` — lint the TypeScript source
- `npm run typecheck` — validate the TypeScript project

## Windows packaging

The project includes an `electron-builder` configuration in `package.json` to generate an NSIS installer for Windows. The build output is written to `dist-release/`.

## Security notes

- Credentials are stored in the system credential vault using `keytar` to integrate with Windows Credential Manager.
- Host fingerprint verification is supported in the SSH connection manager.
- Settings and local metadata are stored in SQLite with a structured schema.

## Documentation

- `docs/ARCHITECTURE.md` — system architecture and module overview
- `docs/BUILD.md` — build and distribution details
- `database/schema.sql` — database initialization schema

## License

This project is licensed under the MIT License.
