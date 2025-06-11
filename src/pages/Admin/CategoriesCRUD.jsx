// src/pages/Admin/CategoriesCRUD.jsx
import { useEffect, useState } from 'react';
import { adminCategoryApi as categoryApi } from '@/api';
import { Pencil, Trash2, Plus, X, CheckCircle } from 'lucide-react';

/**
 * ADMIN – CRUD Danh mục
 * Hiển thị cột ID chạy tuần tự (không lấy từ API)
 */
export default function CategoriesCRUD() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null | categoryObj
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* -------------------- fetch -------------------- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await categoryApi.getCategories();
      setCategories(Array.isArray(data.data) ? data.data : data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  /* -------------------- modal helpers ----------------- */
  const openAdd  = () => { setName(''); setEditing(null);  setModalOpen(true);  setError(''); setSuccess(''); };
  const openEdit = (c) => { setName(c.name); setEditing(c); setModalOpen(true);  setError(''); setSuccess(''); };
  const closeModal = () => { setModalOpen(false); setEditing(null); setSuccess(''); };

  /* -------------------- submit ------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) await categoryApi.updateCategory(editing.id, { name });
      else          await categoryApi.createCategory({ name });

      setSuccess('Success!');
      setTimeout(() => {
        closeModal();
        fetchData();
      }, 1000);
    } catch (err) {
      setError(err.toString());
    }
  };

  /* -------------------- delete ----------------------- */
  const handleDelete = async (id) => {
    if (!confirm('Xoá danh mục này?')) return;
    await categoryApi.deleteCategory(id);
    await fetchData();
    alert('Đã xoá danh mục!');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Category Management</h2>
        <button onClick={openAdd} className="flex items-center gap-1 rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700">
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* table */}
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded border bg-white shadow">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-12 px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 w-24 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {categories.map((c, idx) => (
                <tr key={c.id ?? idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{c.name}</td>
                  <td className="px-4 py-1.5 flex gap-2">
                    <button onClick={() => openEdit(c)} className="text-amber-600 hover:text-amber-800"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-4 text-center text-gray-500">No data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
          <form onSubmit={handleSubmit} onClick={(e)=>e.stopPropagation()} className="w-full max-w-sm space-y-4 rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Category</h3>
              <button type="button" onClick={closeModal}><X size={20} /></button>
            </div>

            <input value={name} onChange={(e)=>setName(e.target.value)} required placeholder="Category name"
                   className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600" />

            {error && <p className="text-sm text-red-600">{error}</p>}
            {success && (
              <p className="flex items-center gap-1 text-sm text-green-600"><CheckCircle size={16}/> {success}</p>
            )}

            <button type="submit" className="w-full rounded bg-amber-600 py-2 font-semibold text-white hover:bg-amber-700">
              {editing ? 'Save' : 'Add New'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
