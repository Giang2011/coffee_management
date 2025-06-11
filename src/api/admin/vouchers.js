import ax from '../axiosAdmin';

export const getVouchers     = (params)       => ax.get('/vouchers', { params });
export const createVoucher   = (data)         => ax.post('/vouchers/create', data);
export const updateVoucher   = (id, data)     => ax.put(`/vouchers/${id}/edit`, data);
export const deleteVoucher   = (id)           => ax.delete(`/vouchers/${id}`);
