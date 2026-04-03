import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { getPoolStatus } from '@/lib/session-actions';
import { WorkerCard } from '@/components/worker-card';
import { DashboardRefresh } from '@/components/dashboard-refresh';

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const pool = await getPoolStatus();
  const userId = (session.user as any)?.id;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <DashboardRefresh />
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Production Dashboard</h1>
            <p className="text-gray-500 mt-1">Runtime Pool Management</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pool.map((worker) => (
            <WorkerCard 
              key={worker.id} 
              worker={worker as any} 
              userId={userId} 
            />
          ))}
        </div>

        {pool.length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-gray-500 font-medium">The runtime pool is currently empty.</p>
            <p className="text-sm text-gray-400 mt-1">Wait for initialization or contact an admin.</p>
          </div>
        )}
      </div>
    </div>
  );
}
