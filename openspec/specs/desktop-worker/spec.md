## ADDED Requirements

### Requirement: Desktop Image Startup
The desktop worker SHALL start an X11 display server, a VNC server, and noVNC/websockify upon container launch.

#### Scenario: Successful Worker Startup
- **WHEN** the container is started
- **THEN** the noVNC interface SHALL be accessible on port 6080 within the internal network

### Requirement: Health Reporting
The desktop worker SHALL provide a health check endpoint for the orchestration layer to monitor its status.

#### Scenario: Worker Health Check
- **WHEN** the orchestrator polls the worker's health endpoint
- **THEN** the worker SHALL return a "ready" status once the desktop stack is fully initialized
