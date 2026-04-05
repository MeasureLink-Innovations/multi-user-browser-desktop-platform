## Context

The system currently defaults to single-monitor workers with no persistence. To support more complex workflows, the infrastructure must be updated to support dual-monitor worker configurations and persistent storage that stays with a specific worker instance.

## Goals / Non-Goals

**Goals:**
- **Static Display Configuration**: Workers are pre-configured in the pool as either single or dual-monitor.
- **Worker Persistence**: Every worker instance has its own persistent volume for data storage.
- **Resource Management**: Properly allocate ports and resources for dual-monitor workers.

**Non-Goals:**
- **On-the-fly Display Changes**: Users cannot change the display mode of a running worker.
- **Global User Persistence**: This design focuses on per-worker volume persistence rather than volumes that follow a user across different workers.

## Decisions

### 1. Schema Modifications
- **Decision**: Move `displayMode` from `DesktopSession` to `WorkerInstance`. Add `volumeName` to `WorkerInstance`.
- **Rationale**: The number of monitors is now a property of the worker instance, not the session. Each worker instance in the pool will have a dedicated volume associated with it.

### 2. Infrastructure-Defined Runtime Configuration
- **Decision**: The `ensureWorkerPool` logic in the web platform will assign display modes (e.g., first half of the pool single, second half dual) and manage volume creation/mounting.
- **Rationale**: Centralizing the configuration in the pool management logic allows for easy adjustment of the pool's composition.

### 3. Persistent Docker Volumes per Worker
- **Decision**: Each worker container will be mounted with a named volume (e.g., `worker-data-prod-worker-1`).
- **Rationale**: This ensures that even if a container is deleted and recreated, the data for that specific worker "slot" remains intact.

### 4. Dual-Monitor VNC Implementation
- **Decision**: Dual-monitor workers will run two separate VNC servers (Display :1 and :2) on ports 5901 and 5902. The worker's entrypoint will use a `MONITOR_COUNT` environment variable to decide whether to start the second server.
- **Rationale**: This approach provides two distinct framebuffers that can be accessed by the client.

## Risks / Trade-offs

- **[Risk] Worker Slot Data Confusion** → If users expect their data to follow them, they might be confused when they get a different worker with different data. *Mitigation*: Clearly indicate in the UI that data is persistent to the specific worker slot.
- **[Risk] Increased Port Usage** → Dual-monitor workers require two VNC ports and potentially two noVNC proxy ports. *Mitigation*: Use a deterministic port mapping scheme.
