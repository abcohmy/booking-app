
// src/api/userApi.js
import axiosInstance from '../utils/axiosInstance';

export const fetchUsers = async () => {
  const res = await axiosInstance.get('/bookings');
  return res.data;
};

export const createUser = async (data) => {
  const res = await axiosInstance.post('/bookings', data);
  return res.data;
};

export const updateUser = async (id, data) => {
  const res = await axiosInstance.put(`/bookings/${id}`, data);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await axiosInstance.delete(`/bookings/${id}`);
  return res.data;
};
