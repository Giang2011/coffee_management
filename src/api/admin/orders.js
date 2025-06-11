import ax from '../axiosAdmin';

export const getOrders       = (params)       => ax.get ('/orders', { params });
export const getOrder        = (id)           => ax.get (`/orders/${id}`);
export const updateStatus    = (id, statusId) => ax.put (`/orders/${id}/status`, { status_id: statusId });
