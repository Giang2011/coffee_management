import { useEffect, useState } from 'react';
import { adminOrderApi, adminProductApi, adminVoucherApi } from '@/api';
const statusMap = {
  1: 'Pending',
  2: 'In Transit',
  3: 'Delivered',
  4: 'Canceled',
};

const sortOptions = [
  { value: 'date_desc', label: 'Date (Newest)' },
  { value: 'date_asc', label: 'Date (Oldest)' },
  { value: 'total_desc', label: 'Total (High to Low)' },
  { value: 'total_asc', label: 'Total (Low to High)' },
];

export default function OrdersCRUD() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await adminOrderApi.getOrders();
      setOrders(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      setError('Could not fetch orders.');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (order) => {
    setSelectedOrder(order);
    setSelectedStatus(order.status?.id || order.status_id || 1);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  const handleChangeStatus = async () => {
    if (!selectedOrder) return;
    setUpdatingId(selectedOrder.id);
    try {
      const prevStatus = selectedOrder.status?.id || selectedOrder.status_id;
      await adminOrderApi.updateStatus(selectedOrder.id, selectedStatus);
      if ((selectedStatus === 2 || selectedStatus === 3) && prevStatus !== 2 && prevStatus !== 3) {
        const { data: orderDetail } = await adminOrderApi.getOrder(selectedOrder.id);
        if (orderDetail.products) {
          for (const p of orderDetail.products) {
            if (typeof p.product_id !== 'undefined' && typeof p.quantity !== 'undefined') {
              await adminProductApi.updateProduct(p.product_id, { stock_quantity: Math.max(0, (p.stock_quantity ?? 0) - p.quantity) });
            }
          }
        }
        if (orderDetail.voucher && orderDetail.voucher.id && typeof orderDetail.voucher.max_usage === 'number') {
          await adminVoucherApi.updateVoucher(orderDetail.voucher.id, { max_usage: Math.max(0, orderDetail.voucher.max_usage - 1) });
        }
      }
      closeModal();
      await fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter + Sort logic
  let filteredOrders = orders;
  if (filterStatus !== 'all') {
    filteredOrders = filteredOrders.filter(o => (o.status?.id || o.status_id) === Number(filterStatus));
  }
  filteredOrders = [...filteredOrders].sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.order_date) - new Date(a.order_date);
    if (sortBy === 'date_asc') return new Date(a.order_date) - new Date(b.order_date);
    if (sortBy === 'total_desc') return (b.total_cost || 0) - (a.total_cost || 0);
    if (sortBy === 'total_asc') return (a.total_cost || 0) - (b.total_cost || 0);
    return 0;
  });

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-amber-700 tracking-tight">Order Management</h2>
      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <label className="flex items-center gap-2">
          <span>Status:</span>
          <select
            className="rounded border px-2 py-1"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">All</option>
            {Object.entries(statusMap).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2">
          <span>Sort by:</span>
          <select
            className="rounded border px-2 py-1"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>
      {loading ? <div>Loading…</div> : error ? <div className="text-red-600">{error}</div> : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">#</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredOrders.map((order, idx) => {
                const statusId = order.status?.id || order.status_id;
                return (
                  <tr key={order.id}>
                    <td className="px-4 py-2">{idx + 1}</td>
                    <td className="px-4 py-2">{order.user?.full_name || order.user?.email || '—'}</td>
                    <td className="px-4 py-2">{order.order_date ? new Date(order.order_date).toLocaleString() : ''}</td>
                    <td className="px-4 py-2">{order.total_cost?.toLocaleString('en-SG', { style: 'currency', currency: 'SGD' })}</td>
                    <td className="px-4 py-2">{statusMap[statusId] || '—'}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => openModal(order)}
                        className="rounded bg-amber-600 px-3 py-1 text-white font-semibold hover:bg-amber-700"
                        disabled={updatingId === order.id}
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-500 py-4">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={closeModal}>
          <div className="bg-white rounded-lg p-6 shadow w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Change Order Status</h3>
            <select
              className="w-full rounded border px-3 py-2 mb-4"
              value={selectedStatus}
              onChange={e => setSelectedStatus(Number(e.target.value))}
              disabled={updatingId === selectedOrder?.id}
            >
              {Object.entries(statusMap).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded border"
                disabled={updatingId === selectedOrder?.id}
              >
                Cancel
              </button>
              <button
                onClick={handleChangeStatus}
                className="px-4 py-2 rounded bg-amber-600 text-white font-semibold hover:bg-amber-700"
                disabled={updatingId === selectedOrder?.id}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
