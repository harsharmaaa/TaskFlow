import api from './api';

const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
};

const markNotificationAsRead = async (id) => {
  const response = await api.put(`/notifications/${id}/read`);
  return response.data;
};

const markAllNotificationsAsRead = async () => {
  const response = await api.put('/notifications/read-all');
  return response.data;
};

const notificationService = {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};

export default notificationService;
