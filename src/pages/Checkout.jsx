import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi, profileApi } from '@/api/user';
import { useCart } from '@/store/cartStore';
import { voucherApi } from '@/api';

export default function Checkout() {
  const navigate = useNavigate();
  const { items: cartItems, clear } = useCart();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [payment, setPayment] = useState(1);
  const [voucherId, setVoucherId] = useState(null);
  const [address, setAddress] = useState('');
  const [useProfileAddress, setUseProfileAddress] = useState(true);
  const [profileAddress, setProfileAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [useProfilePhone, setUseProfilePhone] = useState(true);
  const [profilePhone, setProfilePhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [useProfileFullName, setUseProfileFullName] = useState(true);
  const [profileFullName, setProfileFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [voucherMessage, setVoucherMessage] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await profileApi.getProfile();
        setProfileFullName(data.full_name || '');
        setFullName(data.full_name || '');
        setProfileAddress(data.address || '');
        setAddress(data.address || '');
        setProfilePhone(data.phone_number || '');
        setPhone(data.phone_number || '');
      } catch {
        setProfileFullName('');
        setFullName('');
        setProfileAddress('');
        setAddress('');
        setProfilePhone('');
        setPhone('');
      }
    })();
    // Set static payment methods
    setPaymentMethods([
      { id: 1, name: 'Cash' },
      { id: 2, name: 'Card' },
      { id: 3, name: 'QR' },
    ]);
  }, []);

  useEffect(() => {
    if (useProfileAddress) setAddress(profileAddress);
  }, [useProfileAddress, profileAddress]);

  useEffect(() => {
    if (useProfilePhone) setPhone(profilePhone);
  }, [useProfilePhone, profilePhone]);

  useEffect(() => {
    if (useProfileFullName) setFullName(profileFullName);
  }, [useProfileFullName, profileFullName]);

  useEffect(() => {
    if (paymentMethods.length && !payment) {
      setPayment(paymentMethods[0].id);
    }
  }, [paymentMethods]);

  const total = cartItems.reduce((sum, i) => sum + ((i.product?.price || 0) * (i.quantity || 1)), 0);
  const discount = voucherInfo ? (total * (voucherInfo.discount_percent || 0) / 100) : 0;
  const totalAfterDiscount = total - discount;

  const getImageUrl = (path) => {
    if (!path) return '/placeholder.png';
    if (path.startsWith('http')) return path;
    return path.startsWith('/storage/')
      ? `http://localhost:8000${path}`
      : `http://localhost:8000/storage/${path}`;
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!cartItems.length) {
      setError('Your cart is empty.');
      return;
    }
    if (!fullName.trim()) {
      setError('Please provide your full name.');
      return;
    }
    if (!address.trim()) {
      setError('Please provide a shipping address.');
      return;
    }
    if (!phone.trim()) {
      setError('Please provide a phone number.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        payment_method_id: payment,
        delivery_info: {
          recipient_name: fullName,
          phone_number: phone,
          address,
        },
        total_cost: totalAfterDiscount,
      };
      if (voucherId) payload.voucher_id = voucherId;
      await orderApi.placeOrder(payload);
      setSuccess('Order placed successfully!');
      await clear();
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleApplyVoucher = async () => {
    setVoucherMessage('');
    setVoucherInfo(null);
    setVoucherId(null);
    if (!voucherCode.trim()) {
      setVoucherMessage('Please enter a voucher code.');
      return;
    }
    try {
      const { data } = await voucherApi.getVoucherByCode(voucherCode.trim());
      const voucher = Array.isArray(data)
        ? data.find(v => v.code.toLowerCase() === voucherCode.trim().toLowerCase())
        : data;
      if (!voucher) {
        setVoucherMessage('Voucher not found.');
        return;
      }
      setVoucherInfo(voucher);
      setVoucherId(voucher.id);
      setVoucherMessage(`Voucher applied: ${voucher.code} (${voucher.discount_percent}% off)`);
    } catch (err) {
      setVoucherMessage(err.response?.data?.message || 'Invalid voucher code.');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12">
      <h2 className="text-4xl font-extrabold mb-8 text-center text-amber-700 tracking-tight">Checkout</h2>
      <form onSubmit={handleOrder} className="space-y-8">
        {/* Cart Items */}
        <div>
          <h3 className="text-xl font-bold mb-3">Order Items</h3>
          {cartItems.length === 0 ? (
            <div className="text-gray-500">Your cart is empty.</div>
          ) : (
            <ul className="divide-y">
              {cartItems.map(item => (
                <li key={item.id} className="flex items-center gap-4 py-2">
                  <img
                    src={getImageUrl(item.product?.image_path)}
                    alt={item.product?.name}
                    className="w-16 h-16 object-cover rounded border"
                  />
                  <span className="flex-1">{item.product?.name} <span className="text-gray-500">x{item.quantity}</span></span>
                  <span className="font-semibold">{(item.product?.price * item.quantity).toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="flex justify-between mt-4 text-lg font-bold">
            <span>Total:</span>
            <span className="text-amber-700 text-2xl">{total.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}</span>
          </div>
          {voucherInfo && (
            <>
              <div className="flex justify-between mt-1 text-lg">
                <span>Discount ({voucherInfo.discount_percent}%):</span>
                <span className="text-green-700">-{discount.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}</span>
              </div>
              <div className="flex justify-between mt-1 text-lg font-bold">
                <span>Total after discount:</span>
                <span className="text-amber-700 text-2xl">{totalAfterDiscount.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}</span>
              </div>
            </>
          )}
        </div>
        {/* Voucher */}
        <div>
          <h3 className="text-xl font-bold mb-3">Voucher</h3>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              className="flex-1 rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
              value={voucherCode}
              onChange={e => setVoucherCode(e.target.value)}
              placeholder="Enter voucher code"
            />
            <button
              type="button"
              className="rounded bg-amber-600 px-4 py-2 text-white font-semibold hover:bg-amber-700"
              onClick={handleApplyVoucher}
              disabled={loading}
            >
              Apply
            </button>
          </div>
          {voucherMessage && (
            <div className={voucherInfo ? 'text-green-600' : 'text-red-600'}>{voucherMessage}</div>
          )}
        </div>
        {/* Full Name */}
        <div>
          <h3 className="text-xl font-bold mb-3">Full Name</h3>
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2">
              <input type="radio" checked={useProfileFullName} onChange={() => setUseProfileFullName(true)} />
              Use profile full name
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={!useProfileFullName} onChange={() => setUseProfileFullName(false)} />
              Enter new full name
            </label>
          </div>
          <input
            type="text"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
            value={useProfileFullName ? profileFullName : fullName}
            onChange={e => setFullName(e.target.value)}
            placeholder="Enter full name"
            disabled={useProfileFullName}
            required
          />
        </div>
        {/* Address */}
        <div>
          <h3 className="text-xl font-bold mb-3">Shipping Address</h3>
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2">
              <input type="radio" checked={useProfileAddress} onChange={() => setUseProfileAddress(true)} />
              Use profile address
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={!useProfileAddress} onChange={() => setUseProfileAddress(false)} />
              Enter new address
            </label>
          </div>
          <input
            type="text"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
            value={useProfileAddress ? profileAddress : address}
            onChange={e => setAddress(e.target.value)}
            placeholder="Enter shipping address"
            disabled={useProfileAddress}
            required
          />
        </div>
        {/* Phone Number */}
        <div>
          <h3 className="text-xl font-bold mb-3">Phone Number</h3>
          <div className="flex items-center gap-4 mb-2">
            <label className="flex items-center gap-2">
              <input type="radio" checked={useProfilePhone} onChange={() => setUseProfilePhone(true)} />
              Use profile phone number
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={!useProfilePhone} onChange={() => setUseProfilePhone(false)} />
              Enter new phone number
            </label>
          </div>
          <input
            type="text"
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
            value={useProfilePhone ? profilePhone : phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="Enter phone number"
            disabled={useProfilePhone}
            required
          />
        </div>
        {/* Payment Method */}
        <div>
          <h3 className="text-xl font-bold mb-3">Payment Method</h3>
          <select
            className="w-full rounded border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600"
            value={payment}
            onChange={e => setPayment(Number(e.target.value))}
            required
          >
            {paymentMethods.map(m => (
              <option key={m.id} value={m.id}>{m.name || m.label}</option>
            ))}
          </select>
        </div>
        {/* Error/Success */}
        {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
        {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
        {/* Submit */}
        <button
          type="submit"
          className="w-full rounded bg-amber-600 py-3 text-xl font-bold text-white hover:bg-amber-700 transition disabled:opacity-60"
          disabled={loading || cartItems.length === 0}
        >
          {loading ? 'Placing Order…' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}
