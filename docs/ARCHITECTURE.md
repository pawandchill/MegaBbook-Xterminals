# MegaBbook Xterminal Architecture

## Overview

MegaBbook Xterminal is a Windows desktop SSH and terminal client with a layered architecture designed for enterprise reliability and low-latency terminal interaction. The application separates shell control, state, persistence, and UI concerns so each subsystem can evolve independently without affecting the user workflow.

## Layers

### 1. Presentation layer
- Electron shell for Windows desktop runtime
- React + TypeScript UI for dashboard and terminal workspaces
- Tailwind styling and reusable UI primitives
- xterm.js integration for high-performance terminal rendering

### 2. Application layer
- IPC bridge between Electron main process and renderer
- State orchestration for sessions, hosts, and settings
- Search, notifications, and connection lifecycle coordination

### 3. Domain layer
- Connection host models
- settings schema
- terminal log/result models
- session record contracts

### 4. Infrastructure layer
- SQLite persistence for settings and host metadata
- ssh2 client for SSH shell and file transport
- keytar integration with Windows Credential Manager
- robust logging and error handling services

## Key architectural decisions

- Dependency injection is used around the data layer, shell management, and settings
- Persistence is local-first and asynchronous to preserve terminal responsiveness
- Sessions are modeled independently from host metadata so they can recover quickly after reconnects
- Terminal output is separated from connection state so logs and live rendering remain resilient
- Security and credential handling are isolated into dedicated services to minimize accidental leakage

## Runtime flow

1. The Electron main process initializes services and SQLite schema.
2. The renderer loads settings and connection metadata through preload IPC handlers.
3. User actions trigger SSH session creation or SFTP operations.
4. Terminal output is streamed to the xterm.js terminal and persisted to logs.
5. The UI reads state from a lightweight store while connection management remains decoupled from view logic.

## Scalability notes

- Multiple SSH sessions are kept isolated by host ID and tracked independently.
- UI state is intentionally lightweight and does not own connection internals.
- Log storage is append-only for efficient retrieval of terminal activity.
- Services are designed so additional features like port forwarding or broadcast command execution can be integrated without reworking the entire app.
