import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    console.warn('[ProxyCheck] Unauthorized access attempt');
    return new Response('Unauthorized', { status: 401 });
  }

  // Extract sessionId from X-Original-URI header if available (provided by Nginx)
  const originalUri = req.headers.get('x-original-uri');
  let sessionId: string | null = null;

  if (originalUri) {
    const match = originalUri.match(/^\/desktop2?\/([a-zA-Z0-9_-]+)/);
    if (match) {
      sessionId = match[1];
    }
  }

  // Fallback to searchParams for development/direct testing
  if (!sessionId) {
    const { searchParams } = new URL(req.url);
    sessionId = searchParams.get('sessionId');
  }

  if (!sessionId) {
    console.warn('[ProxyCheck] Missing sessionId in request');
    return new Response('Missing sessionId', { status: 400 });
  }

  const desktopSession = await prisma.desktopSession.findUnique({
    where: { id: sessionId },
    include: { worker: true },
  });

  if (!desktopSession) {
    console.error(`[ProxyCheck] Session not found: ${sessionId}`);
    return new Response('Session not found', { status: 404 });
  }

  // Authorization check: owner or admin
  const isOwner = desktopSession.userId === session.user.id;
  const isWorkerOwner = desktopSession.worker?.currentOwnerId === session.user.id;
  const isAdmin = (session.user as { role?: string }).role === 'admin';

  if (!isAdmin && (!isOwner || !isWorkerOwner)) {
    console.error(`[ProxyCheck] Forbidden access: user ${session.user.id} attempting to access session ${sessionId}`);
    return new Response('Forbidden', { status: 403 });
  }

  const containerName = desktopSession.worker?.containerName;
  if (!containerName) {
    console.error(`[ProxyCheck] Worker container name missing for session: ${sessionId}`);
    return new Response('Worker not found', { status: 500 });
  }

  console.info(`[ProxyCheck] Authorized: user ${session.user.id} -> ${containerName}`);

  return new Response('OK', {
    status: 200,
    headers: {
      'X-Desktop-Host': containerName,
    },
  });
}
