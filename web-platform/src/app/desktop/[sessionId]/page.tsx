import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function DesktopPage({ 
  params 
}: { 
  params: Promise<{ sessionId: string }> 
}) {
  const session = await auth();
  if (!session) redirect('/login');

  const { sessionId } = await params;

  const desktopSession = await prisma.desktopSession.findUnique({
    where: { id: sessionId },
    include: { worker: true },
  });

  if (!desktopSession) notFound();

  // Authorization check: owner or admin
  if (desktopSession.userId !== (session.user as any)?.id && (session.user as any).role !== 'admin') {
    redirect('/dashboard');
  }

  // The iframe will point to the proxy route /desktop/[sessionId]/
  // Nginx will proxy this to the worker on port 6080.
  // The worker (noVNC) expects vnc.html for the client UI.
  // autoconnect=true automatically starts the connection.
  const desktopUrl = `/desktop/${sessionId}/vnc.html?autoconnect=true&reconnect=true&resize=remote`;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#2c2c2c]">
      <header className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center border-b border-black shadow-lg z-10">
        <div className="flex items-center gap-4">
          <div className="bg-blue-600 p-1.5 rounded">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="14" x="3" y="3" rx="2"/><line x1="3" x2="21" y1="17" y2="17"/><line x1="9" x2="15" y1="21" y2="21"/></svg>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight">VIRTUAL DESKTOP</h1>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Session {sessionId.slice(0, 8)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs text-green-400 font-medium bg-green-900/30 px-2 py-1 rounded border border-green-800/50">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
            CONNECTED
          </span>
          <a href="/dashboard" className="bg-gray-700 hover:bg-gray-600 px-4 py-1.5 rounded text-xs font-bold transition-all border border-gray-600">
            DASHBOARD
          </a>
        </div>
      </header>
      <div className="flex-1 relative bg-black">
        <iframe 
          src={desktopUrl} 
          className="absolute inset-0 w-full h-full border-none"
          title="Desktop Session"
          allow="fullscreen; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
