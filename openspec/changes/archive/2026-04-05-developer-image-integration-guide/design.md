## Context

Many teams have existing developer images that include simulators, IDEs, or specific toolchains. To make these accessible for usability testing or non-developer review, they need to be integrated with the `multi-user-browser-desktop-platform`. This requires a standardized approach to adding the X11/VNC/noVNC stack to these images without breaking their existing functionality.

## Goals / Non-Goals

**Goals:**
- **Standardized Integration**: Define a pattern (e.g., a "Runtime Layer") that can be added to any Docker image.
- **Support for Multi-Monitor**: Enable simulators and frontends to run side-by-side in dual-monitor mode.
- **Portability**: Ensure the VNC/noVNC logic is not hardcoded to a specific OS base (though Ubuntu is the primary target).
- **Clear Examples**: Provide a "Reference Implementation" for an embedded system simulator.

**Non-Goals:**
- **OS Support beyond Linux**: The solution will only target Linux-based Docker images.
- **Automated Image Conversion**: We will not provide a script to automatically convert images; we provide documentation and base building blocks.

## Decisions

### 1. Integration Method: Multi-Stage Build or Inheritance
- **Decision**: Recommend the "Inheritance and Copy" pattern. Users start `FROM` their developer image and `COPY` the necessary scripts from `desktop-runtime`.
- **Rationale**: This is the most flexible approach for diverse base images. It allows the platform to maintain the "Runtime Stack" independently of the application image.

### 2. Standardized Entrypoint Bootstrap
- **Decision**: Provide a `bootstrap.sh` script that handles root permissions, `chown` of `/home/worker/data`, and the startup of VNC/noVNC.
- **Rationale**: Simplifies the integration for users, as they only need to call this script in their own entrypoint.

### 3. Simulator + Frontend Mapping
- **Decision**: Use `DISPLAY=:1` for the simulator and `DISPLAY=:2` for the frontend in dual-monitor mode.
- **Rationale**: Follows standard X11 conventions and allows the platform's proxy to correctly map to individual displays.

## Risks / Trade-offs

- **[Risk] Library Conflicts** → Developer images might have conflicting versions of X11 or VNC libraries. *Mitigation*: Recommend using static binaries or a isolated layer for the runtime stack where possible.
- **[Risk] Resource Usage** → Running multiple X servers and a simulator in a single container can be resource-intensive. *Mitigation*: Document recommended resource limits for dual-monitor workers.
