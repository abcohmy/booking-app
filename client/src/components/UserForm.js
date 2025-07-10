// src/components/UserForm.jsx
import React from 'react';

export default function UserForm({
  formData,
  isEditing = false,
  isAdmin = false,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
      {/* max-w-md:隨著容器大小而改變 */}
      <div className='bg-white p-6 rounded-lg w-full max-w-md'>
        <h2 className='text-xl font-semibold text-gray-800 mb-4'>
          {isEditing ? '編輯用戶' : '新增用戶'}
          </h2>
        <form onSubmit={onSubmit} data-testid='user-form' className='space-y-4'>
          <div className='space-y-2'>
            <LabelInput
              id='name'
              label='姓名'
              type='text'
              placeholder='姓名'
              value={formData.name}
              onChange={onChange}
              required
            />

            <LabelInput
              id='phone'
              label='電話'
              type='tel'     
              pattern='09[0-9]{8}'       
              placeholder='0912345678'
              value={formData.phone}
              onChange={onChange}
              required
            />

            <LabelInput
              id='booking_time'
              label='預定時間'
              type='datetime-local'
              value={formData.booking_time}
              onChange={onChange}
              required
            />

            {isAdmin && (
              <LabelInput
                id='status'
                label='狀態'
                type='text'                
                placeholder='pending / completed / canceled'
                value={formData.status}
                onChange={onChange}
                required
              />
            )}
          </div>
          <div className='mt-4 flex items-center justify-between'>
            <button type='submit' data-testid='submit-btn'
              className='bg-blue-500 text-white px-4 h-10 rounded-md hover:bg-blue-600 transition'>
                {isEditing ? '更新用戶' : '新增用戶'}</button>

        
            <button
              type='button'
              onClick={onCancel}
              className='bg-gray-300 text-gray-800 px-4 h-10 rounded-md hover:bg-gray-400 transition'
            >
              取消編輯
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

function LabelInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  pattern,
}) {
  return (
    <div className='space-y-1'>
      <label htmlFor={id} className='block text-sm text-gray-700'>
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        pattern={pattern}
        //使用者點擊填寫時(focus)所更動的CSS, focus:outline-none=>關掉html focus時預設的藍色外框
        //focus:ring-2 =>Tailwind提供的ring視覺系統，額外一個內陰影邊框 2px ring-blue=>ring那圈的顏色
        className='w-full h-10 px-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
      />  
    </div>
  );
}