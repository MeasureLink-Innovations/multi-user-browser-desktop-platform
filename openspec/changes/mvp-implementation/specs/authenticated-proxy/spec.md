## ADDED Requirements

### Requirement: Path-Based Routing
The system SHALL route traffic from `https://platform.com/desktop/[sessionId]` to the corresponding internal worker on port 6080.

#### Scenario: Routing to Active Worker
- **WHEN** a user requests their specific desktop path
- **THEN** the reverse proxy SHALL forward the traffic to the mapped worker container

### Requirement: Authentication Gate
The reverse proxy SHALL require an authenticated user session for all traffic targeting desktop worker paths.

#### Scenario: Unauthenticated Access Denied
- **WHEN** an unauthenticated request is made to a desktop path
- **THEN** the reverse proxy SHALL return a 403 or 401 error code

#### Scenario: Unauthorized Access Denied
- **WHEN** a user attempts to access a desktop session that does not belong to them
- **THEN** the reverse proxy SHALL return a 403 error code

### Requirement: WebSocket Upgrade
The system SHALL support WebSocket protocol upgrades for VNC traffic passing through the reverse proxy.

#### Scenario: Successful WebSocket Upgrade
- **WHEN** a noVNC client initiates a WebSocket connection through the proxy
- **THEN** the proxy SHALL upgrade the connection and facilitate full-duplex communication with the worker
