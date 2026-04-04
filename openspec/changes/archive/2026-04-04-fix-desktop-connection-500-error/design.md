## Context

The system uses Nginx as a reverse proxy to route traffic between the web platform and individual worker containers. Currently, the Nginx configuration attempts to resolve the session ID segment of the URL (`/desktop/[sessionId]`) as an internal hostname, which fails. Furthermore, the authentication subrequest does not correctly receive the session context required to perform authorization.

## Goals / Non-Goals

**Goals:**
- **Zero-Configuration Routing**: Enable Nginx to route to any worker container dynamically based on the session ID.
- **Unified Authentication**: Maintain the single point of truth for authorization in the web platform's `proxy-check` route.
- **Robust Error Handling**: Ensure failures in routing or authentication result in clear 403 or 404 responses instead of 500 errors.

**Non-Goals:**
- **URL Restructuring**: We will not change the public URL format from `/desktop/[sessionId]`.
- **Database Access in Nginx**: Nginx will not be given direct access to the database for host resolution.

## Decisions

### 1. Header-Based Host Resolution
- **Decision**: The `proxy-check` API will return the target worker's `containerName` in a custom response header: `X-Desktop-Host`. Nginx will capture this header using `auth_request_set` and use it for the final `proxy_pass`.
- **Rationale**: This leverages Nginx's built-in `auth_request` capabilities to perform dynamic routing without requiring complex Nginx modules or exposing internal infrastructure names in the public URL.

### 2. X-Original-URI Context Extraction
- **Decision**: The `proxy-check` route will parse the session ID from the `X-Original-URI` header provided by Nginx.
- **Rationale**: This is the most reliable way to retrieve the original request path in a subrequest without modifying Nginx's `proxy_pass` logic to append query parameters for every subpath.

### 3. Resolver Validation
- **Decision**: Maintain the use of the Docker internal DNS resolver (`127.0.0.11`) with a short validity period (30s) for the `$desktop_host` variable.
- **Rationale**: When using variables in `proxy_pass`, Nginx requires an explicit resolver to handle DNS lookups at runtime rather than at startup.

## Risks / Trade-offs

- **[Risk] DNS Resolution Latency** → Docker's internal DNS resolution might add a small overhead to the first request. *Mitigation*: The overhead is negligible compared to the VNC session startup time and is cached for the configured TTL.
- **[Risk] Proxy Loop/Redirection** → If the `proxy-check` route itself redirects, it might cause issues with `auth_request`. *Mitigation*: Ensure the route always returns a terminal 2xx, 4xx, or 5xx status code without redirects.
