import api from './api';

export const driverService = {
  /**
   * Get all drivers (Admin only)
   * @param {Object} params - { status, search, city, page, limit }
   */
  async getAllDrivers(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/drivers?${queryString}` : '/drivers';
    return await api.get(url);
  },

  /**
   * Get driver profile (Driver only)
   */
  async getDriverMe() {
    return await api.get('/drivers/me');
  },

  /**
   * Update driver profile (Driver only)
   * @param {Object} data
   */
  async updateDriverMe(data) {
    return await api.put('/drivers/me', data);
  },

  /**
   * Get driver details by ID (Admin only)
   * @param {string} id
   */
  async getDriverById(id) {
    return await api.get(`/drivers/${id}`);
  },

  /**
   * Add a new driver (Admin only)
   * @param {Object} data
   */
  async createDriver(data) {
    return await api.post('/drivers', data);
  },

  /**
   * Verify/Approve driver status (Admin only)
   * @param {string} id
   * @param {Object} payload - { isVerified, status }
   */
  async verifyDriver(id, payload) {
    return await api.patch(`/drivers/${id}/verify`, payload);
  },
};

export default driverService;
