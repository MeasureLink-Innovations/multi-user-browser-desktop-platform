'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { docker } from '@/lib/docker';
import { revalidatePath } from 'next/cache';

export async function launchDesktop() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;

  // Check if user already has an active session
  const existingSession = await prisma.desktopSession.findFirst({
    where: { userId, status: { in: ['starting', 'ready'] } },
    include: { worker: true },
  });

  if (existingSession) {
    return existingSession;
  }

  // Create Worker Instance record
  const workerInstance = await prisma.workerInstance.create({
    data: {
      imageTag: 'desktop-worker:latest',
      containerName: `worker-${userId.slice(0, 8)}-${Date.now()}`,
      healthStatus: 'starting',
    },
  });

  // Create Desktop Session record
  const desktopSession = await prisma.desktopSession.create({
    data: {
      userId,
      workerId: workerInstance.id,
      status: 'starting',
    },
  });

  // Start Docker container
  try {
    const container = await docker.createContainer({
      Image: 'desktop-worker:latest',
      name: desktopSession.id, // Use sessionId as container name for easy routing
      HostConfig: {
        NetworkMode: 'multi-user-browser-desktop-platform_platform-network',
      },
      Labels: {
        'com.platform.session-id': desktopSession.id,
        'com.platform.user-id': userId,
      },
    });

    await container.start();

    // In a real setup, we'd wait for health check or poll
    // For now, assume it's starting and will be ready soon
    
    // Get internal host (container name works within docker network)
    const internalHost = workerInstance.containerName;

    await prisma.workerInstance.update({
      where: { id: workerInstance.id },
      data: { internalHost },
    });

    await prisma.desktopSession.update({
      where: { id: desktopSession.id },
      data: { status: 'ready' }, // Mark as ready for MVP simplicity
    });

  } catch (error) {
    console.error('Failed to start container:', error);
    await prisma.desktopSession.update({
      where: { id: desktopSession.id },
      data: { status: 'failed' },
    });
    throw new Error('Failed to launch desktop environment.');
  }

  revalidatePath('/dashboard');
  return desktopSession;
}

export async function terminateSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const desktopSession = await prisma.desktopSession.findUnique({
    where: { id: sessionId },
    include: { worker: true },
  });

  if (!desktopSession) throw new Error('Session not found');

  // Authorization check: owner or admin
  if (desktopSession.userId !== session.user.id && (session.user as any).role !== 'admin') {
    throw new Error('Unauthorized');
  }

  if (desktopSession.worker) {
    try {
      const container = docker.getContainer(desktopSession.worker.containerName);
      await container.stop();
      await container.remove();
    } catch (error) {
      console.error('Failed to stop/remove container:', error);
      // Proceed to mark as stopped in DB anyway if container is already gone
    }

    await prisma.workerInstance.update({
      where: { id: desktopSession.worker.id },
      data: { 
        healthStatus: 'terminated',
        terminatedAt: new Date(),
      },
    });
  }

  await prisma.desktopSession.update({
    where: { id: sessionId },
    data: { status: 'stopped' },
  });

  revalidatePath('/dashboard');
  revalidatePath('/admin/sessions');
}

export async function getActiveSession() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return await prisma.desktopSession.findFirst({
    where: { 
      userId: session.user.id, 
      status: { in: ['starting', 'ready'] } 
    },
    include: { worker: true },
  });
}

export async function getAllSessions() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') throw new Error('Unauthorized');

  return await prisma.desktopSession.findMany({
    include: { 
      user: { select: { email: true } },
      worker: true 
    },
    orderBy: { startedAt: 'desc' },
  });
}
