
// src/hooks/useUserController.js
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as userService from '../services/userService';
import * as userApi from '../api/userApi';

export default function useUserController() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(userService.emptyFormData());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const isAdmin = currentUser?.role === 'admin';

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    setEditingUser(null);
    setError(null);
    navigate('/');
  }, [navigate]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.fetchUsers();
      setUsers(data);
    } catch (err) {
      if ([401, 403].includes(err?.response?.status)) {
        handleLogout();
        setError('請重新登入，或您沒有權限訪問。');
      } else {
        setError(`無法載入用戶資料: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, [handleLogout]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    console.log('localStorage keys:', Object.keys(localStorage));
    console.log('stored from localStorage', stored);
    if (stored) setCurrentUser(JSON.parse(stored));
    fetchUsers();
  }, [fetchUsers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    const err = userService.validateUserData(formData);
    if (err) return setError(err);

    try {
      setLoading(true);
      const payload = userService.formatToServer(formData);
      await userApi.createUser(payload);
      setFormData(userService.emptyFormData());
      fetchUsers();
    } catch (err) {
      setError(`新增用戶失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setFormData(userService.formatToForm(user));
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData(userService.emptyFormData());
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!editingUser?.id) return setError("沒有用戶ID");

    const err = userService.validateUserData(formData);
    if (err) return setError(err);

    try {
      setLoading(true);
      const payload = userService.formatToServer(formData);
      await userApi.updateUser(editingUser.id, payload);
      setFormData(userService.emptyFormData());
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(`更新失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("確定刪除？")) return;
    try {
      setLoading(true);
      await userApi.deleteUser(id);
      fetchUsers();
    } catch (err) {
      setError(`刪除失敗: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    formData,
    editingUser,
    currentUser,
    setCurrentUser,
    isAdmin,
    error,
    loading,
    handleInputChange,
    handleAddUser,
    handleEditClick,
    handleCancelEdit,
    handleUpdateUser,
    handleDeleteUser,
    handleLogout,
  };
}
