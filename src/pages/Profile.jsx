import { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '@/api/user/profile';
import { Pencil } from 'lucide-react';

const fields = [
  { name: 'full_name', label: 'Full Name', type: 'text' },
  { name: 'password', label: 'Password (min 6 chars)', type: 'password' },
  { name: 'phone_number', label: 'Phone Number', type: 'text' },
  { name: 'sex', label: 'Sex', type: 'select', options: ['', 'Male', 'Female', 'Other'] },
  { name: 'birth_date', label: 'Birth Date', type: 'date' },
  { name: 'address', label: 'Address', type: 'text' },
  { name: 'security_question', label: 'Security Question', type: 'text' },
  { name: 'answer', label: 'Answer', type: 'text' },
];

export default function Profile() {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editField, setEditField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await getProfile();
        setDetail(data);
      } catch (err) {
        setError(err.response?.data?.message || err.toString());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleEdit = (field) => {
    setEditField(field);
    setEditValue(field === 'password' ? '' : detail?.[field] || '');
    setSuccess('');
    setError('');
  };

  const handleCancel = () => {
    setEditField(null);
    setEditValue('');
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const update = { [editField]: editValue };
      await updateProfile(update);
      setSuccess('Updated successfully!');
      const { data } = await getProfile();
      setDetail(data);
      setEditField(null);
      setEditValue('');
    } catch (err) {
      setError(err.response?.data?.message || err.toString());
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-2xl font-semibold text-center">Loading…</div>;
  if (!detail) return <div className="p-8 text-2xl font-semibold text-center">Failed to load profile.</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-4 sm:p-8 mt-12">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-600 tracking-tight">My Profile</h2>
      <div className="grid gap-4">
        {fields.map(f => (
          <div key={f.name} className="bg-blue-50 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 shadow-sm">
            <div className="flex-1">
              <div className="text-xs font-semibold text-gray-500 mb-1">{f.label}</div>
              <div className="text-base font-medium text-gray-800 break-all min-h-[24px]">
                {f.name === 'password'
                  ? '••••••'
                  : detail?.[f.name] || <span className="text-gray-400">(empty)</span>}
              </div>
            </div>
            {editField === f.name ? (
              <div className="flex flex-col sm:flex-row gap-2 items-center w-full sm:w-auto mt-2 sm:mt-0">
                {f.type === 'select' ? (
                  <select
                    className="rounded-lg border px-3 py-2 text-base flex-1 focus:ring-2 focus:ring-blue-400"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                  >
                    {f.options.map(opt => (
                      <option key={opt} value={opt}>{opt || 'Select'}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="rounded-lg border px-3 py-2 text-base flex-1 focus:ring-2 focus:ring-blue-400"
                    type={f.type}
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                  />
                )}
                <button
                  className="px-4 py-2 rounded-lg bg-blue-600 text-base text-white font-bold hover:bg-blue-700 disabled:opacity-60 transition"
                  onClick={handleSave}
                  disabled={saving}
                >{saving ? 'Saving…' : 'Save'}</button>
                <button
                  className="px-4 py-2 rounded-lg border text-base font-bold hover:bg-gray-100 transition"
                  onClick={handleCancel}
                  disabled={saving}
                >Cancel</button>
              </div>
            ) : (
              <button
                className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg border text-blue-600 font-bold hover:bg-blue-100 transition text-sm"
                onClick={() => handleEdit(f.name)}
                disabled={saving}
              >
                <Pencil size={16} /> Edit
              </button>
            )}
          </div>
        ))}
        {error && <p className="text-base text-red-600 mt-4 text-center">{error}</p>}
        {success && <p className="text-base text-green-600 mt-4 text-center">{success}</p>}
      </div>
    </div>
  );
} 