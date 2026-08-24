import api from './api';

export const paymentService = {
  /**
   * Create a new payment for a booking (Customer only)
   * @param {Object} payload - { bookingId, amount, paymentMethod, transactionId, notes }
   */
  async createPayment(payload) {
    return await api.post('/payments', payload);
  },

  /**
   * Get all payments (Admin: all, Customer: own)
   * @param {Object} params - { status, search, page, limit }
   */
  async getAllPayments(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/payments?${queryString}` : '/payments';
    return await api.get(url);
  },

  /**
   * Get single payment details by ID
   * @param {string} id
   */
  async getPaymentById(id) {
    return await api.get(`/payments/${id}`);
  },

  /**
   * Update payment status (Admin only)
   * @param {string} id
   * @param {string} status - 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
   */
  async updatePaymentStatus(id, status) {
    return await api.patch(`/payments/${id}/status`, { status });
  },

  /**
   * Refund a payment (Admin only)
   * @param {string} id
   * @param {string} refundReason
   */
  async refundPayment(id, refundReason = null) {
    return await api.post(`/payments/${id}/refund`, { refundReason });
  },

  /**
   * Cancel payment (Customer for own or Admin)
   * @param {string} id
   */
  async cancelPayment(id) {
    return await api.patch(`/payments/${id}/cancel`);
  },
};

export default paymentService;
