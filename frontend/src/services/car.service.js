import api from './api';

export const carService = {
  /**
   * Get list of cars with optional filters and pagination
   * @param {Object} params - { search, brand, model, carType, type, status, minPrice, maxPrice, page, limit }
   */
  async getAllCars(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/cars?${queryString}` : '/cars';
    return await api.get(url);
  },

  /**
   * Get single car details by ID
   * @param {string} id
   */
  async getCarById(id) {
    return await api.get(`/cars/${id}`);
  },

  /**
   * Create a new car (Admin only)
   * @param {Object} carData
   */
  async createCar(carData) {
    return await api.post('/cars', carData);
  },

  /**
   * Update existing car details (Admin only)
   * @param {string} id
   * @param {Object} carData
   */
  async updateCar(id, carData) {
    return await api.put(`/cars/${id}`, carData);
  },

  /**
   * Update car status (Admin only)
   * @param {string} id
   * @param {string} status - 'available' | 'rented' | 'reserved' | 'maintenance' | 'inactive'
   */
  async updateCarStatus(id, status) {
    return await api.patch(`/cars/${id}/status`, { status });
  },

  /**
   * Delete a car (Admin only)
   * @param {string} id
   */
  async deleteCar(id) {
    return await api.delete(`/cars/${id}`);
  },
};

export default carService;
