import api from './api';

export const createTask = async (taskData) => {
  const response = await api.post('/tasks', taskData);
  return response.data;
};

export const updateTask = async (id, taskData) => {
  const response = await api.put(`/tasks/${id}`, taskData);
  return response.data;
};

export const moveTask = async (id, moveData) => {
  const response = await api.put(`/tasks/${id}/move`, moveData);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await api.delete(`/tasks/${id}`);
  return response.data;
};

const taskService = {
  createTask,
  updateTask,
  moveTask,
  deleteTask,
};

export default taskService;
