FROM ubuntu:22.04

# Avoid prompts during installation
ENV DEBIAN_FRONTEND=noninteractive

# Install desktop environment and VNC/noVNC components
RUN apt-get update && apt-get install -y \
    xfce4 xfce4-goodies \
    tigervnc-standalone-server \
    novnc websockify \
    curl \
    python3 \
    net-tools \
    && rm -rf /var/lib/apt/lists/*

# Set up a non-root user
RUN useradd -ms /bin/bash worker
WORKDIR /home/worker

# Create necessary directories
RUN mkdir -p /home/worker/.vnc
RUN mkdir -p /home/worker/novnc

# Expose the noVNC port
EXPOSE 6080

# Copy startup scripts
COPY entrypoint.sh /home/worker/entrypoint.sh
COPY xstartup /home/worker/xstartup
RUN chmod +x /home/worker/entrypoint.sh /home/worker/xstartup

# Link noVNC files to the writeable directory
RUN cp -r /usr/share/novnc/* /home/worker/novnc/

# Switch to the non-root user
RUN chown -R worker:worker /home/worker
USER worker

# Entrypoint for the container
ENTRYPOINT ["/home/worker/entrypoint.sh"]

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:6080/ || exit 1
