import { useEffect, useState } from 'react';
import { adminOrderApi } from '@/api';

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
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
    })();
  }, []);

  // Thống kê
  const deliveredOrders = orders.filter(o => (o.status?.id || o.status_id) === 3);
  const canceledOrders = orders.filter(o => (o.status?.id || o.status_id) === 4);
  // Lấy doanh thu giống OrdersCRUD: cộng total_cost của các đơn hàng delivered (ép kiểu số)
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + (parseFloat(o.total_cost) || 0), 0);

  // Định dạng doanh thu chuẩn SGD
  const revenueStr = totalRevenue.toLocaleString('en-SG', { style: 'currency', currency: 'SGD', minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-10 mt-12">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-blue-600 tracking-tight">Admin Dashboard</h2>
      {loading ? <div>Loading…</div> : error ? <div className="text-red-600">{error}</div> : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="bg-blue-50 rounded-xl p-8 shadow flex flex-col items-center justify-center min-h-[170px]">
            <div className="text-2xl font-bold text-orange-500 mb-4 text-center">Total Revenue</div>
            <div className="text-4xl font-extrabold text-blue-600 text-center">{revenueStr}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-8 shadow flex flex-col items-center justify-center min-h-[170px]">
            <div className="text-2xl font-bold text-orange-500 mb-4 text-center">Delivered Orders</div>
            <div className="text-4xl font-extrabold text-blue-600 text-center">{deliveredOrders.length}</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-8 shadow flex flex-col items-center justify-center min-h-[170px]">
            <div className="text-2xl font-bold text-orange-500 mb-4 text-center">Canceled Orders</div>
            <div className="text-4xl font-extrabold text-red-600 text-center">{canceledOrders.length}</div>
          </div>
        </div>
      )}
    </div>
  );
}
