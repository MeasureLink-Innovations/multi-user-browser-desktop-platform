#!/bin/bash

# Ensure VNC directory exists
mkdir -p /home/worker/.vnc

# Set up xstartup
cp /home/worker/xstartup /home/worker/.vnc/xstartup
chmod +x /home/worker/.vnc/xstartup

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

# Start noVNC proxy
NOVNC_DIR="/home/worker/novnc"

# Ensure vnc.html is available as index.html for default serving
if [ ! -f "$NOVNC_DIR/index.html" ]; then
    cp "$NOVNC_DIR/vnc.html" "$NOVNC_DIR/index.html"
fi

# We use launch.sh which starts websockify. 
# Explicitly use 127.0.0.1:5901 to ensure websockify finds the VNC server
if [ -f "$NOVNC_DIR/utils/launch.sh" ]; then
    "$NOVNC_DIR/utils/launch.sh" --vnc 127.0.0.1:5901 --listen 6080 --web "$NOVNC_DIR" &
else
    websockify --web "$NOVNC_DIR" 6080 127.0.0.1:5901 &
fi

# Wait for logs and keep the container alive
touch /home/worker/.vnc/*.log
tail -f /home/worker/.vnc/*.log
