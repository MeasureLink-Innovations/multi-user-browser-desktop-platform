## 1. Web Platform API Updates

- [x] 1.1 Update `proxy-check` route to extract session ID from `X-Original-URI` header
- [x] 1.2 Modify `proxy-check` to return the worker's `containerName` in the `X-Desktop-Host` response header
- [x] 1.3 Add server-side logging for routing and authorization failures in the proxy-check endpoint

## 2. Nginx Configuration Updates

- [x] 2.1 Update the `/_proxy_check` internal location to ensure `X-Original-URI` is correctly forwarded
- [x] 2.2 Refactor the `/desktop` location block to use `auth_request_set` for capturing the target host
- [x] 2.3 Update the `proxy_pass` directive in Nginx to use the dynamically resolved `$desktop_host` variable

## 3. Validation & Testing

- [x] 3.1 Verify that clicking "Open Desktop" correctly loads the noVNC interface without 500 errors
- [x] 3.2 Confirm that accessing a desktop URL with an invalid session ID returns a 404 error
- [x] 3.3 Confirm that accessing another user's session ID returns a 403 Forbidden error
