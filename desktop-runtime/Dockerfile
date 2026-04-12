FROM ubuntu:22.04

ARG HTTP_PROXY
ARG HTTPS_PROXY
ARG NO_PROXY
ARG http_proxy
ARG https_proxy
ARG no_proxy

ENV DEBIAN_FRONTEND=noninteractive

ENV TZ=Europe/Berlin \
    HTTP_PROXY=${HTTP_PROXY:-${http_proxy}} \
    HTTPS_PROXY=${HTTPS_PROXY:-${https_proxy}} \
    NO_PROXY=${NO_PROXY:-${no_proxy}} \
    http_proxy=${http_proxy:-${HTTP_PROXY}} \
    https_proxy=${https_proxy:-${HTTPS_PROXY}} \
    no_proxy=${no_proxy:-${NO_PROXY}} \
    XAUTHORITY=/home/vscode/.xauth/.Xauthority \
    VNC_RESOLUTION=2540x1260x24 \
    WORKER_USER=vscode \
    WORKER_HOME=/home/vscode

USER root

# Run the desktop-lite install script — installs VNC, noVNC, fluxbox, all desktop deps,
# creates /usr/local/share/desktop-init.sh and /usr/local/bin/set-resolution.
COPY install.sh /tmp/install.sh
RUN set -eux; \
    if [ -n "${HTTP_PROXY:-}" ]; then \
    printf 'Acquire::http::Proxy "%s";\nAcquire::https::Proxy "%s";\n' \
    "$HTTP_PROXY" "${HTTPS_PROXY:-$HTTP_PROXY}" > /etc/apt/apt.conf.d/01proxy; \
    fi; \
    USERNAME=vscode PASSWORD=noPassword INSTALL_NOVNC=true bash /tmp/install.sh; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
    net-tools \
    mate-session-manager \
    marco \
    mate-panel \
    mate-settings-daemon \
    mate-terminal \
    mate-themes \
    mate-icon-theme; \
    rm -f /tmp/install.sh; \
    rm -rf /var/lib/apt/lists/*

# libxcb-xtest symlink required by PlatynUI at runtime.
# /workspaces → /home/vscode/data (the persistent volume).
RUN set -eux; \
    mkdir -p /home/vscode/.vnc /home/vscode/.xauth /home/vscode/data; \
    ln -sf /usr/lib/x86_64-linux-gnu/libxcb-xtest.so.0 /usr/lib/x86_64-linux-gnu/libxcb-xtest.so; \
    rm -rf /workspaces && ln -s /home/vscode/data /workspaces; \
    if command -v git >/dev/null 2>&1; then git config --system core.fileMode false; fi

WORKDIR /home/vscode

COPY entrypoint.sh /home/vscode/entrypoint.sh
COPY xstartup /home/vscode/xstartup
COPY scripts/ /home/vscode/

RUN set -eux; \
    chmod +x /home/vscode/entrypoint.sh /home/vscode/xstartup \
    chown -R vscode:vscode /home/vscode

EXPOSE 6080

ENTRYPOINT ["/home/vscode/entrypoint.sh"]

CMD []
