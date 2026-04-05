## 1. Infrastructure & Code Updates

- [x] 1.1 Update `docker-compose.yml` to include `MONITOR_COUNT` for the `web-platform` service
- [x] 1.2 Update `ensureWorkerPool` in `web-platform/src/lib/pool-management.ts` to use `process.env.MONITOR_COUNT`
- [x] 1.3 Simplify the loop in `ensureWorkerPool` to use the uniform `MONITOR_COUNT` for all workers
- [x] 1.4 Update the `WorkerInstance` upsert in `ensureWorkerPool` to derive `displayMode` from the uniform count

## 2. Verification

- [x] 2.1 Restart the stack and verify that all workers are created with the same `MONITOR_COUNT`
- [x] 2.2 Verify that the `WorkerInstance` table in the database correctly reflects the `displayMode` for all workers
