// src/components/UserForm.jsx
import React from 'react';

export default function UserForm({
  formData,
  isEditing,
  isAdmin,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <section className='user-form'>
      <h2>{isEditing ? '編輯用戶' : '新增用戶'}</h2>
      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor='name'>姓名:</label>
          <input
            type='text'
            id='name'
            name='name'
            placeholder='姓名'
            value={formData.name}
            onChange={onChange}
            required
          />

          <label htmlFor='phone'>電話:</label>
          <input
            type='tel'
            id='phone'
            name='phone'
            placeholder='0912345678'
            pattern='09[0-9]{8}'
            value={formData.phone}
            onChange={onChange}
            required
          />

          <label htmlFor='booking_time'>預定時間:</label>
          <input
            type='datetime-local'
            id='booking_time'
            name='booking_time'
            value={formData.booking_time}
            onChange={onChange}
            required
          />

          {isAdmin && (
            <>
              <label htmlFor='status'>狀態:</label>
              <input
                type='text'
                id='status'
                name='status'
                placeholder='pending / completed / canceled'
                value={formData.status}
                onChange={onChange}
                required
              />
            </>
          )}
        </div>

        <button type='submit'>{isEditing ? '更新用戶' : '新增用戶'}</button>

        {isEditing && (
          <button
            type='button'
            onClick={onCancel}
            style={{ marginLeft: '10px' }}
          >
            取消編輯
          </button>
        )}
      </form>
    </section>
  );
}
