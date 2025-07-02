
/*
  (1) useUserForm - 表單邏輯
  (2) useUserList - 用戶清單 / 分頁 / 搜尋
  (3) useSession  - 管理登入登出邏輯
*/
// src/hooks/useUserController.js
import { useState } from 'react';
import { useUserForm } from './useUserForm';
import { useUserList } from './useUserList';
import { useSession } from './usesSession';

export default function useUserController() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { currentUser, isAdmin, handleLogout } = useSession();

  const {
    users,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    fetchUsers,
  } = useUserList({
    pageLimit: 15, 
    onUnauthorized: handleLogout,
    setError,
    setLoading,
  })

  const {
    formData,
    editingUser,
    isEditing,
    isFormOpen,
    setIsFormOpen,
    handleInputChange,
    handleEditClick,
    handleCancelEdit,
    handleSubmit,
  } = useUserForm({
    onSuccess: () => {
      setPage(1);
      fetchUsers();
    }, onError: (err) => setError(getErrorMessage(err)),
    setLoading,
  });

  const handleDeleteUser = async (id) =>{
    if(!window.confirm('確定刪除？')) return;
    try {
      await import('../api/userApi').then(({deleteUser}) => deleteUser(id));
      fetchUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (err, fallback = '發生未知錯誤') => {
    return err?.response?.data?.message || err?.message || fallback;
  };


  return {
    //表單
    formData,
    editingUser,
    isEditing,
    isFormOpen,
    setIsFormOpen,
    handleInputChange,
    handleEditClick,
    handleCancelEdit,
    handleSubmit,

    //用戶清單
    users, 
    page,
    setPage,
    totalPages,
    search,
    setSearch,

    fetchUsers,
    handleDeleteUser,

    //通用
    loading,
    error,    

    //登入資訊
    currentUser,
    isAdmin,
    handleLogout,
  };
}
