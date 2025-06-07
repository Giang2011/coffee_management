import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { productApi } from '@/api';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await productApi.getProducts({ per_page: 4 });
        // Tuỳ cấu trúc trả về: lấy mảng sản phẩm 1 cách an toàn
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        setProducts(list);
      } catch (err) {
        console.error('Fetch products error:', err);
        setProducts([]); // fallback rỗng để tránh map undefined
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[url('/banner-coffee.jpg')] bg-cover bg-center h-72 flex items-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
            Thưởng thức hương vị cà phê đặc biệt mỗi ngày
          </h1>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 font-semibold hover:bg-amber-700 transition"
          >
            Khám phá ngay <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Sản phẩm nổi bật */}
      <section className="px-4 lg:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Sản phẩm nổi bật</h2>
          <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium">
            Xem tất cả
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {(products || []).map((p) => (
              <Link
                to={`/products/${p.id}`}
                key={p.id}
                className="group rounded-xl bg-white shadow hover:shadow-lg transition overflow-hidden"
              >
                <img
                  src={p.image_url || '/placeholder.png'}
                  alt={p.name}
                  className="h-40 w-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">{p.name}</h3>
                  <p className="mt-2 text-amber-600 font-bold">
                    {p.price?.toLocaleString('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }) ?? '—'}
                  </p>
                </div>
              </Link>
            ))}
            {!products?.length && (
              <p className="col-span-full text-center text-gray-500">Chưa có sản phẩm.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
