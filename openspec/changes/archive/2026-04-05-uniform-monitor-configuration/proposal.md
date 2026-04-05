# Proposal: Uniform Monitor Configuration

## Why

Currently, the `MONITOR_COUNT` for each worker is calculated at runtime within the `web-platform` code (a "half-and-half" split), which hides the infrastructure configuration from the orchestration layer. Moving this to environment variables in `docker-compose.yml` makes the pool's "shape" explicit, simplifies the logic, and ensures consistency across all workers sharing the same image.

## What Changes

- **Infrastructure**: Add `MONITOR_COUNT` to the `web-platform` service in `docker-compose.yml`.
- **Pool Management**: Update `ensureWorkerPool` in `web-platform/src/lib/pool-management.ts` to use `process.env.MONITOR_COUNT` for all workers.
- **Database Schema**: Sync the `displayMode` field in the `WorkerInstance` table with the uniform `MONITOR_COUNT` setting.
- **Documentation**: Include an architectural diagram in `prd.md` to visualize the flow of configuration from environment to containers.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `runtime-pool-management`: Update to support uniform configuration via environment variables instead of hardcoded runtime logic.
- `desktop-worker`: Ensure worker instances correctly receive and apply the `MONITOR_COUNT` from the central orchestration layer.

## Impact

- **Configuration**: Centralizes infrastructure decisions in `docker-compose.yml` and `.env`.
- **Maintainability**: Simplifies `ensureWorkerPool` by removing conditional "mix" logic.
- **Clarity**: Makes the pool configuration visible to operators without reading application code.
