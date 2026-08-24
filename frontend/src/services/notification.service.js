import api from './api';

export const notificationService = {
  /**
   * Get user's own notifications
   * @param {Object} params - { type, isRead, page, limit }
   */
  async getMyNotifications(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const queryString = queryParams.toString();
    const url = queryString ? `/notifications?${queryString}` : '/notifications';
    return await api.get(url);
  },

  /**
   * Get single notification details by ID
   * @param {string} id
   */
  async getNotificationById(id) {
    return await api.get(`/notifications/${id}`);
  },

  /**
   * Mark a single notification as read
   * @param {string} id
   */
  async markAsRead(id) {
    return await api.patch(`/notifications/${id}/read`);
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    return await api.patch('/notifications/read-all');
  },

  /**
   * Delete own notification
   * @param {string} id
   */
  async deleteNotification(id) {
    return await api.delete(`/notifications/${id}`);
  },
};

export default notificationService;
