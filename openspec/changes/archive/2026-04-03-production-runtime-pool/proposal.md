## Why

The current implementation creates desktop containers on-demand, which can lead to high latency during first-time launch and lacks the management features required for a production environment. This change introduces a pre-provisioned runtime pool where a configurable number of instances are started before users arrive, enabling instant access and strict exclusive ownership logic.

## What Changes

- **Configurable Pre-provisioned Pool**: The system will start a set number of worker containers (configured via environment variables) at startup.
- **Session Assignment**: Users will view all runtimes in the pool on the dashboard and can assign themselves to one or more.
- **Exclusive Access**: Once a user claims a session, other users are blocked from joining until it is released by the owner or an admin.
- **Manual Restart Capability**: Users can manually trigger a restart of their assigned container if they perceive it to be unhealthy.
- **Health Visibility**: The system will display the current health status of each container on the dashboard (checked on-demand).
- **Release Logic**: Users can "release" a session to return it to the available pool.
- **Optimistic UI & Real-time Feedback**: Dashboard actions (Claim, Restart, Release) will provide immediate visual feedback using optimistic updates and loading states to mask network/server latency.

## Capabilities

### New Capabilities
- `runtime-pool-management`: Logic to provision a configurable number of containers and manage their state (claim, restart, release).

### Modified Capabilities
- `session-orchestration`: Change from on-demand container creation to a claim/restart/release model based on the pre-provisioned pool.

## Impact

- **Database**: Schema updates to `DesktopSession` and `WorkerInstance` to handle persistence of pool assignments and locks.
- **Orchestration**: Shift from dynamic `docker.createContainer` to managing a pre-existing pool of named containers.
- **UI**: Dashboard update to list the entire runtime pool and their assignment/health status.
