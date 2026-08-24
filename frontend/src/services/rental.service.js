import api from './api';

export const rentalService = {
  /**
   * Get list of rentals (Admin: all, Customer: own, Driver: assigned)
   * @param {Object} params - { status, search, page, limit }
   */
  async getAllRentals(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/rentals?${queryString}` : '/rentals';
    return await api.get(url);
  },

  /**
   * Get single rental details by ID
   * @param {string} id
   */
  async getRentalById(id) {
    return await api.get(`/rentals/${id}`);
  },

  /**
   * Create a new rental contract from booking (Admin only)
   * @param {Object} payload - { bookingId, startMileage, startFuelLevel, notes }
   */
  async createRental(payload) {
    return await api.post('/rentals', payload);
  },

  /**
   * Update rental status (Admin only)
   * @param {string} id
   * @param {string} status - 'scheduled' | 'active' | 'completed' | 'overdue' | 'cancelled'
   */
  async updateRentalStatus(id, status) {
    return await api.patch(`/rentals/${id}/status`, { status });
  },

  /**
   * Process vehicle return for rental completion (Admin only)
   * @param {string} id
   * @param {Object} payload - { actualReturnDate, endMileage, endFuelLevel, additionalCharges, discount, damageReport, notes }
   */
  async returnRental(id, payload) {
    return await api.patch(`/rentals/${id}/return`, payload);
  },
};

export default rentalService;
