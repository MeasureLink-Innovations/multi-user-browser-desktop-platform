# Proposal: MVP Implementation

## Why

This change implements the MVP for the Multi-User Browser Desktop Demo Platform. It establishes a production-oriented architecture with a clear separation between the web orchestration layer and the containerized desktop runtime, solving the problem of providing secure, multi-user browser access to isolated Linux environments.

## What Changes

- **Web Platform**: Implementation of a full-stack web application (Node.js/Next.js) for authentication, user management, and session tracking.
- **Desktop Runtime**: Creation of containerized worker images based on `desktop-lite` with VNC/noVNC support.
- **Session Lifecycle**: Automated provisioning and deprovisioning of desktop containers per user session.
- **Reverse Proxy**: Configuration of a secure gateway (e.g., Nginx) to handle authenticated WebSocket and HTTP traffic to workers.
- **Admin Dashboard**: Interfaces for managing users, roles, and monitoring active desktop sessions.

## Capabilities

### New Capabilities
- `user-authentication`: Secure login/logout and session persistence using modern standards.
- `user-management`: Admin-only CRUD operations for users and assignment of roles (Admin, Standard User).
- `session-orchestration`: Backend logic to start, track, and terminate worker containers based on user requests.
- `desktop-worker`: Containerized desktop image with noVNC and health check reporting.
- `authenticated-proxy`: Secure routing layer that gates desktop access behind authenticated sessions.

### Modified Capabilities
- None (Initial implementation).

## Impact

- **Architecture**: Defines the hard boundary between the `web-platform` and `desktop-runtime` repositories/directories.
- **API**: Establishes the contract for worker control and health monitoring.
- **Security**: Centralizes all access through an authenticated reverse proxy, eliminating public exposure of internal VNC ports.
