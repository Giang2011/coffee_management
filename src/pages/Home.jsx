import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { productApi } from '@/api';
import { sampleSize } from 'lodash';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await productApi.getProducts({ per_page: 100 }); // lấy nhiều để random
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
          ? res.data
          : [];
        // Lọc sản phẩm còn hàng, random 8 sản phẩm
        const inStock = list.filter(p => (p.stock_quantity ?? 0) > 0);
        const random8 = inStock.length > 8
          ? sampleSize(inStock, 8)
          : inStock;
        setProducts(random8);
      } catch (err) {
        console.error('Fetch products error:', err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getImageUrl = (path) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    return path.startsWith('/storage/')
      ? `http://localhost:8000${path}`
      : `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className="space-y-12">
      {/* Hero banner */}
      <section className="relative overflow-hidden rounded-2xl bg-[url('/banner-coffee.jpg')] bg-cover bg-center h-72 flex items-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 px-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
            Enjoy the special taste of coffee every day
          </h1>
          <Link
            to="/products"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 font-semibold hover:bg-amber-700 transition"
          >
            Discover now <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Featured products */}
      <section className="px-4 lg:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Featured Products</h2>
          <Link to="/products" className="text-amber-600 hover:text-amber-700 font-medium">
            View all
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
                  src={getImageUrl(p.image_path)}
                  alt={p.name}
                  className="h-40 w-full object-cover group-hover:scale-105 transition-transform"
                />
                <div className="p-4">
                  <h3 className="font-semibold line-clamp-2">{p.name}</h3>
                  <p className="mt-2 text-amber-600 font-bold">
                    {p.price?.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' }) ?? '—'} <span className="text-xs text-gray-500">SGD</span>
                  </p>
                </div>
              </Link>
            ))}
            {!products?.length && (
              <p className="col-span-full text-center text-gray-500">No products yet.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
