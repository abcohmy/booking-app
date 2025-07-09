
// src/pages/UserPage.jsx
import React from 'react';
import useUserController from '../hooks/useUserController';
import Dashboard from '../components/Dashboard';
import UserForm from '../components/UserForm';
import UserTable from '../components/UserTable';
import SearchBar from '../components/SearchBar';

export default function UserPage() {
  const {
    users,
    formData,
    isEditing,
    isFormOpen,
    setIsFormOpen,
    page, 
    setPage,
    totalPages,
    nameSearch,
    setNameSearch,
    dateSearch,
    setDateSearch,
    currentUser,
    isAdmin,
    error,
    loading,
    showLoading,
    handleInputChange,
    handleSubmit,
    handleEditClick,
    handleCancelEdit,
    handleDeleteUser,
    handleLogout,
  } = useUserController();

  return (
    <div className='UserPage'>
      <Dashboard currentUser={currentUser} onLogout={handleLogout} />
      <div className='min-h-[40px] flex items-center justify-center'>
        {error && <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded w-full text-center'>錯誤: {error}</div>}
        {showLoading && <div className='bg-blue-100 text-blue-800 px-4 py-2 rounded w-full text-center' >載入中...</div>}
      </div>
      <div className='p-6'>
        <div className='flex items-center justify-between mb-6 h-15'>
            <div className='flex-1 mr4'>
            <SearchBar 
              nameSearch={nameSearch} 
              setNameSearch={setNameSearch} 
              dateSearch={dateSearch}
              setDateSearch={setDateSearch}
              setPage={setPage}/>
          </div>
          <div className='w-[15%] h-15 p-4'>
            <button 
              onClick={() => setIsFormOpen(true)}
              //transition=>原本藍色 懸停時會150ms平滑過渡到紅色
              className='w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition'
            >
              + 新增用戶
            </button>
           
          </div>
        
                  
        </div>

          <UserTable
            users={users}
            isAdmin={isAdmin}
            onEdit={handleEditClick}
            onDelete={handleDeleteUser}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />

      </div> 
        {isFormOpen && (
          <UserForm
            formData={formData}
            isEditing={!!isEditing}
            isAdmin={isAdmin}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={handleCancelEdit}
          />  
        )}
            
    </div>
  );
}
