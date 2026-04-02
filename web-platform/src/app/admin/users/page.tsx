import { getUsers, createUser, deleteUser } from '@/lib/user-actions';

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <a href="/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">← Back to Dashboard</a>
        </div>
        
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-10">
          <h2 className="text-xl font-bold mb-6 text-gray-800">Create New User</h2>
          <form action={createUser} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input 
                name="email" 
                type="email" 
                required 
                className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                placeholder="user@example.com" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input 
                name="password" 
                type="password" 
                required 
                className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                placeholder="••••••••" 
                minLength={6} 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-gray-700">System Role</label>
              <select 
                name="role" 
                className="border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-all"
              >
                <option value="standard_user">Standard User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm"
            >
              Add User
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-5 font-bold text-gray-700">User Email</th>
                <th className="p-5 font-bold text-gray-700">Role</th>
                <th className="p-5 font-bold text-gray-700">Status</th>
                <th className="p-5 font-bold text-gray-700">Created At</th>
                <th className="p-5 font-bold text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-5 text-gray-900 font-medium">{user.email}</td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                        : 'bg-blue-100 text-blue-700 border border-blue-200'
                    }`}>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-sm text-gray-700 capitalize">{user.status}</span>
                    </span>
                  </td>
                  <td className="p-5 text-gray-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-5 text-right">
                    <form action={deleteUser.bind(null, user.id)}>
                      <button 
                        className="text-red-500 hover:text-red-700 font-bold text-sm transition-colors px-3 py-1 rounded hover:bg-red-50"
                        disabled={user.role === 'admin'}
                      >
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
