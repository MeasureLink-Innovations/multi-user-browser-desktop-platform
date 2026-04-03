-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_WorkerInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageTag" TEXT NOT NULL,
    "containerName" TEXT NOT NULL,
    "internalHost" TEXT,
    "display1Target" TEXT,
    "display2Target" TEXT,
    "healthStatus" TEXT NOT NULL DEFAULT 'starting',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminatedAt" DATETIME,
    "isPoolMember" BOOLEAN NOT NULL DEFAULT false,
    "currentOwnerId" TEXT
);
INSERT INTO "new_WorkerInstance" ("containerName", "createdAt", "display1Target", "display2Target", "healthStatus", "id", "imageTag", "internalHost", "terminatedAt") SELECT "containerName", "createdAt", "display1Target", "display2Target", "healthStatus", "id", "imageTag", "internalHost", "terminatedAt" FROM "WorkerInstance";
DROP TABLE "WorkerInstance";
ALTER TABLE "new_WorkerInstance" RENAME TO "WorkerInstance";
CREATE UNIQUE INDEX "WorkerInstance_containerName_key" ON "WorkerInstance"("containerName");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
