#!/bin/bash

# Ensure VNC directory exists
mkdir -p /home/worker/.vnc

# Set up xstartup
cp /home/worker/xstartup /home/worker/.vnc/xstartup
chmod +x /home/worker/.vnc/xstartup

# Set up default VNC password if not provided
VNC_PASSWORD=${VNC_PASSWORD:-password}
echo $VNC_PASSWORD | vncpasswd -f > /home/worker/.vnc/passwd
chmod 600 /home/worker/.vnc/passwd

# Clean up any existing locks
rm -f /tmp/.X*-lock
rm -rf /tmp/.X11-unix

# Start TigerVNC server
# -localhost no allows non-localhost connections (needed for noVNC if running as separate process)
# -rfbport 5901 is the standard VNC port
# -rfbauth points to the password file
vncserver :1 -geometry 1280x720 -depth 24 -localhost no -rfbauth /home/worker/.vnc/passwd

# Start noVNC proxy
# --vnc localhost:5901 connects to the TigerVNC server
# --listen 6080 exposes the noVNC interface on 6080
# Use websockify directly if novnc_proxy is not available
if [ -f /usr/share/novnc/utils/novnc_proxy ]; then
    /usr/share/novnc/utils/novnc_proxy --vnc localhost:5901 --listen 6080 &
else
    websockify --web /usr/share/novnc/ 6080 localhost:5901 &
fi

# Wait for logs and keep the container alive
touch /home/worker/.vnc/*.log
tail -f /home/worker/.vnc/*.log
