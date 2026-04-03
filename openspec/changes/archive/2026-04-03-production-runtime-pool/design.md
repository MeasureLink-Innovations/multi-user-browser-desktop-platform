## Context

The system currently uses an on-demand container creation model. In production, we need a pre-provisioned pool of containers to ensure immediate availability and enable a model where users "claim" existing resources rather than creating new ones.

## Goals / Non-Goals

**Goals:**
- **Pre-provisioning**: Start a configurable number of containers on system startup.
- **Exclusive Assignment**: Link a container to one or more specific users, blocking all others.
- **Manual Control**: Provide "Restart" and "Release" actions for claimed containers.
- **Health Visibility**: Fetch real-time container status from Docker API when requested.

**Non-Goals:**
- **Auto-scaling**: The pool size is fixed at startup and does not grow/shrink automatically.
- **Automatic Recovery**: Containers are not automatically recreated if they fail; users must restart them.

## Decisions

### 1. Pool Initialization
- **Mechanism**: A startup script or an initialization routine in the web platform will check for the presence of the configured number of containers (e.g., `worker-1`, `worker-2`).
- **Persistence**: These containers will be pre-registered in the `WorkerInstance` table with a new `isPoolMember` flag.

### 2. Claim & Assignment Logic
- **Data Model**: `DesktopSession` will now represent an active assignment between a `User` and a `WorkerInstance` in the pool.
- **Exclusivity**: The `WorkerInstance` table will have a `currentOwnerId` field. If not null, only that user (and admins) can access the desktop route and see the "Open" button.

### 3. Manual Actions
- **Restart**: Uses `docker.getContainer(id).restart()`. This is simpler and faster than full deletion/re-creation for the MVP.
- **Release**: Deletes the `DesktopSession` record and clears the `currentOwnerId` on the `WorkerInstance`.

### 4. Health Checks
- **Method**: The `getPoolStatus` action will be updated to include a call to `container.inspect()` to get the actual `State.Status` from Docker.

### 5. Client-side Interaction & Optimistic UI
- **WorkerCard Component**: Refactor the dashboard worker items into a client component.
- **Optimistic Status**: Use React's `useOptimistic` to immediately reflect state changes (e.g., show "Restarting..." or "Claiming...") before the server action completes.
- **Action Feedback**: Use `useTransition` and `useFormStatus` to handle loading states for individual buttons.
- **Live Updates**: Implement a polling mechanism (e.g., using `useEffect` and `router.refresh()`) to periodically update container health status without full page reloads.

## Risks / Trade-offs

- **[Risk] State Persistence** → Containers in the pool might accumulate "junk" if not properly restarted. *Mitigation*: Encourage users to restart sessions when they encounter issues.
- **[Risk] Fixed Pool Size** → If all sessions are claimed, new users cannot access the platform. *Mitigation*: Admins can force-release sessions.
