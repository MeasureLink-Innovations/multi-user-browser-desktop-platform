## Why

Users require more screen real estate for certain tasks, necessitating the ability to configure specific workers with dual-monitor support. Additionally, workers require persistent local storage to ensure that data and configurations are maintained even if the container is restarted.

## What Changes

- **Worker Display Configuration**: Workers can now be designated as "Single" or "Dual" monitor instances at the infrastructure level.
- **Dual-Monitor Support**: Support for workers to provide two independent virtual displays via noVNC.
- **Per-Worker Persistent Volumes**: Every worker instance in the pool will have a dedicated, persistent Docker volume mounted (e.g., at `/home/worker/data`) to preserve its state.

## Capabilities

### New Capabilities
- (None)

### Modified Capabilities
- **desktop-worker**: Update to support multi-display configuration and persistent volume mounting in the container runtime.
- **runtime-pool-management**: Update to handle the provisioning of workers with specific monitor counts and persistent volumes.

## Impact

- **Worker Image**: Update `desktop-runtime` to handle multiple X displays and VNC servers based on configuration.
- **Database Schema**: Add `displayMode` and `volumeName` to the `WorkerInstance` model.
- **Web Platform**: Update pool management logic to configure Docker containers with the appropriate display settings and volume mounts.
- **Infrastructure**: Storage backend for persistent Docker volumes.
