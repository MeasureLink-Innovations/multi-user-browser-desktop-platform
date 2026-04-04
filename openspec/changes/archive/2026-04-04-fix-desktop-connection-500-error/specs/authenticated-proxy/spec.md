## MODIFIED Requirements

### Requirement: Path-Based Routing
The system SHALL route traffic from `https://platform.com/desktop/[sessionId]` to the corresponding internal worker on port 6080 by dynamically resolving the session ID through the authentication subrequest service.

#### Scenario: Routing to Active Worker
- **WHEN** a user requests their specific desktop path
- **THEN** the reverse proxy SHALL query the authentication service with the session context and forward the traffic to the returned internal worker hostname
