import { useCart } from '@/store/cartStore';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function Cart() {
  const { items, add, update, remove, clear } = useCart();
  const navigate = useNavigate();

  const handleIncrease = (item) => update(item.id, item.quantity + 1);
  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      update(item.id, item.quantity - 1);
    } else {
      remove(item.id);
    }
  };

  const total = items.reduce((sum, i) => sum + ((i.product?.price || 0) * (i.quantity || 1)), 0);

  const getImageUrl = (path) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    return path.startsWith('/storage/')
      ? `http://localhost:8000${path}`
      : `http://localhost:8000/storage/${path}`;
  };

  if (!items.length)
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-12 mt-12 text-center text-2xl font-semibold text-gray-500">
        <ShoppingBag size={48} className="mx-auto mb-4 text-amber-400" />
        Your cart is empty.
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-10">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-amber-700 tracking-tight">Your Cart</h2>
      <div className="space-y-8">
        {items.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 border-b pb-6 last:border-b-0">
            <img
              src={getImageUrl(item.product?.image_path)}
              alt={item.product?.name}
              className="w-32 h-32 object-cover rounded-xl border shadow"
            />
            <div className="flex-1 flex flex-col gap-2">
              <h3 className="text-2xl font-bold text-gray-800">{item.product?.name}</h3>
              <p className="text-lg text-amber-600 font-semibold">
                {item.product?.price?.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' }) ?? '—'}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <button
                  className="p-2 rounded-full border hover:bg-gray-100"
                  onClick={() => handleDecrease(item)}
                >
                  <Minus size={20} />
                </button>
                <span className="text-xl font-bold w-8 text-center">{item.quantity}</span>
                <button
                  className="p-2 rounded-full border hover:bg-gray-100"
                  onClick={() => handleIncrease(item)}
                >
                  <Plus size={20} />
                </button>
                <button
                  className="ml-4 p-2 rounded-full border hover:bg-red-100 text-red-600"
                  onClick={() => remove(item.id)}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
            <div className="text-xl font-bold text-gray-700 min-w-[100px] text-right">
              {(item.product?.price * item.quantity)?.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mt-10 border-t pt-8">
        <div className="text-2xl font-bold text-gray-800">Total:</div>
        <div className="text-3xl font-extrabold text-amber-700">
          {total.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}
        </div>
      </div>
      <div className="flex justify-end gap-4 mt-8">
        <button
          className="px-8 py-3 rounded-xl bg-amber-600 text-2xl font-bold text-white hover:bg-amber-700 transition"
          onClick={() => navigate('/checkout')}
        >
          Checkout
        </button>
        <button
          className="px-8 py-3 rounded-xl border text-2xl font-bold hover:bg-gray-100 transition"
          onClick={clear}
        >
          Clear Cart
        </button>
      </div>
    </div>
  );
}