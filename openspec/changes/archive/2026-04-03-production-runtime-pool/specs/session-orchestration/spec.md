## MODIFIED Requirements

### Requirement: Claim Desktop Session
The system SHALL allow a logged-in user to claim an available desktop session from the pre-provisioned pool.

#### Scenario: Claiming a Session
- **WHEN** a user clicks "Claim" on an available runtime
- **THEN** the system SHALL assign that user to the container and mark it as unavailable to others

### Requirement: Release Desktop Session
The system SHALL allow a user or administrator to release a claimed desktop session back to the pool.

#### Scenario: User Releases Session
- **WHEN** a user clicks "Release Session"
- **THEN** the system SHALL remove the user assignment from the container and mark it as available for others

#### Scenario: Admin Releases Session
- **WHEN** an admin force-releases a session from the admin dashboard
- **THEN** the system SHALL clear the user assignment and make the runtime available to all users

### Requirement: Exclusive Session Access
The system SHALL enforce exclusive access to a desktop session for its assigned owner.

#### Scenario: Unauthorized Access Attempt
- **WHEN** a user attempts to access a desktop path for a session assigned to someone else
- **THEN** the proxy SHALL return a 403 Forbidden error
