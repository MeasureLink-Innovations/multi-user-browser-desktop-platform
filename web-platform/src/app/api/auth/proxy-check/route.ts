import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('Missing sessionId', { status: 400 });
  }

  const desktopSession = await prisma.desktopSession.findUnique({
    where: { id: sessionId },
    include: { worker: true },
  });

  if (!desktopSession) {
    return new Response('Session not found', { status: 404 });
  }

  // Authorization check: owner or admin
  const isOwner = desktopSession.userId === session.user.id;
  const isWorkerOwner = desktopSession.worker?.currentOwnerId === session.user.id;
  const isAdmin = (session.user as any).role === 'admin';

  if (!isAdmin && (!isOwner || !isWorkerOwner)) {
    return new Response('Forbidden', { status: 403 });
  }

  return new Response('OK', { status: 200 });
}
