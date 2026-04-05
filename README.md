# Multi-User Browser Desktop Platform

This platform allows multiple users to access isolated Linux desktop environments through a web browser.

## Features

- **Authenticated Access**: Secure login and session management.
- **Worker Pool**: Automated provisioning of desktop containers.
- **Multi-Monitor Support**: Support for dual virtual monitors per session.
- **Persistent Storage**: Dedicated volumes for each worker instance.
- **Developer Image Integration**: Easily adapt existing simulator or dev images.

## Documentation

- [Project PRD](./prd.md)
- [Developer Image Integration Guide](./docs/INTEGRATION_GUIDE.md)

## Getting Started

1.  **Build the worker image**:
    `docker build -t desktop-worker:latest ./desktop-runtime`
2.  **Start the platform**:
    `docker compose up -d`
3.  **Access the web interface**:
    Navigate to `http://localhost`
