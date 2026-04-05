## Why

Currently, the `multi-user-browser-desktop-platform` is focused on its own internal worker image. This change aims to provide clear documentation and examples for integrating existing developer images (e.g., for embedded systems, simulators, or custom frontend environments) into the platform. This enables non-developers, such as QA or usability testers, to easily access and interact with complex development environments through a standard web browser.

## What Changes

- **Documentation**: Add a comprehensive guide on how to adapt an existing Docker image to work with the `desktop-runtime` stack.
- **Examples**: Provide a reference `Dockerfile` and `entrypoint.sh` example that demonstrates inheriting from a developer image and adding VNC/noVNC support.
- **Multi-Monitor Support**: Document how to configure and use dual virtual monitors for images that run both a simulator and a frontend simultaneously.
- **Integration**: Explain how to update the `web-platform` configuration to use these custom images in the worker pool.

## Capabilities

### New Capabilities
- `developer-image-integration`: Requirements for how external developer images must be adapted to be compatible with the platform's orchestration and proxy layers.

### Modified Capabilities
- `desktop-worker`: Update requirements to explicitly support being a "base" for external image integration, ensuring the VNC/noVNC stack is portable.
- `runtime-pool-management`: Update to reflect that the pool can be configured with heterogeneous or custom images beyond the default `desktop-worker:latest`.

## Impact

- **Documentation**: New integration guides and README updates.
- **Runtime**: Potential refactoring of `desktop-runtime` scripts to be more easily "includable" or "inherited" in other Dockerfiles.
- **Configuration**: Changes to `docker-compose.yml` or `.env` to support custom image tags per pool member if needed.
