import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '@/api/products';
import { useCart } from '@/store/cartStore';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const addToCart = useCart((s) => s.add);
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getProduct(id);
        setProduct(data);
      } catch (err) {
        setError('Product not found or failed to load.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const getImageUrl = (path) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    return path.startsWith('/storage/')
      ? `http://localhost:8000${path}`
      : `http://localhost:8000/storage/${path}`;
  };

  if (loading) return <div className="p-8 text-2xl font-semibold text-center">Loading…</div>;
  if (error || !product) return <div className="p-8 text-2xl font-semibold text-center text-red-600">{error || 'Product not found.'}</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10 flex flex-col md:flex-row gap-10">
      <div className="flex-1 flex flex-col items-center justify-center">
        <img
          src={getImageUrl(product.image_path)}
          alt={product.name}
          className="w-full max-w-xs h-80 object-cover rounded-xl border shadow mb-4"
        />
        <button
          className={`w-full mt-4 px-6 py-3 rounded-xl bg-amber-600 text-2xl font-bold text-white flex items-center justify-center gap-3 hover:bg-amber-700 transition ${adding ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={async () => {
            setAdding(true);
            setAddMsg('');
            try {
              await addToCart({ product_id: product.id, quantity: 1 });
              setAddMsg('Added to cart!');
            } catch (e) {
              setAddMsg('Failed to add.');
            } finally {
              setAdding(false);
              setTimeout(() => setAddMsg(''), 1200);
            }
          }}
          disabled={adding}
        >
          <ShoppingCart size={28} /> Add to Cart
        </button>
        {addMsg && (
          <span className="text-base text-green-600 mt-1">{addMsg}</span>
        )}
        <button
          className="w-full mt-2 px-6 py-2 rounded-xl border text-lg font-semibold flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>
      <div className="flex-1 flex flex-col gap-6 justify-center">
        <h1 className="text-4xl font-extrabold text-amber-700 mb-2">{product.name}</h1>
        <p className="text-2xl font-bold text-amber-600 mb-2">
          {product.price?.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' }) ?? '—'} <span className="text-base text-gray-500">SGD</span>
        </p>
        <div className="text-lg text-gray-700 whitespace-pre-line mb-2">
          {product.description || <span className="text-gray-400">No description.</span>}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <span className="bg-gray-100 rounded px-4 py-2 text-base font-medium text-gray-600">
            Category: {product.category_name || product.category?.name || '—'}
          </span>
          <span className="bg-gray-100 rounded px-4 py-2 text-base font-medium text-gray-600">
            Stock: {product.stock_quantity ?? '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
