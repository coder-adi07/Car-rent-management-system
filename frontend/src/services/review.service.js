import api from './api';

export const reviewService = {
  /**
   * Create a new review for a completed booking (Customer only)
   * @param {Object} payload - { bookingId, rating, comment, car, driver }
   */
  async createReview(payload) {
    return await api.post('/reviews', payload);
  },

  /**
   * Get list of reviews (Public: published only; Admin: all or filtered)
   * @param {Object} params - { status, car, driver, page, limit }
   */
  async getAllReviews(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/reviews?${queryString}` : '/reviews';
    return await api.get(url);
  },

  /**
   * Get single review by ID
   * @param {string} id
   */
  async getReviewById(id) {
    return await api.get(`/reviews/${id}`);
  },

  /**
   * Update review content / rating (Owner or Admin)
   * @param {string} id
   * @param {Object} payload - { rating, comment }
   */
  async updateReview(id, payload) {
    return await api.put(`/reviews/${id}`, payload);
  },

  /**
   * Update review status (Admin only)
   * @param {string} id
   * @param {string} status - 'published' | 'hidden'
   */
  async updateReviewStatus(id, status) {
    return await api.patch(`/reviews/${id}/status`, { status });
  },

  /**
   * Delete a review (Owner or Admin)
   * @param {string} id
   */
  async deleteReview(id) {
    return await api.delete(`/reviews/${id}`);
  },
};

export default reviewService;
