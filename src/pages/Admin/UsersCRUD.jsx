import { useEffect, useState } from 'react';
import { adminUserApi as userApi } from '@/api';
import { Eye } from 'lucide-react';

export default function UsersCRUD() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await userApi.getUsers();
        setUsers(Array.isArray(data.data) ? data.data : data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const openDetail = async (user) => {
    setSelectedUser(user);
    setDetailLoading(true);
    try {
      const { data } = await userApi.getUser(user.id);
      setDetail(data);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedUser(null);
    setDetail(null);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Management</h2>
      </div>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded border bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-12 px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Full Name</th>
                <th className="px-4 py-2 text-left">Phone Number</th>
                <th className="px-4 py-2 w-24 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((u, idx) => (
                <tr key={u.id ?? idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">{u.full_name}</td>
                  <td className="px-4 py-2">{u.phone_number}</td>
                  <td className="px-4 py-1.5 flex gap-2">
                    <button onClick={() => openDetail(u)} className="text-amber-600 hover:text-amber-800"><Eye size={16} /></button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-4 text-center text-gray-500">No data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeDetail}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-lg bg-white p-6 shadow space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">User Detail</h3>
              <button onClick={closeDetail}>&times;</button>
            </div>
            {detailLoading ? (
              <p>Loading…</p>
            ) : detail ? (
              <div className="space-y-2">
                <div><b>ID:</b> {detail.id}</div>
                <div><b>Email:</b> {detail.email}</div>
                <div><b>Full Name:</b> {detail.full_name}</div>
                <div><b>Phone Number:</b> {detail.phone_number}</div>
                <div><b>Address:</b> {detail.address}</div>
                <div><b>Role:</b> {detail.role}</div>
              </div>
            ) : (
              <p>Failed to load user detail.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
