// app/admin/components/RecentActivity.tsx
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface RecentActivityProps {
  users: User[];
}

export default function RecentActivity({ users }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
      <div className="space-y-3">
        {users && users.length > 0 ? (
          users.map((user) => (
            <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                user.role === 'mentor' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user.role}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No users found</p>
        )}
      </div>
      <Link 
        href="/admin/users"
        className="block mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        View all users →
      </Link>
    </div>
  );
}