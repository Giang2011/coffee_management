import ax from './axiosClient';

export const getOrders      = (params)           => ax.get('/orders', { params }); // admin hoặc user xem list
export const getOrder       = (id)               => ax.get(`/orders/${id}`);
export const createOrder    = (data)             => ax.post('/orders', data);      // khách checkout
export const updateOrder    = (id, data)         => ax.post(`/orders/${id}?_method=PUT`, data); // admin đổi trạng thái
export const cancelOrder    = (id)               => ax.post(`/orders/${id}/cancel`);
