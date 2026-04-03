## 1. Schema & Models

- [x] 1.1 Add `isPoolMember` and `currentOwnerId` to `WorkerInstance` model
- [x] 1.2 Update Prisma schema and migrate database

## 2. Pool Management Logic

- [x] 2.1 Implement `ensureWorkerPool` routine to pre-provision containers
- [x] 2.2 Add `WORKER_POOL_SIZE` environment variable support
- [x] 2.3 Create a startup initialization script to call `ensureWorkerPool`

## 3. Session Assignment (Claim/Release)

- [x] 3.1 Implement `claimSession` server action
- [x] 3.2 Implement `releaseSession` server action
- [x] 3.3 Implement `restartSession` server action using `docker.restart()`
- [x] 3.4 Update `proxy-check` API to enforce exclusive access based on `currentOwnerId`

## 4. UI Updates

- [x] 4.1 Update Dashboard to list the entire runtime pool
- [x] 4.2 Display real-time container health status on the Dashboard
- [x] 4.3 Add "Claim", "Open", "Restart", and "Release" buttons with state-dependent visibility
- [x] 4.4 Build Admin view to force-release any session in the pool
- [x] 4.5 Refactor Dashboard to use `WorkerCard` client component
- [x] 4.6 Implement optimistic status updates using `useOptimistic`
- [x] 4.7 Add loading states to buttons using `useFormStatus` or `useTransition`
- [x] 4.8 Add automatic status polling for the Dashboard view

## 5. Validation

- [x] 5.1 Verify containers are correctly provisioned at startup
- [x] 5.2 Test exclusive access: ensure user B cannot join user A's claimed session
- [ ] 5.3 Test manual restart functionality (Manual test required)
- [x] 5.4 Test session release and re-claiming
