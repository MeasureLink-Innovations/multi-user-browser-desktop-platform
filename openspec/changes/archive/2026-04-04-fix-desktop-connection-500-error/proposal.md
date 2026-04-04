## Why

Users are receiving a 500 Internal Server Error when clicking "Open Desktop" on the dashboard. This occurs because the reverse proxy (Nginx) attempts to use the session ID directly as an internal Docker hostname, which cannot be resolved. Additionally, the authentication subrequest (`/_proxy_check`) is failing because it doesn't receive the session context it expects.

## What Changes

- **Dynamic Host Resolution**: Update the reverse proxy to retrieve the correct internal worker hostname (the container name) from the authentication subrequest response.
- **Enhanced Proxy Authentication API**: Update the `proxy-check` route to extract the session ID from the `X-Original-URI` header and return the target worker's hostname in a response header (`X-Desktop-Host`).
- **Improved Error Logging**: Add server-side logging for proxy authentication failures to simplify debugging of future routing issues.

## Capabilities

### New Capabilities
- (No new capabilities introduced; this is an implementation fix for existing specs)

### Modified Capabilities

- authenticated-proxy: Refine "Path-Based Routing" to explicitly include metadata-driven host resolution.

## Impact

- **Nginx Configuration**: Changes to `nginx.conf` to handle `auth_request_set` and dynamic `proxy_pass`.
- **Web Platform**: Modifications to the `web-platform/src/app/api/auth/proxy-check/route.ts` API endpoint.
- **Stability**: Prevents 500 errors and ensures desktop sessions are reachable for all users.
