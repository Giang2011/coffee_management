import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productApi } from '@/api';
import { useCart } from '@/store/cartStore';
import { ShoppingCart } from 'lucide-react';

/**
 * Trang danh sách sản phẩm – an toàn trước mọi cấu trúc API.
 */
export default function Products() {
  const [products, setProducts] = useState([]);      // luôn là mảng
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ last_page: 1 });

  const [searchParams, setSearchParams] = useSearchParams();
  const addToCart = useCart((s) => s.add);

  const page   = Number(searchParams.get('page')   || 1);
  const search =          searchParams.get('search') || '';

  /* Fetch mỗi khi page / search đổi */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await productApi.getProducts({ page, search, per_page: 8 });

        // --------- Phần lấy list & meta an toàn ---------
        const body = res?.data ?? {};
        const list = Array.isArray(body.data) ? body.data
                   : Array.isArray(body.products) ? body.products
                   : Array.isArray(body) ? body
                   : [];
        setProducts(list);

        // meta: Laravel resource thường ở body.meta
        setMeta(body.meta || { last_page: 1 });
      } catch (err) {
        console.error(err);
        setProducts([]);
        setMeta({ last_page: 1 });
      } finally {
        setLoading(false);
      }
    })();
  }, [page, search]);

  /* Submit ô search */
  const handleSearch = (e) => {
    e.preventDefault();
    const keyword = e.target.search.value.trim();
    setSearchParams({ search: keyword, page: 1 });
  };

  const changePage = (p) => setSearchParams({ search, page: p });

  return (
    <div className="space-y-8">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex max-w-md gap-2">
        <input
          name="search"
          defaultValue={search}
          placeholder="Tìm kiếm sản phẩm..."
          className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
        />
        <button className="rounded bg-amber-600 px-4 py-2 font-semibold text-white hover:bg-amber-700">
          Tìm
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
                  src={p.image_url || '/placeholder.png'}
                  alt={p.name}
                  className="h-40 w-full object-cover group-hover:scale-105 transition-transform"
                />
              </Link>
              <div className="p-3 flex flex-1 flex-col">
                <h3 className="font-semibold line-clamp-2 flex-1">{p.name}</h3>
                <p className="mt-1 text-amber-600 font-bold">
                  {p.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) ?? '—'}
                </p>
                <button
                  onClick={() => addToCart({ ...p, quantity: 1 })}
                  className="mt-2 inline-flex items-center gap-2 rounded bg-amber-600 px-3 py-1.5 text-sm text-white hover:bg-amber-700"
                >
                  <ShoppingCart size={16} /> Thêm vào giỏ
                </button>
              </div>
            </div>
          ))}
          {!products.length && !loading && (
            <p className="col-span-full text-center text-gray-500">Không tìm thấy sản phẩm.</p>
          )}
        </div>
      )}

      {/* Pagination */}
      {meta.last_page > 1 && (
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
      )}
    </div>
  );
}
