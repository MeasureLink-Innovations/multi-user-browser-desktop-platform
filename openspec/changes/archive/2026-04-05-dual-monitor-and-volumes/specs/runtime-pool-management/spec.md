## MODIFIED Requirements

### Requirement: Configurable Startup Pool
The system SHALL provision a number of worker containers at startup as defined by the `WORKER_POOL_SIZE` environment variable, ensuring that each worker is assigned a display mode (single or dual) and a persistent Docker volume.

#### Scenario: Startup Provisioning with Mix of Workers
- **WHEN** the platform starts
- **THEN** it SHALL ensure the configured number of containers are running with correct monitor settings and volumes

### Requirement: Manual Container Restart
The system SHALL allow a user who has claimed a container to manually trigger its restart, preserving the container's volume mount.

#### Scenario: User Restarts Container
- **WHEN** a user clicks "Restart" on their assigned runtime
- **THEN** the system SHALL stop and start the Docker container while keeping the same persistent volume attached
