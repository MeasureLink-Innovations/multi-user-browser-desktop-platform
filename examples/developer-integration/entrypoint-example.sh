#!/bin/bash
# Reference Entrypoint for Developer Image Integration
# This script wraps the platform's standard entrypoint and launches custom apps.

# 1. Standard Platform Bootstrap
# This handles root permissions, volume chowning, and starting X11/VNC/noVNC.
# We 'source' or call the standard entrypoint in the background or use it as a wrapper.
# Since the standard entrypoint 'execs' into su, we should ideally let it handle the shell.

echo "Starting Developer Integration Bootstrap..."

# 2. Launch Developer Applications
# We use the 'worker' user to launch apps.
# The platform provides MONITOR_COUNT and DISPLAY variables.

launch_apps() {
    # Wait for VNC servers to be ready
    sleep 5
    
    if [ "$MONITOR_COUNT" = "2" ]; then
        echo "Launching dual-monitor layout..."
        # Monitor 1: The Simulator
        DISPLAY=:1 xeyes &
        # Monitor 2: The Frontend Environment
        DISPLAY=:2 xterm -e "echo 'Frontend Environment Running on Monitor 2'; bash" &
    else
        echo "Launching single-monitor layout..."
        DISPLAY=:1 xterm -e "echo 'Developer Image Running'; xeyes" &
    fi
}

# Start app launcher in background
launch_apps &

# 3. Hand over to the standard platform entrypoint
# This keeps the container alive and manages the VNC logs.
exec /home/worker/entrypoint.sh "$@"
