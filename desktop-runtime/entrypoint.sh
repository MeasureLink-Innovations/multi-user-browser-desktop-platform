#!/bin/bash

# If we are root, fix permissions and restart as worker user
if [ "$(id -u)" = '0' ]; then
    echo "Running as root, fixing permissions on /home/worker/data..."
    mkdir -p /home/worker/data
    chown -R worker:worker /home/worker
    # Use 'exec' to replace the root process with the worker process
    exec su worker "$0" -- "$@"
fi

# Everything below here runs as the 'worker' user

# Ensure VNC directory exists
mkdir -p /home/worker/.vnc

# Set up xstartup
cp /home/worker/xstartup /home/worker/.vnc/xstartup
chmod +x /home/worker/.vnc/xstartup

# Handle persistent data directory
if [ -d "/home/worker/data" ]; then
    echo "Persistent data directory found at /home/worker/data"
    # Create a symlink in the home directory for easier access if it doesn't conflict
    if [ ! -L "/home/worker/persistent" ]; then
        ln -s /home/worker/data /home/worker/persistent
    fi
else
    echo "Persistent data directory not found, creating a local one"
    mkdir -p /home/worker/data
fi

# Disable XFCE screen locker and power management prompts
mkdir -p /home/worker/.config/xfce4/xfconf/xfce-perchannel-xml
cat <<EOF > /home/worker/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-screensaver.xml
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xfce4-screensaver" version="1.0">
  <property name="saver" type="empty">
    <property name="enabled" type="bool" value="false"/>
  </property>
  <property name="lock" type="empty">
    <property name="enabled" type="bool" value="false"/>
  </property>
</channel>
EOF

# Clean up any existing locks
rm -f /tmp/.X*-lock
rm -rf /tmp/.X11-unix

# Start TigerVNC server with SecurityTypes=None to disable password
# We must include --I-KNOW-THIS-IS-INSECURE to allow None security type
vncserver :1 -geometry 1280x720 -depth 24 -localhost no -SecurityTypes None --I-KNOW-THIS-IS-INSECURE

# Start second VNC server if MONITOR_COUNT is 2
if [ "$MONITOR_COUNT" = "2" ]; then
    echo "Starting second monitor on :2 (port 5902)"
    vncserver :2 -geometry 1280x720 -depth 24 -localhost no -SecurityTypes None --I-KNOW-THIS-IS-INSECURE
fi

# Start noVNC proxy
NOVNC_DIR="/home/worker/novnc"

# Ensure vnc.html is available as index.html for default serving
if [ ! -f "$NOVNC_DIR/index.html" ]; then
    cp "$NOVNC_DIR/vnc.html" "$NOVNC_DIR/index.html"
fi

# Start first monitor proxy on 6080
if [ -f "$NOVNC_DIR/utils/launch.sh" ]; then
    "$NOVNC_DIR/utils/launch.sh" --vnc 127.0.0.1:5901 --listen 6080 --web "$NOVNC_DIR" &
else
    websockify --web "$NOVNC_DIR" 6080 127.0.0.1:5901 &
fi

# Start second monitor proxy on 6081 if MONITOR_COUNT is 2
if [ "$MONITOR_COUNT" = "2" ]; then
    echo "Starting second monitor noVNC proxy on 6081"
    # We might need a different port for the second websockify
    websockify --web "$NOVNC_DIR" 6081 127.0.0.1:5902 &
fi

# Wait for logs and keep the container alive
touch /home/worker/.vnc/*.log
tail -f /home/worker/.vnc/*.log
