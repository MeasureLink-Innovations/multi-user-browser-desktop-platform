'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { docker } from '@/lib/docker';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function claimSession(workerId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const userId = session.user.id;

  // Transaction to ensure atomic claim
  try {
    const result = await prisma.$transaction(async (tx) => {
      const worker = await tx.workerInstance.findUnique({
        where: { id: workerId },
      });

      if (!worker) throw new Error('Worker not found');
      if (worker.currentOwnerId) throw new Error('Worker already claimed');

      // Update worker with owner
      await tx.workerInstance.update({
        where: { id: workerId },
        data: { currentOwnerId: userId },
      });

      // Create desktop session
      return await tx.desktopSession.create({
        data: {
          userId,
          workerId,
          status: 'ready',
        },
      });
    });

    revalidatePath('/dashboard');
    return result;
  } catch (error) {
    console.error('Failed to claim session:', error);
    throw error;
  }
}

export async function releaseSession(sessionId: string): Promise<void> {
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
    await prisma.workerInstance.update({
      where: { id: desktopSession.worker.id },
      data: { currentOwnerId: null },
    });
  }

  await prisma.desktopSession.delete({
    where: { id: sessionId },
  });

  revalidatePath('/dashboard');
  revalidatePath('/admin/sessions');
}

export async function restartSession(workerId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const worker = await prisma.workerInstance.findUnique({
    where: { id: workerId },
  });

  if (!worker) throw new Error('Worker not found');
  if (worker.currentOwnerId !== session.user.id && (session.user as any).role !== 'admin') {
    throw new Error('Unauthorized');
  }

  try {
    const container = docker.getContainer(worker.containerName);
    await container.restart();
    
    await prisma.workerInstance.update({
      where: { id: workerId },
      data: { healthStatus: 'starting' },
    });
  } catch (error) {
    console.error('Failed to restart container:', error);
    throw new Error('Failed to restart environment.');
  }

  revalidatePath('/dashboard');
}

export async function getPoolStatus() {
  const session = await auth();
  if (!session?.user?.id) return [];

  const workers = await prisma.workerInstance.findMany({
    where: { isPoolMember: true },
    include: { desktopSession: true },
  });

  // Check Docker health for each worker
  const workersWithHealth = await Promise.all(workers.map(async (w) => {
    try {
      const container = docker.getContainer(w.containerName);
      const inspect = await container.inspect();
      return {
        ...w,
        dockerStatus: inspect.State.Status, // e.g. "running", "restarting"
      };
    } catch (e) {
      return {
        ...w,
        dockerStatus: 'missing',
      };
    }
  }));

  return workersWithHealth;
}

export async function launchDesktop(formData: FormData): Promise<void> {
    // Keep for backward compatibility or refactor to claim
    const session = await auth();
    if (!session?.user?.id) throw new Error('Unauthorized');
    
    // Find first available worker in pool
    const availableWorker = await prisma.workerInstance.findFirst({
      where: { isPoolMember: true, currentOwnerId: null }
    });

    if (!availableWorker) {
      throw new Error('No available workers in the pool');
    }

    const newSession = await claimSession(availableWorker.id);
    redirect(`/desktop/${newSession.id}`);
}

export async function terminateSession(sessionId: string) {
    // Map to release for the pool model
    return await releaseSession(sessionId);
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
