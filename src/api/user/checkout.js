import ax from '../axiosClient';

export const checkout = (data) => ax.post('/api/checkout', data); 