## ADDED Requirements

### Requirement: Admin Create User
The system SHALL allow an administrator to create new users with a specified email, password, and role.

#### Scenario: Successful User Creation
- **WHEN** an admin submits valid user details
- **THEN** the system SHALL create the user and add them to the database

### Requirement: Admin List Users
The system SHALL provide a view for administrators to list all registered users and their roles.

#### Scenario: Viewing User List
- **WHEN** an admin accesses the user management page
- **THEN** the system SHALL display a table of all users with their email, role, and status

### Requirement: Role Assignment
The system SHALL support at least two roles: `Admin` and `Standard User`.

#### Scenario: Assigning a Role
- **WHEN** an admin updates a user's role
- **THEN** the system SHALL persist the change and apply corresponding permissions
