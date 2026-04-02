-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'standard_user',
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "DesktopSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "workerId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'starting',
    "accessToken" TEXT,
    "routeKey" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    "displayMode" TEXT NOT NULL DEFAULT 'single',
    CONSTRAINT "DesktopSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DesktopSession_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "WorkerInstance" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkerInstance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageTag" TEXT NOT NULL,
    "containerName" TEXT NOT NULL,
    "internalHost" TEXT,
    "display1Target" TEXT,
    "display2Target" TEXT,
    "healthStatus" TEXT NOT NULL DEFAULT 'starting',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "terminatedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DesktopSession_workerId_key" ON "DesktopSession"("workerId");

-- CreateIndex
CREATE UNIQUE INDEX "DesktopSession_accessToken_key" ON "DesktopSession"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "DesktopSession_routeKey_key" ON "DesktopSession"("routeKey");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerInstance_containerName_key" ON "WorkerInstance"("containerName");
