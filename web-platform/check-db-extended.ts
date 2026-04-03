import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: 'file:dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Current Workers ---');
  const workers = await prisma.workerInstance.findMany({
    include: { desktopSession: true }
  });
  console.table(workers.map(w => ({
    id: w.id,
    name: w.containerName,
    pool: w.isPoolMember,
    owner: w.currentOwnerId || 'none',
    health: w.healthStatus,
    session: w.desktopSession?.id || 'none'
  })));

  console.log('\n--- Active Sessions ---');
  const sessions = await prisma.desktopSession.findMany({
    include: { user: { select: { email: true } } }
  });
  console.table(sessions.map(s => ({
    id: s.id,
    user: s.user.email,
    worker: s.workerId,
    status: s.status
  })));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
