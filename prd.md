# Product Requirements Document

## Product name
Multi-User Browser Desktop Demo Platform

## Overview
This product is a demo platform that allows multiple authenticated users to access browser-hosted Linux desktop environments backed by containers. The platform uses a standard web application for authentication, authorization, user management, and session orchestration, while desktop environments are provided by isolated container workers based on `desktop-lite`, noVNC, VNC, and websockify.

The system must be structured so that web hosting and application delivery can live in a separate repository from the desktop runtime images and worker startup logic. The public-facing application is the system of record for users, roles, permissions, and session routing; the desktop containers are internal execution targets rather than the primary application surface.

## Goals
- Provide a working multi-user demo where users can sign in and launch a browser-accessible desktop session.
- Separate concerns between the web platform repository and the desktop runtime repository.
- Support user management with roles, session tracking, and access control.
- Make the architecture production-oriented enough to evolve beyond a demo.
- Avoid exposing raw VNC and noVNC ports directly to end users; all access should flow through the authenticated web application and reverse proxy layer.

## Non-goals
- Building a full enterprise-grade VDI product.
- Supporting arbitrary horizontal autoscaling in the first version.
- Providing persistent personal workspaces across long periods unless explicitly added later.
- Implementing collaborative multi-cursor editing or real-time conflict resolution inside shared desktops.

## Users and roles
### Primary users
- Demo users who need browser access to a prepared Linux desktop.
- Administrators who manage users, roles, and active sessions.
- Operators who monitor worker health and container lifecycle.

### Roles
- **Admin**: can manage users, assign roles, inspect sessions, terminate sessions, and access all desktops.
- **Standard user**: can log in, launch an assigned desktop session, reconnect to an active session, and log out.
- **Viewer**: optional role for read-only access to a shared demo desktop, if implemented in a later phase.

## Core product concept
The product consists of two repositories:

| Repository | Purpose |
|---|---|
| `web-platform` | Hosts the frontend and backend for login, user management, session orchestration, routing, and proxy-aware desktop access. |
| `desktop-runtime` | Contains container images, startup scripts, `desktop-lite` integration, application installation, optional multi-display support, and healthchecks. |

The coding agent should treat this split as a hard architectural boundary. The web repository must not embed worker image logic beyond configuration and API contracts; the runtime repository must not own user accounts or business logic.

## Functional requirements
### 1. Authentication
- The system must provide login for multiple users through the web application.
- The backend must maintain authenticated sessions using either secure server-side sessions or signed JWT-based flows.
- Unauthenticated users must not be able to access desktop session URLs, noVNC endpoints, or internal proxy routes.[cite:38][cite:41]
- Logout must immediately invalidate access to protected desktop views.

### 2. User management
- Admins must be able to create, update, deactivate, and delete users.
- Admins must be able to assign at least `admin` and `standard_user` roles.
- The system must store user status, role, created date, and last login timestamp.
- Passwords must be stored securely using a modern password hashing algorithm.

### 3. Desktop session lifecycle
- A standard user must be able to click a button such as `Launch desktop` after login.
- The backend must either allocate a worker from a pool or start a new worker container for that user session.
- The backend must persist a mapping between user, session, worker identifier, internal desktop target, and session state.
- A user with an active session must be able to reconnect without creating duplicate workers unless the configured policy explicitly allows more than one active session.
- Admins must be able to terminate any active session.
- Sessions must have configurable idle timeout and maximum lifetime.

### 4. Desktop access experience
- The user must access the desktop through the main web application domain over HTTPS.
- The desktop UI may be embedded in an iframe or opened in a dedicated protected route, depending on browser and proxy constraints.
- The system must not require end users to know raw port numbers or internal container addresses.
- The UI must display session status such as `starting`, `ready`, `stopped`, or `expired`.

### 5. Reverse proxy and routing
- A reverse proxy must sit in front of the public application and desktop transport paths.
- The proxy must support WebSocket upgrade handling for noVNC/websockify traffic.
- Desktop traffic must be routed by authenticated session context rather than by public static port exposure whenever possible.
- The implementation may use path-based routing, token-based routing, or backend-mediated signed session routes.

### 6. Desktop worker behavior
- Desktop workers must be containerized and based on `desktop-lite` or an equivalent image that provides a browser-accessible desktop foundation.
- Each worker must start the desktop stack automatically, including X display, VNC server, and noVNC/websockify plumbing, either directly or through inherited `desktop-lite` scripts.
- Workers must expose health information that the web backend can poll or receive.
- Workers must support preinstalled demo applications defined in the runtime repository.

### 7. Optional multi-display mode
- The runtime should be designed so that one worker can optionally expose two separate virtual displays, each mapped to a different internal VNC/noVNC endpoint.
- This mode is intended for demo scenarios with many open applications, not as the default requirement.
- The web platform may initially expose only one desktop per user, but the API and worker contract should leave room for future support of `display-1` and `display-2` targets.
- Applications in the worker may be launched on a specific display through `DISPLAY=:1` and `DISPLAY=:2` conventions.

### 8. Admin operations
- Admins must be able to view all active desktop sessions in an admin dashboard.
- Admins must be able to inspect which worker is assigned to which user.
- Admins must be able to force-stop a worker and revoke user access.
- Admins should be able to see basic health indicators such as session age, last activity, and worker status.

## Recommended technical architecture
### Web platform repository
Suggested stack:
- Frontend: React or Next.js.
- Backend: Node.js with Express or Next.js server routes.
- Database: PostgreSQL for users, roles, and session metadata.
- Cache/queue: Redis optional for session coordination and worker startup signaling.
- Reverse proxy: Nginx or Traefik with WebSocket support.

### Desktop runtime repository
Suggested contents:
- Dockerfile for worker image.
- Startup scripts for desktop initialization.
- Optional scripts for second display initialization.
- Healthcheck scripts.
- App installation scripts.
- Image tagging and release process.

### Integration flow
1. User logs into the web platform.
2. User requests a desktop session.
3. Backend creates or assigns a worker.
4. Backend records session metadata in the database.
5. Backend returns a protected route or signed token for desktop access.
6. Reverse proxy forwards authenticated WebSocket and HTTP traffic to the correct worker target.[cite:36][cite:38][cite:41]

## Data model
Minimum entities:

### User
- `id`
- `email`
- `password_hash`
- `role`
- `status`
- `created_at`
- `updated_at`
- `last_login_at`

### DesktopSession
- `id`
- `user_id`
- `worker_id`
- `status` (`starting`, `ready`, `stopped`, `expired`, `failed`)
- `access_token` or `route_key`
- `started_at`
- `last_activity_at`
- `expires_at`
- `display_mode` (`single`, `dual`)

### WorkerInstance
- `id`
- `image_tag`
- `container_name`
- `internal_host`
- `display_1_target`
- `display_2_target` (nullable)
- `health_status`
- `created_at`
- `terminated_at`

## API requirements
Minimum API surface:

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### User admin
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PATCH /api/admin/users/:id`
- `DELETE /api/admin/users/:id`

### Sessions
- `POST /api/sessions`
- `GET /api/sessions/me`
- `DELETE /api/sessions/:id`
- `POST /api/sessions/:id/reconnect`

### Admin sessions
- `GET /api/admin/sessions`
- `DELETE /api/admin/sessions/:id/terminate`

### Internal worker control
- `POST /internal/workers/start`
- `POST /internal/workers/stop`
- `GET /internal/workers/:id/health`

## UI requirements
### User-facing screens
- Login page.
- Desktop launch page.
- Active session page with embedded or linked desktop client.
- Session state and error display.

### Admin screens
- User list with role management.
- Session list with filters.
- Worker health/status page.

### UX expectations
- Clear indication when a desktop is starting, which may take several seconds.
- Reconnect flow if the browser is refreshed.
- Graceful error messages if worker startup fails.
- Explicit warning before terminating an active session.

## Security requirements
- All public access must be served over HTTPS.
- The reverse proxy must correctly handle WebSocket upgrades for noVNC/websockify traffic.
- Internal VNC/noVNC ports should not be publicly exposed directly when avoidable.
- Desktop access routes must be gated by validated session state and user authorization.
- Session tokens must be time-limited and unguessable if token-based routing is used.
- Passwords must be hashed and never stored in plain text.
- Audit logging should capture login events, session starts, and admin terminations.

## Deployment requirements
- The coding agent should produce a local development setup using Docker Compose.
- The system should be deployable later to a VM or container hosting platform with a reverse proxy.
- Configuration must be environment-driven via `.env` files or secret injection.
- The architecture must support keeping the public hosting repository separate from the desktop runtime repository.

## MVP scope
The first deliverable should include:
- Multi-user login.
- Admin user management.
- One desktop session per standard user.
- One worker container per active user session.
- Authenticated desktop access through the web app.
- Reverse proxy support for WebSocket traffic.
- Basic admin visibility into active sessions.

The first deliverable should not require:
- Billing.
- SSO.
- Kubernetes.
- Fine-grained RBAC beyond basic roles.
- Persistent volumes per user unless needed for the demo.

## Success criteria
- An admin can create users and assign roles.
- A standard user can sign in and launch a desktop in the browser.
- Desktop access is blocked for unauthenticated users.
- A user can refresh the page and reconnect to the same active session.
- An admin can view and terminate active sessions.
- The public surface is delivered from the web platform, while desktop runtime details remain encapsulated in a separate repository.

## Open decisions for the coding agent
The coding agent should explicitly decide and document the following during implementation:
- Whether to use Express or Next.js full-stack.
- Whether to use cookie sessions or JWT plus server-side session records.
- Whether to embed the desktop in an iframe or open it in a protected dedicated page.
- Whether worker assignment is `start on demand` or `reserve from pool`.
- Whether the initial MVP includes optional dual-display support or leaves only the contract hooks in place.

## Implementation notes
- Prefer clean internal contracts between `web-platform` and `desktop-runtime`, such as a worker management API or a thin orchestration service.
- Keep noVNC and worker networking behind the proxy boundary instead of exposing per-user public ports.
- Treat `desktop-lite` as a worker building block, not as the product's authentication layer.
- Design for observability early: session logs, worker health, and admin traceability will be important even in the demo phase.
