## ADDED Requirements

### Requirement: Launch Desktop Session
The system SHALL allow a logged-in user to launch a desktop session.

#### Scenario: New Session Request
- **WHEN** a user clicks the "Launch Desktop" button
- **THEN** the system SHALL start a new Docker container for that user and record the session mapping

### Requirement: Reconnect to Active Session
The system SHALL allow a user to reconnect to their existing active desktop session.

#### Scenario: Reconnect Request
- **WHEN** a user with an active session requests a desktop view
- **THEN** the system SHALL identify the existing container and return the session connection details

### Requirement: Terminate Session
The system SHALL allow users and administrators to terminate a desktop session.

#### Scenario: User Terminates Session
- **WHEN** a user clicks "End Session"
- **THEN** the system SHALL stop and remove the associated Docker container and mark the session as stopped

#### Scenario: Admin Terminates Session
- **WHEN** an admin force-stops a session from the admin dashboard
- **THEN** the system SHALL stop and remove the container and revoke user access to the session
