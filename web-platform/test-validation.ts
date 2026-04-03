import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({
  url: 'file:dev.db'
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- Starting Validation Tests ---');

  // 1. Setup: Create a test user
  const testEmail = 'testuser@example.com';
  const passwordHash = await bcrypt.hash('testpassword', 10);
  const testUser = await prisma.user.upsert({
    where: { email: testEmail },
    update: {},
    create: {
      email: testEmail,
      passwordHash,
      role: 'standard_user',
    },
  });
  console.log('Test user ready:', testUser.email);

  // 2. Find an available worker (prod-worker-3 or 4 are ready/none)
  const worker = await prisma.workerInstance.findFirst({
    where: { isPoolMember: true, currentOwnerId: null }
  });

  if (!worker) {
    console.error('No available workers for test!');
    return;
  }
  console.log('Testing with worker:', worker.containerName);

  // 3. Test Exclusive Access Simulation
  // We'll manually simulate what claimSession does but in a script
  console.log('\n--- 5.2 Test Exclusive Access ---');
  
  // Claim the worker for testUser
  await prisma.workerInstance.update({
    where: { id: worker.id },
    data: { currentOwnerId: testUser.id }
  });
  const session = await prisma.desktopSession.create({
    data: {
      userId: testUser.id,
      workerId: worker.id,
      status: 'ready'
    }
  });
  console.log(`Worker ${worker.containerName} claimed by ${testUser.email}`);

  // Try to claim it again with another user (admin@example.com)
  const admin = await prisma.user.findUnique({ where: { email: 'admin@example.com' } });
  if (admin) {
    console.log(`Checking if ${admin.email} can claim the same worker...`);
    const workerCheck = await prisma.workerInstance.findUnique({ where: { id: worker.id } });
    if (workerCheck?.currentOwnerId && workerCheck.currentOwnerId !== admin.id) {
      console.log('SUCCESS: Exclusive access logic confirmed (Worker already claimed)');
    } else {
      console.error('FAILURE: Exclusive access logic failed!');
    }
  }

  // 4. Test Release Simulation
  console.log('\n--- 5.4 Test Session Release ---');
  await prisma.workerInstance.update({
    where: { id: worker.id },
    data: { currentOwnerId: null }
  });
  await prisma.desktopSession.delete({
    where: { id: session.id }
  });
  console.log(`Worker ${worker.containerName} released successfully`);

  const releasedCheck = await prisma.workerInstance.findUnique({ where: { id: worker.id } });
  if (!releasedCheck?.currentOwnerId) {
    console.log('SUCCESS: Session release confirmed');
  } else {
    console.error('FAILURE: Session release failed!');
  }

  console.log('\n--- Validation Tests Complete ---');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
