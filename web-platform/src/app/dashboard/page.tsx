import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { launchDesktop, getActiveSession, terminateSession } from '@/lib/session-actions';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const activeSession = await getActiveSession();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage your desktop sessions</p>
          </div>
          <div className="flex items-center gap-4">
            {(session.user as any)?.role === 'admin' && (
              <a href="/admin/users" className="text-blue-600 hover:underline font-medium">Admin Panel</a>
            )}
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <button className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-md hover:bg-red-100 transition-colors font-medium">
                Log out
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">Account Info</h2>
            <p className="text-blue-800">Email: <span className="font-medium">{session.user?.email}</span></p>
            <p className="text-blue-800">Role: <span className="font-medium">{(session.user as any)?.role}</span></p>
          </div>

          {activeSession ? (
            <div className="bg-green-50 border border-green-100 rounded-lg p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-2">Active Session</h2>
                  <p className="text-green-800">Status: <span className="font-bold uppercase">{activeSession.status}</span></p>
                  <p className="text-xs text-green-600 mt-1">ID: {activeSession.id}</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <a 
                    href={`/desktop/${activeSession.id}`} 
                    className="flex-1 md:flex-none text-center bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors shadow-sm"
                  >
                    Open Desktop
                  </a>
                  <form 
                    action={terminateSession.bind(null, activeSession.id)}
                    className="flex-1 md:flex-none"
                  >
                    <button className="w-full bg-white text-red-600 border border-red-200 px-8 py-3 rounded-lg font-bold hover:bg-red-50 transition-colors">
                      End Session
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-12 text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">No active sessions</h2>
              <p className="text-gray-500 mb-6">Launch a new desktop environment to get started.</p>
              <form action={launchDesktop}>
                <button className="bg-blue-600 text-white px-12 py-4 rounded-lg font-bold text-lg hover:bg-blue-700 transition-all shadow-md active:scale-95">
                  Launch Desktop
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
