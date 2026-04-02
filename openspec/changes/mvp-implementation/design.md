# Design: MVP Implementation

## Context

The Multi-User Browser Desktop Demo Platform requires a secure, scalable orchestration layer and an isolated runtime environment. The current state is a set of requirements in `prd.md`. The primary constraint is the architectural split between management and execution.

## Goals / Non-Goals

**Goals:**
- **Single Entry Point**: All user and desktop traffic flows through a single domain over HTTPS.
- **Dynamic Orchestration**: Automated lifecycle management of Docker-based worker containers.
- **Secure Access**: Desktop sessions are only accessible to the authenticated owner.
- **Admin Visibility**: Centralized dashboard for managing users and tracking active workers.

**Non-Goals:**
- **Kubernetes**: Not required for MVP; Docker Compose/Docker Engine is sufficient.
- **Persistent Storage**: User files will not persist across session terminations in the MVP.
- **Dual-Display**: Hooks will be provided in the contract, but implementation is deferred.

## Decisions

### 1. Technology Stack
- **Web Platform**: Next.js (App Router) with TypeScript.
  - *Rationale*: Unified development for frontend and API routes; excellent SSR for admin pages.
  - *Alternatives*: Express + React SPA (more complex build setup).
- **Authentication**: Auth.js (Next-Auth) with credentials provider.
  - *Rationale*: Standard, secure, and deeply integrated with Next.js.
- **Database**: Prisma ORM with SQLite (for demo) or PostgreSQL.
- **Reverse Proxy**: Nginx with WebSocket support.
  - *Rationale*: High-performance, industry-standard for WebSocket proxying.

### 2. Desktop Orchestration
- **Mechanism**: The Next.js backend will communicate with the Docker Engine API via `/var/run/docker.sock`.
- **Worker Image**: Custom image based on `desktop-lite` (noVNC/VNC/X11).
- **Network**: A dedicated Docker bridge network for internal communication between the web backend, proxy, and workers.

### 3. Session Routing
- **Pattern**: Path-based routing via Nginx.
  - *Flow*: `https://platform.com/desktop/[sessionId]` -> Nginx -> Authentication Check -> Internal Worker IP:6080.
  - *Security*: Nginx will use `auth_request` to verify the user's session with the Next.js backend before forwarding traffic to the worker.

## Risks / Trade-offs

- **[Risk] Docker Socket Exposure** → *Mitigation*: The backend container will have restricted access, and the platform is intended for demo/controlled environments. In production, a thin "Worker Manager" service would abstract the socket.
- **[Risk] Resource Exhaustion** → *Mitigation*: Implement basic limits on the number of concurrent containers and CPU/Memory per worker.
- **[Risk] WebSocket Latency** → *Mitigation*: Optimize noVNC compression settings and ensure low-latency networking between proxy and workers.

## Open Questions

- Should we use a subdomain-based routing (e.g., `user1.platform.com`) instead of path-based? Path-based is easier for a single-cert demo.
- Will we use a pre-built `desktop-lite` image or build a custom one for the MVP? Decision: Custom image to ensure health check scripts are included.
