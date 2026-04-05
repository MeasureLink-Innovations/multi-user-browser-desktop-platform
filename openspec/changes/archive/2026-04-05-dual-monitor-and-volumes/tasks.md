## 1. Database Schema Updates

- [x] 1.1 Add `displayMode` (String, default "single") to `WorkerInstance` model in `schema.prisma`
- [x] 1.2 Add `volumeName` (String, optional) to `WorkerInstance` model in `schema.prisma`
- [x] 1.3 Remove `displayMode` from `DesktopSession` model in `schema.prisma`
- [x] 1.4 Run `npx prisma migrate dev` to apply schema changes (used db push)

## 2. Worker Image Updates (`desktop-runtime`)

- [x] 2.1 Update `entrypoint.sh` to support a second VNC server if `MONITOR_COUNT=2` is set
- [x] 2.2 Update `entrypoint.sh` to ensure `/home/worker/data` is the primary work directory or symlinked appropriately
- [x] 2.3 Rebuild the `desktop-worker:latest` image

## 3. Web Platform & Pool Management Updates

- [x] 3.1 Update `ensureWorkerPool` in `pool-management.ts` to create Docker volumes for each worker
- [x] 3.2 Update `ensureWorkerPool` to pass `MONITOR_COUNT` env and mount the volume during container creation
- [x] 3.3 Update `ensureWorkerPool` to assign a mix of single and dual-monitor modes to workers in the database
- [x] 3.4 Update `getPoolStatus` in `session-actions.ts` to reflect the new `WorkerInstance` schema

## 4. UI & Dashboard Updates

- [x] 4.1 Update `WorkerCard` component to display the monitor count of the worker
- [x] 4.2 Update the Desktop page to handle multiple iframes or a dual-monitor layout when `displayMode` is "dual"

## 5. Verification

- [x] 5.1 Verify that workers are created with persistent volumes attached
- [x] 5.2 Verify that dual-monitor workers start two VNC sessions successfully
- [x] 5.3 Verify that data persists in `/home/worker/data` across worker restarts
