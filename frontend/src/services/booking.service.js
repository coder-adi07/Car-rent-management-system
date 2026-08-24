import api from './api';

export const bookingService = {
  /**
   * Create a new booking (Customer only)
   * @param {Object} payload
   */
  async createBooking(payload) {
    return await api.post('/bookings', payload);
  },

  /**
   * Get list of bookings (Admin: all, Customer: own, Driver: assigned)
   * @param {Object} params - { status, search, page, limit }
   */
  async getAllBookings(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/bookings?${queryString}` : '/bookings';
    return await api.get(url);
  },

  /**
   * Get single booking details by ID
   * @param {string} id
   */
  async getBookingById(id) {
    return await api.get(`/bookings/${id}`);
  },

  /**
   * Update booking status (Admin only)
   * @param {string} id
   * @param {string} status - 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
   * @param {string} cancellationReason - optional
   */
  async updateBookingStatus(id, status, cancellationReason = null) {
    return await api.patch(`/bookings/${id}/status`, { status, cancellationReason });
  },

  /**
   * Assign driver to a booking (Admin only)
   * @param {string} id
   * @param {string} driverId
   */
  async assignDriver(id, driverId) {
    return await api.patch(`/bookings/${id}/assign-driver`, { driverId });
  },

  /**
   * Cancel booking (Customer for own booking, or Admin)
   * @param {string} id
   * @param {string} cancellationReason - optional
   */
  async cancelBooking(id, cancellationReason = null) {
    return await api.patch(`/bookings/${id}/cancel`, { cancellationReason });
  },
};

export default bookingService;
