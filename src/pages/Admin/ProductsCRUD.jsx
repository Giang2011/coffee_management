import { useEffect, useState } from 'react';
import { adminProductApi as productApi, adminCategoryApi as categoryApi } from '@/api';
import { Pencil, Trash2, Plus, X, CheckCircle, Upload } from 'lucide-react';

/**
 * ADMIN – CRUD Sản phẩm
 * Hiển thị cột ID chạy tuần tự (không lấy từ API)
 */
export default function ProductsCRUD() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null | productObj
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image: null
  });
  const [previewImage, setPreviewImage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  /* -------------------- fetch -------------------- */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        productApi.getProducts(),
        categoryApi.getCategories()
      ]);
      setProducts(Array.isArray(productsRes.data.data) ? productsRes.data.data : productsRes.data);
      setCategories(Array.isArray(categoriesRes.data.data) ? categoriesRes.data.data : categoriesRes.data);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchData(); }, []);

  /* -------------------- modal helpers ----------------- */
  const openAdd = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category_id: '',
      image: null
    });
    setPreviewImage('');
    setEditing(null);
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const openEdit = (p) => {
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock_quantity,
      category_id: p.category_id,
      image: null
    });
    setPreviewImage(p.image_url || '');
    setEditing(p);
    setModalOpen(true);
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setSuccess('');
    setFormData(prev => ({ ...prev, image: null }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  /* -------------------- submit ------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Kiểm tra ảnh khi thêm mới
    if (!editing && !formData.image) {
      setError('Vui lòng chọn ảnh sản phẩm!');
      return;
    }

    // Validate numbers
    if (parseFloat(formData.price) < 0 || parseFloat(formData.stock) < 0) {
      setError('Giá và số lượng phải lớn hơn hoặc bằng 0');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', parseFloat(formData.price));
      formDataToSend.append('stock_quantity', parseInt(formData.stock));
      formDataToSend.append('category_id', parseInt(formData.category_id));

      // Chỉ gửi image nếu là File
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
        console.log('Image file:', formData.image);
      } else {
        console.log('Image is not a File:', formData.image);
      }

      if (editing) await productApi.updateProduct(editing.id, formDataToSend);
      else await productApi.createProduct(formDataToSend);

      setSuccess('Thành công!');
      setTimeout(() => {
        closeModal();
        fetchData();
      }, 1000);
    } catch (err) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.toString());
    }
  };

  /* -------------------- delete ----------------------- */
  const handleDelete = async (id) => {
    if (!confirm('Xoá sản phẩm này?')) return;
    await productApi.deleteProduct(id);
    await fetchData();
    alert('Đã xoá sản phẩm!');
  };

  /* -------------------- filter ----------------------- */
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category_id === parseInt(selectedCategory));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Product Management</h2>
        <button onClick={openAdd} className="flex items-center gap-1 rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700">
          <Plus size={16} /> Add New
        </button>
      </div>

      {/* filter */}
      <div className="mb-4">
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded border px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-600"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
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
                <th className="px-4 py-2 text-left">Category</th>
                <th className="px-4 py-2 text-left">Price</th>
                <th className="px-4 py-2 text-left">Stock</th>
                <th className="px-4 py-2 w-24 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((p, idx) => (
                <tr key={p.id ?? idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">
                    {categories.find(c => c.id === p.category_id)?.name || 'N/A'}
                  </td>
                  <td className="px-4 py-2">{p.price?.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}</td>
                  <td className="px-4 py-2">{p.stock_quantity}</td>
                  <td className="px-4 py-1.5 flex gap-2">
                    <button onClick={() => openEdit(p)} className="text-amber-600 hover:text-amber-800"><Pencil size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-4 text-center text-gray-500">No data.</td></tr>
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
              <h3 className="text-lg font-semibold">{editing ? 'Edit' : 'Add'} Product</h3>
              <button type="button" onClick={closeModal}><X size={20} /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter product name"
                  className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter product description"
                  rows="3"
                  className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    placeholder="Enter price"
                    className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="Enter stock quantity"
                    className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
                >
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <div className="mt-1 flex items-center gap-4">
                  {previewImage && (
                    <img src={previewImage} alt="Preview" className="h-20 w-20 object-cover rounded" />
                  )}
                  <label className="flex cursor-pointer items-center gap-2 rounded border px-3 py-2 hover:bg-gray-50">
                    <Upload size={16} />
                    <span className="text-sm">Choose image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
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
