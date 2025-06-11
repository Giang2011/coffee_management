import { useEffect, useState } from 'react';
import { getOrders } from '@/api/orders';
import ax from '@/api/axiosClient';

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelingId, setCancelingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orderDetail, setOrderDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getOrders();
      setOrders(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      setError('Could not fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    setCancelingId(orderId);
    try {
      await ax.put(`/orders/${orderId}/cancel`);
      await fetchOrders();
    } catch (err) {
      alert('Failed to cancel order.');
    } finally {
      setCancelingId(null);
    }
  };

  const openDetail = async (orderId) => {
    setDetailLoading(true);
    setModalOpen(true);
    try {
      const { data } = await ax.get(`/orders/${orderId}`);
      setOrderDetail(data);
    } catch {
      setOrderDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setOrderDetail(null);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-amber-700 tracking-tight">My Orders</h2>
      {loading ? <div>Loading…</div> : error ? <div className="text-red-600">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order, idx) => (
                <tr key={order.id}>
                  <td className="px-4 py-2">{idx + 1}</td>
                  <td className="px-4 py-2">{order.order_date ? new Date(order.order_date).toLocaleString() : ''}</td>
                  <td className="px-4 py-2">{Number(order.total || 0).toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}</td>
                  <td className="px-4 py-2">{order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : '—'}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button
                      onClick={() => openDetail(order.id)}
                      className="rounded bg-amber-600 px-3 py-1 text-white font-semibold hover:bg-amber-700"
                    >
                      Details
                    </button>
                    {order.status && order.status.toLowerCase() === 'pending' && (
                      <button
                        onClick={() => handleCancel(order.id)}
                        className="rounded bg-red-600 px-3 py-1 text-white font-semibold hover:bg-red-700"
                        disabled={cancelingId === order.id}
                      >
                        Cancel
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="text-center text-gray-500 py-4">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal chi tiết đơn hàng */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
          <div className="bg-white rounded-lg p-6 shadow w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Order Details</h3>
            {detailLoading ? <div>Loading…</div> : orderDetail ? (
              <div className="space-y-3">
                <div><b>Date:</b> {orderDetail.order_date ? new Date(orderDetail.order_date).toLocaleString() : ''}</div>
                <div><b>Status:</b> {orderDetail.status}</div>
                <div><b>Total:</b> {Number(orderDetail.total || 0).toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}</div>
                {orderDetail.discount && <div><b>Discount:</b> {orderDetail.discount}%</div>}
                {orderDetail.final_total && <div><b>Final Total:</b> {Number(orderDetail.final_total).toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}</div>}
                <div><b>Products:</b>
                  <ul className="list-disc ml-6">
                    {(orderDetail.products || []).map((p, i) => (
                      <li key={i}>{p.name} x{p.quantity} <span className="text-gray-500">({Number(p.price).toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })})</span></li>
                    ))}
                  </ul>
                </div>
                {orderDetail.voucher && (
                  <div><b>Voucher:</b> {orderDetail.voucher.code} ({orderDetail.voucher.discount_percent}% off)</div>
                )}
                {orderDetail.delivery_info && (
                  <div><b>Delivery:</b> {orderDetail.delivery_info.recipient_name}, {orderDetail.delivery_info.phone_number}, {orderDetail.delivery_info.address}</div>
                )}
                {orderDetail.payment_info && (
                  <div><b>Payment:</b> {orderDetail.payment_info.payment_method?.name || ''} {orderDetail.payment_info.amount ? `- ${Number(orderDetail.payment_info.amount).toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}` : ''}</div>
                )}
              </div>
            ) : <div>Could not load order details.</div>}
            <div className="flex justify-end mt-6">
              <button onClick={closeModal} className="px-4 py-2 rounded border">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 