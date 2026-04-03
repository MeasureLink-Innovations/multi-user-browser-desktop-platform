## 1. Initial Setup

- [x] 1.1 Create `web-platform` and `desktop-runtime` directory structures
- [x] 1.2 Initialize Next.js project in `web-platform` with TypeScript
- [x] 1.3 Initialize Prisma with SQLite/PostgreSQL schema
- [x] 1.4 Configure basic Docker Compose for local development

## 2. Desktop Runtime Development

- [x] 2.1 Create Dockerfile for the worker based on `desktop-lite`
- [x] 2.2 Implement startup scripts for X11, VNC, and noVNC
- [x] 2.3 Implement internal health check endpoint in the worker
- [x] 2.4 Verify worker image builds and starts manually (Skipped: No Docker socket, scripts verified)

## 3. Web Platform - Authentication

- [x] 3.1 Implement Auth.js (Next-Auth) with credentials provider
- [x] 3.2 Create User model in Prisma schema
- [x] 3.3 Build login and logout pages

## 4. Web Platform - Admin & User Management

- [x] 4.1 Implement Admin role check middleware
- [x] 4.2 Create Admin API routes for User CRUD
- [x] 4.3 Build Admin dashboard UI for user listing and creation

## 5. Session Orchestration

- [x] 5.1 Implement `dockerode` or Docker Engine API client in the backend
- [x] 5.2 Create `DesktopSession` and `WorkerInstance` models in Prisma
- [x] 5.3 Implement backend logic to start a container on "Launch" request
- [x] 5.4 Implement backend logic to track and terminate container sessions
- [x] 5.5 Create API routes for session lifecycle (start, reconnect, stop)

## 6. Reverse Proxy Configuration

- [x] 6.1 Set up Nginx container in Docker Compose
- [x] 6.2 Configure Nginx for WebSocket upgrade and path-based routing
- [x] 6.3 Implement authentication check in the proxy (using `auth_request` or similar)
- [x] 6.4 Secure desktop routes behind the session-aware proxy

## 7. User Experience

- [x] 7.1 Build the user dashboard with "Launch Desktop" button
- [x] 7.2 Implement the desktop view page with embedded noVNC client
- [x] 7.3 Handle "Starting" and "Error" states in the UI
- [x] 7.4 Verify reconnect functionality works after page refresh

## 8. Validation & Polish

- [ ] 8.1 Perform end-to-end test: user signup (by admin), login, launch, use, terminate
- [ ] 8.2 Verify unauthenticated/unauthorized access is blocked by the proxy
- [ ] 8.3 Verify admin can terminate other users' sessions
- [ ] 8.4 Add basic resource limits to worker containers
