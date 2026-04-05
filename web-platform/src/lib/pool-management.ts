import { docker } from './docker';
import { prisma } from './prisma';

export async function ensureWorkerPool() {
  const poolSize = parseInt(process.env.WORKER_POOL_SIZE || '3', 10);
  const monitorCount = parseInt(process.env.MONITOR_COUNT || '1', 10);
  const displayMode = monitorCount === 2 ? 'dual' : 'single';
  
  console.log(`Ensuring worker pool of size: ${poolSize} (Monitor Count: ${monitorCount})`);

  for (let i = 1; i <= poolSize; i++) {
    const containerName = `prod-worker-${i}`;
    const volumeName = `worker-data-${containerName}`;
    
    // Ensure volume exists
    try {
      await docker.getVolume(volumeName).inspect();
    } catch (error: any) {
      if (error.statusCode === 404) {
        console.log(`Creating volume: ${volumeName}`);
        await docker.createVolume({ Name: volumeName });
      } else {
        console.error(`Error checking volume ${volumeName}:`, error);
      }
    }

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
        console.log(`Creating new pool container: ${containerName} (Mode: ${displayMode})`);
        const container = await docker.createContainer({
          Image: 'desktop-worker:latest',
          name: containerName,
          Env: [`MONITOR_COUNT=${monitorCount}`],
          HostConfig: {
            NetworkMode: 'multi-user-browser-desktop-platform_platform-network',
            Binds: [`${volumeName}:/home/worker/data`],
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
        displayMode,
        volumeName,
      },
      create: {
        containerName,
        imageTag: 'desktop-worker:latest',
        isPoolMember: true,
        healthStatus: 'ready',
        internalHost: containerName,
        displayMode,
        volumeName,
      },
    });
  }
}
