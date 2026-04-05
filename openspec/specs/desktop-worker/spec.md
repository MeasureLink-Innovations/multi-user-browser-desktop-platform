## ADDED Requirements

### Requirement: Desktop Image Startup
The desktop worker SHALL start an X11 display server, a VNC server, and noVNC/websockify upon container launch. For dual-monitor workers, the worker SHALL start a second X11 display server and VNC server on an additional port.

#### Scenario: Successful Single Worker Startup
- **WHEN** a single-monitor container is started
- **THEN** the noVNC interface SHALL be accessible on port 6080

#### Scenario: Successful Dual Worker Startup
- **WHEN** a dual-monitor container is started
- **THEN** two noVNC interfaces (or a combined interface) SHALL be accessible, providing two independent display framebuffers

### Requirement: Persistent Storage Mount
The desktop worker SHALL have a persistent Docker volume mounted to a predefined path (e.g., `/home/worker/data`) to preserve user data and configurations across container lifecycles.

#### Scenario: Data Persistence
- **WHEN** a user saves a file in the mounted volume and the container is restarted
- **THEN** the file SHALL still be present in the volume after the restart

### Requirement: Health Reporting
The desktop worker SHALL provide a health check endpoint for the orchestration layer to monitor its status.

#### Scenario: Worker Health Check
- **WHEN** the orchestrator polls the worker's health endpoint
- **THEN** the worker SHALL return a "ready" status once the desktop stack is fully initialized
