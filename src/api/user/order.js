import ax from '../axiosClient';

export const placeOrder = (data) => ax.post('/order', data); 