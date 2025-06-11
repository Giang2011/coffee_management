import { useEffect, useState } from 'react';
import { adminVoucherApi as voucherApi } from '@/api';
import { Pencil, Trash2, Plus, X, CheckCircle } from 'lucide-react';

/**
 * ADMIN – CRUD Voucher
 * Hiển thị cột ID chạy tuần tự (không lấy từ API)
 */
export default function VouchersCRUD() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null | voucherObj
  const [formData, setFormData] = useState({
    code: '',
    discount: '',
    start_date: '',
    end_date: '',
    max_usage: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* -------------------- fetch -------------------- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await voucherApi.getVouchers();
      setVouchers(Array.isArray(data.data) ? data.data : data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  /* -------------------- modal helpers ----------------- */
  const openAdd = () => {
    setFormData({
      code: '',
      discount: '',
      start_date: '',
      end_date: '',
      max_usage: ''
    });
    setEditing(null);
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (v) => {
    setFormData({
      code: v.code ?? '',
      discount: v.discount_percent ?? '',
      start_date: v.start_date ?? '',
      end_date: v.end_date ?? '',
      max_usage: v.max_usage !== undefined && v.max_usage !== null ? String(v.max_usage) : ''
    });
    setEditing(v);
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  /* -------------------- submit ------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        code: formData.code,
        discount_percent: Number(formData.discount),
        start_date: formData.start_date,
        end_date: formData.end_date,
        max_usage: formData.max_usage ? Number(formData.max_usage) : undefined
      };
      if (editing) await voucherApi.updateVoucher(editing.id, payload);
      else await voucherApi.createVoucher(payload);

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
    if (!confirm('Delete this voucher?')) return;
    await voucherApi.deleteVoucher(id);
    await fetchData();
    alert('Voucher deleted!');
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Voucher Management</h2>
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
                <th className="px-4 py-2 text-left">Code</th>
                <th className="px-4 py-2 text-left">Discount</th>
                <th className="px-4 py-2 text-left">Start Date</th>
                <th className="px-4 py-2 text-left">End Date</th>
                <th className="px-4 py-2 text-left">Max Usage</th>
                <th className="px-4 py-2 w-24 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vouchers.map((v, idx) => (
                <tr key={v.id ?? idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{v.code}</td>
                  <td className="px-4 py-2">{v.discount_percent}%</td>
                  <td className="px-4 py-2">{new Date(v.start_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(v.end_date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{v.max_usage}</td>
                  <td className="px-4 py-1.5 flex gap-2">
                    <button onClick={() => openEdit(v)} className="text-amber-600 hover:text-amber-800"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(v.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {vouchers.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-4 text-center text-gray-500">No data.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
          <form onSubmit={handleSubmit} onClick={(e)=>e.stopPropagation()} className="w-full max-w-lg space-y-4 rounded-lg bg-white p-6 shadow">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Voucher</h3>
              <button type="button" onClick={closeModal}><X size={20} /></button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Code</label>
                <input
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter voucher code"
                  className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  placeholder="Enter discount %"
                  className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Max Usage</label>
                <input
                  type="number"
                  name="max_usage"
                  value={formData.max_usage}
                  onChange={handleInputChange}
                  min="1"
                  placeholder="Enter max usage"
                  className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>

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
