
// src/pages/UserPage.jsx
import React from 'react';
import useUserController from '../hooks/useUserController';
import Dashboard from '../components/Dashboard';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';

export default function UserPage() {
  const {
    users,
    formData,
    editingUser,
    currentUser,
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
  } = useUserController();

  return (
    <div className='UserPage'>
      <h1>用戶管理介面</h1>

      <Dashboard currentUser={currentUser} onLogout={handleLogout} />

      {error && <p style={{ color: 'red' }}>錯誤: {error}</p>}
      {loading && <p>載入中...</p>}

      <UserForm
        formData={formData}
        isEditing={!!editingUser}
        isAdmin={isAdmin}
        onChange={handleInputChange}
        onSubmit={editingUser ? handleUpdateUser : handleAddUser}
        onCancel={handleCancelEdit}
      />

      <UserTable
        users={users}
        isAdmin={isAdmin}
        onEdit={handleEditClick}
        onDelete={handleDeleteUser}
      />
    </div>
  );
}
