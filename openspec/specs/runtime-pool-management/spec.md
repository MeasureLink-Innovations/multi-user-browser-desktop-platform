## ADDED Requirements

### Requirement: Configurable Startup Pool
The system SHALL provision a number of worker containers at startup as defined by the `WORKER_POOL_SIZE` environment variable, ensuring that each worker is assigned a display mode (single or dual) and a persistent Docker volume.

#### Scenario: Startup Provisioning with Mix of Workers
- **WHEN** the platform starts
- **THEN** it SHALL ensure the configured number of containers are running with correct monitor settings and volumes

### Requirement: Uniform Worker Configuration
The system SHALL configure all workers in the pool with a uniform monitor count as defined by the `MONITOR_COUNT` environment variable.

#### Scenario: Uniform Monitor Configuration
- **WHEN** the pool is initialized or updated
- **THEN** every worker container SHALL be created with the same `MONITOR_COUNT` environment variable and its corresponding `displayMode` SHALL be persisted in the database

### Requirement: Manual Container Restart
The system SHALL allow a user who has claimed a container to manually trigger its restart, preserving the container's volume mount.

#### Scenario: User Restarts Container
- **WHEN** a user clicks "Restart" on their assigned runtime
- **THEN** the system SHALL stop and start the Docker container while keeping the same persistent volume attached

### Requirement: On-Demand Health Reporting
The system SHALL retrieve and display the current health status of pool containers when the dashboard is accessed.

#### Scenario: Viewing Container Health
- **WHEN** a user loads the dashboard
- **THEN** the system SHALL query the Docker API for the status of each container and display it (e.g., Running, Unhealthy, Stopped)
