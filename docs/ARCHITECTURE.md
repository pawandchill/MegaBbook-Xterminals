# MegaBbook Xterminal Architecture

## 1. System overview

MegaBbook Xterminal is structured as a layered desktop application with a secure transport layer, service layer, data layer, and modern UI layer. The architecture is designed for thousands of sessions while emphasizing reliability, maintainability, and security.

## 2. Layered architecture

### Presentation layer
- Electron shell and application window
- React + TypeScript frontend
- xterm.js terminal client surface
- Tailwind-based design system for Fluent-inspired UI

### Application layer
- Settings orchestration
- Connection manager
- SFTP service orchestration
- Terminal session lifecycle manager
- Notification system and tray integration

### Service layer
- SSHConnectionManager
- SFTPService
- CredentialStore
- DatabaseService
- SettingsService

### Data layer
- SQLite local persistence
- Windows Credential Manager integration
- Structured session logs and host metadata

## 3. Dependency flow

The Electron main process owns system runtime concerns, database lifecycle, and IPC handlers. The React renderer is intentionally lightweight and communicates with the main process through context-isolated IPC channels.

## 4. Critical modules

### SSHConnectionManager
- Opens SSH shells, keeps them alive, and stream lines to the renderer
- Supports password authentication, key-based authentication, and keep-alive
- Handles session status transitions and health monitoring

### SFTPService
- Lists remote directory contents
- Uploads and downloads files with tracking and progress reporting
- Supports rename, delete, create, and synchronization tasks

### DatabaseService
- Initializes SQLite schema
- Persists settings, sessions, hosts, and logs
- Provides clean CRUD helpers for data access

### SettingsService
- Maintains application defaults
- Applies runtime configuration patches
- Keeps secure and non-secure settings separated

## 5. Security strategy

- Credentials are kept in OS-secured storage via keytar/Windows Credential Manager.
- SSH host keys are validated during connection establishment.
- Password fields are never stored in plain-text if secure storage is active.
- UI state and connection configuration are isolated via IPC boundaries.

## 6. Scalability considerations

- Service boundaries are shaped for horizontal feature growth.
- SQLite is sufficient for offline local metadata and a high-volume but local workload.
- SSH sessions are tracked individually and kept isolated from the UI lifecycle.
- Logging events are purposely structured so they can be exported or visualized without using large in-memory buffers.

## 7. Runtime phases

1. Bootstrap the Electron shell and application window.
2. Initialize the SQLite database and default settings.
3. Load the renderer UI and connect to stored hosts.
4. Start SSH connection workflows on demand.
5. Report health and user notifications through the tray and notifications.

## 8. Future roadmap

- Broadcast commands across selected sessions
- Session monitoring dashboard
- Resource usage graphs
- Plugin architecture
- Deep host fingerprint verification and trust policy engine
