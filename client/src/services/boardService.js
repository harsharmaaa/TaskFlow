import api from './api';

export const getBoards = async () => {
  const response = await api.get('/boards');
  return response.data;
};

export const createBoard = async (boardData) => {
  const response = await api.post('/boards', boardData);
  return response.data;
};

export const getBoardById = async (id) => {
  const response = await api.get(`/boards/${id}`);
  return response.data;
};

export const updateBoard = async (id, boardData) => {
  const response = await api.put(`/boards/${id}`, boardData);
  return response.data;
};

export const deleteBoard = async (id) => {
  const response = await api.delete(`/boards/${id}`);
  return response.data;
};

export const addMember = async (boardId, memberData) => {
  const response = await api.post(`/boards/${boardId}/members`, memberData);
  return response.data;
};

export const updateMemberRole = async (boardId, userId, roleData) => {
  const response = await api.put(`/boards/${boardId}/members/${userId}`, roleData);
  return response.data;
};

export const removeMember = async (boardId, userId) => {
  const response = await api.delete(`/boards/${boardId}/members/${userId}`);
  return response.data;
};

const boardService = {
  getBoards,
  createBoard,
  getBoardById,
  updateBoard,
  deleteBoard,
  addMember,
  updateMemberRole,
  removeMember,
};

export default boardService;
