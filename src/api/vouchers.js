import ax from './axiosClient';
export const getVoucherByCode = (code) => ax.get('/vouchers', { params: { code } });
