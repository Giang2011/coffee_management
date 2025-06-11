import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi, categoryApi } from '@/api';
import { useCart } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';

/**
 * Trang danh sách sản phẩm – an toàn trước mọi cấu trúc API.
 */
export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ last_page: 1 });
  const [searchParams, setSearchParams] = useSearchParams();
  const addToCart = useCart((s) => s.add);
  const [addingId, setAddingId] = useState(null);
  const [addMsg, setAddMsg] = useState('');

  const page = Number(searchParams.get('page') || 1);
  const search = searchParams.get('search') || '';
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchInput, setSearchInput] = useState(search);

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await categoryApi.getCategories();
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setCategories(list);
      } catch {
        setCategories([]);
      }
    })();
  }, []);

  // Fetch products (search or all)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        let list = [];
        if (search) {
          // Always search first
          const resSearch = await productApi.searchProducts(search);
          list = Array.isArray(resSearch?.data?.data)
            ? resSearch.data.data
            : Array.isArray(resSearch?.data)
            ? resSearch.data
            : [];
        } else {
          // No search: fetch all products
          const res = await productApi.getProducts({});
          list = Array.isArray(res?.data?.data)
            ? res.data.data
            : Array.isArray(res?.data)
            ? res.data
            : [];
        }
        // Always filter by category on frontend if needed
        if (selectedCategory !== 'all') {
          list = list.filter(p => String(p.category_id) === String(selectedCategory));
        }
        setProducts(list);
        setMeta({ last_page: 1 });
      } catch (err) {
        setProducts([]);
        setMeta({ last_page: 1 });
      } finally {
        setLoading(false);
      }
    })();
  }, [search, selectedCategory]);

  // Xử lý submit search
  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ search: searchInput, page: 1 });
  };

  const changePage = (p) => setSearchParams({ search, page: p });

  const getImageUrl = (path) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    return path.startsWith('/storage/')
      ? `http://localhost:8000${path}`
      : `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className="space-y-8">
      {/* Search + Filter */}
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2 max-w-2xl">
        <input
          name="search"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
        >
          <option value="all">All categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button className="rounded bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700">
          Search
        </button>
      </form>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-52 rounded-xl bg-gray-200 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(products || []).map((p) => (
            <div key={p.id} className="group rounded-xl bg-white shadow hover:shadow-lg transition flex flex-col overflow-hidden">
              <Link to={`/products/${p.id}`} className="block">
                <img
                  src={getImageUrl(p.image_path)}
                  alt={p.name}
                  className="h-40 w-full object-cover group-hover:scale-105 transition-transform"
                />
              </Link>
              <div className="p-3 flex flex-1 flex-col">
                <h3 className="font-semibold line-clamp-2 flex-1">{p.name}</h3>
                <p className="mt-1 text-amber-600 font-bold">
                  {p.price?.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' }) ?? '—'} <span className="text-xs text-gray-500">SGD</span>
                </p>
                <button
                  onClick={async () => {
                    setAddingId(p.id);
                    setAddMsg('');
                    try {
                      await addToCart({ product_id: p.id, quantity: 1 });
                      setAddMsg('Added to cart!');
                    } catch (e) {
                      setAddMsg('Failed to add.');
                    } finally {
                      setAddingId(null);
                      setTimeout(() => setAddMsg(''), 1200);
                    }
                  }}
                  disabled={addingId === p.id}
                  className={`mt-2 inline-flex items-center gap-2 rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700 ${addingId === p.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                >
                  <ShoppingCart size={16} /> Add to cart
                </button>
                {addMsg && addingId === p.id && (
                  <span className="text-xs text-green-600 mt-1">{addMsg}</span>
                )}
              </div>
            </div>
          ))}
          {!products.length && !loading && (
            <p className="col-span-full text-center text-gray-500">No products found.</p>
          )}
        </div>
      )}

      {/* Pagination (nếu cần) */}
      {/* {meta.last_page > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: meta.last_page }).map((_, idx) => {
            const p = idx + 1;
            const active = p === page;
            return (
              <button
                key={p}
                onClick={() => changePage(p)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center ${active ? 'bg-amber-600 text-white' : 'hover:bg-gray-200'}`}
              >
                {p}
              </button>
            );
          })}
        </div>
      )} */}
    </div>
  );
}
