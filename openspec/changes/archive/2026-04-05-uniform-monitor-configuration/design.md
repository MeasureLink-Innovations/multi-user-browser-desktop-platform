## Context

The system currently uses a "half-and-half" logic in `ensureWorkerPool` to assign either 1 or 2 monitors to worker instances in the pool. This calculation is hardcoded in the application layer, making it difficult to adjust the pool's configuration without changing code. Furthermore, as only one worker image is used, it's more predictable to have a uniform pool configuration defined at the infrastructure level.

## Goals / Non-Goals

**Goals:**
- **Centralized Configuration**: Move the source of truth for `MONITOR_COUNT` to `docker-compose.yml`.
- **Uniform Pool**: Ensure every worker in the pool has the same display configuration.
- **Code Simplification**: Remove the runtime split logic from `ensureWorkerPool`.
- **Documentation**: Visualize the configuration flow in the project's PRD.

**Non-Goals:**
- **Dynamic Per-User Monitors**: This change does not aim to allow users to choose monitor counts; it's about pool-wide infrastructure settings.
- **Image Changes**: We will continue using the single `desktop-worker:latest` image.

## Decisions

### 1. Environment-Driven Configuration
- **Decision**: Define `MONITOR_COUNT` as an environment variable for the `web-platform` service in `docker-compose.yml`.
- **Rationale**: This follows the 12-factor app principle of storing configuration in the environment. It makes the infrastructure's intent explicit and easily adjustable.

### 2. Unified Worker Creation
- **Decision**: Update `ensureWorkerPool` to read `process.env.MONITOR_COUNT` once and apply it to all containers it manages.
- **Rationale**: Simplifies the loop logic and ensures that the entire pool is consistent with the infrastructure definition.

### 3. Database Syncing
- **Decision**: Derive `displayMode` ("single" or "dual") from `MONITOR_COUNT` (1 or 2) during the upsert into the `WorkerInstance` table.
- **Rationale**: Keeps the application's view of the worker (used for UI display) in sync with the actual container runtime configuration.

## Risks / Trade-offs

- **[Risk] Missing Env Var** → If `MONITOR_COUNT` is not set in the environment, the pool might fail or use an inconsistent default. *Mitigation*: Provide a sensible default (e.g., "1") in the code and document it in the PRD.
- **[Risk] Existing Stale Containers** → If the `MONITOR_COUNT` is changed in `docker-compose`, existing containers in the pool won't automatically update until recreated. *Mitigation*: The `ensureWorkerPool` logic should ideally detect configuration drift, or we simply document that a `docker compose down && docker compose up` (or manual container deletion) is required for changes to take effect.
