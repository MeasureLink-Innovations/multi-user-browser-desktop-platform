import { docker } from './docker';
import { prisma } from './prisma';

export async function ensureWorkerPool() {
  const poolSize = parseInt(process.env.WORKER_POOL_SIZE || '3', 10);
  console.log(`Ensuring worker pool of size: ${poolSize}`);

  for (let i = 1; i <= poolSize; i++) {
    const containerName = `prod-worker-${i}`;
    
    // Check if container exists in Docker
    try {
      const container = docker.getContainer(containerName);
      const inspect = await container.inspect();
      
      if (!inspect.State.Running) {
        console.log(`Starting existing container: ${containerName}`);
        await container.start();
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.log(`Creating new pool container: ${containerName}`);
        const container = await docker.createContainer({
          Image: 'desktop-worker:latest',
          name: containerName,
          HostConfig: {
            NetworkMode: 'multi-user-browser-desktop-platform_platform-network',
          },
          Labels: {
            'com.platform.pool-member': 'true',
          },
        });
        await container.start();
      } else {
        console.error(`Error checking container ${containerName}:`, error);
      }
    }

    // Upsert into WorkerInstance table
    await prisma.workerInstance.upsert({
      where: { containerName },
      update: {
        isPoolMember: true,
        healthStatus: 'ready',
      },
      create: {
        containerName,
        imageTag: 'desktop-worker:latest',
        isPoolMember: true,
        healthStatus: 'ready',
        internalHost: containerName,
      },
    });
  }
}
