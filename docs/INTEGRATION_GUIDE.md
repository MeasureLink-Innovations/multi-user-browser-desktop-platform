# Developer Image Integration Guide

This guide explains how to integrate existing developer Docker images (e.g., simulators, frontend environments, or embedded toolchains) into the Multi-User Browser Desktop Platform.

## High-Level Architecture

The platform uses a pool of **Worker Containers** to provide browser-accessible desktops. These workers run an X11 server, a VNC server, and a noVNC proxy. By default, the platform uses a generic Ubuntu-based image, but you can adapt any Linux-based image to serve as a worker.

```
┌──────────────────┐      ┌──────────────────────────┐
│  Web Platform    │      │    Worker Container      │
│  (Orchestrator)  │─────▶│  (Your adapted image)    │
└──────────────────┘      └────────────┬─────────────┘
                                       │
                          ┌────────────┴─────────────┐
                          │  X11 / VNC / noVNC Stack │
                          └────────────┬─────────────┘
                                       │
                          ┌────────────┴─────────────┐
                          │  Your Dev App/Simulator  │
                          └──────────────────────────┘
```

## The "Inheritance and Copy" Pattern

The most flexible way to integrate your image is to use it as a base in a new Dockerfile and copy the runtime stack from the platform's `desktop-runtime`.

### 1. Structure of an Integrated Image

To be compatible with the platform, your image must:
1.  **Expose Port 6080**: For the first monitor's noVNC traffic.
2.  **Expose Port 6081** (Optional): For the second monitor's noVNC traffic.
3.  **Include X11/VNC Dependencies**: Standard packages like `xfce4`, `tigervnc-standalone-server`, and `novnc`.
4.  **Use a Standard Entrypoint**: A script that bootstraps the desktop environment before starting your application.

### 2. Adaptation Steps

#### Step A: Create a Dockerfile
Inherit from your developer image and install the necessary X11 components.

```dockerfile
# Use your existing developer image
FROM your-developer-image:latest

# Install desktop and VNC components
RUN apt-get update && apt-get install -y \
    xfce4 xfce4-goodies \
    tigervnc-standalone-server \
    novnc websockify \
    && rm -rf /var/lib/apt/lists/*

# Set up the worker user (standard across the platform)
RUN useradd -ms /bin/bash worker
WORKDIR /home/worker

# Copy runtime scripts from the platform repository
COPY ./desktop-runtime/entrypoint.sh /home/worker/entrypoint.sh
COPY ./desktop-runtime/xstartup /home/worker/.vnc/xstartup
RUN chmod +x /home/worker/entrypoint.sh /home/worker/.vnc/xstartup

# Ensure permissions
RUN chown -R worker:worker /home/worker

# The platform communicates on 6080 (and 6081 for dual)
EXPOSE 6080 6081

ENTRYPOINT ["/home/worker/entrypoint.sh"]
```

#### Step B: Use the Standard Entrypoint
The platform's `entrypoint.sh` is designed to handle permissions and start the display servers automatically based on environment variables like `MONITOR_COUNT`.

## Multi-Monitor Support

If your developer image needs to show a simulator on one screen and a frontend on another:

1.  **Set `MONITOR_COUNT=2`**: In your `docker-compose.yml` or pool configuration.
2.  **Mapping Displays**:
    -   `DISPLAY=:1`: Primary monitor (accessible at `:6080/vnc.html`)
    -   `DISPLAY=:2`: Secondary monitor (accessible at `:6081/vnc.html`)

You can launch your applications onto specific monitors in your custom startup scripts or by wrapping the command:
`DISPLAY=:2 npm run dev`

## Persistent Data

Ensure your applications save data within `/home/worker/data`. The platform automatically mounts a persistent volume to this path, ensuring that user settings or simulator states are preserved across container restarts.

## Environment Variables

The platform provides several environment variables to your integrated image:

| Variable | Description |
|---|---|
| `MONITOR_COUNT` | Set to `1` or `2`. Controls how many VNC/noVNC servers are started. |
| `DISPLAY` | Set automatically by the runtime. Use `DISPLAY=:1` or `DISPLAY=:2` to target specific virtual monitors. |
| `WORKER_POOL_SIZE` | Used by the web platform to scale the number of available instances. |

## Docker Compose Configuration

To use your custom image in the platform pool, update the `web-platform` service in your `docker-compose.yml` (or your environment variables) to point to your new image tag if you are replacing the default, or configure the pool management logic to use it.

Currently, the pool management in `web-platform/src/lib/pool-management.ts` is hardcoded to use `desktop-worker:latest`. To use a custom image, you can either:

1.  **Re-tag your image**: `docker tag your-custom-image:latest desktop-worker:latest`
2.  **Update the code**: Modify `ensureWorkerPool` to use your custom image tag.

Example `docker-compose.yml` override:

```yaml
services:
  web-platform:
    environment:
      - WORKER_POOL_SIZE=5
      - MONITOR_COUNT=2
```

## Example Implementation

Refer to the `examples/developer-integration/` directory for a full reference implementation including a `Dockerfile` and a custom `entrypoint.sh`.
