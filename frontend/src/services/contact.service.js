import api from './api';

const contactService = {
  // Public: Submit a contact message
  async submitMessage(data) {
    return await api.post('/contact', data);
  },

  // Admin: Get all contact messages
  async getAllMessages(params = {}) {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.page) query.append('page', params.page);
    if (params.limit) query.append('limit', params.limit);
    return await api.get(`/contact?${query.toString()}`);
  },

  // Admin: Get single message by ID
  async getMessageById(id) {
    return await api.get(`/contact/${id}`);
  },

  // Admin: Update message status
  async updateMessageStatus(id, status, adminNote = '') {
    return await api.patch(`/contact/${id}/status`, { status, adminNote });
  },

  // Admin: Delete a message
  async deleteMessage(id) {
    return await api.delete(`/contact/${id}`);
  },

  // Admin: Reply to a message
  async replyToMessage(id, reply) {
    return await api.post(`/contact/${id}/reply`, { reply });
  },
};

export default contactService;
