
// src/components/UserTable.jsx
import React from 'react';
import { formatForDisplay } from '../utils/time';

export default function UserTable({ users, isAdmin, onEdit, onDelete }) {
  if (!users.length) return <p>目前沒有用戶。</p>;

  return (
    <section className='user-list'>
      <h2>所有用戶</h2>
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>預約時間</th>
            {isAdmin && <th>電話</th>}
            {isAdmin && <th>狀態</th>}
            {isAdmin && <th>操作</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {

            return (
            <tr key={user.booking_id}>
              <td>{user.name}</td>
              <td>{formatForDisplay(user.booking_time)}</td>
              
              {isAdmin && <td>{user.phone}</td>}
              {isAdmin && <td>{user.status}</td>}
              {isAdmin && (
                <td>
                  <button onClick={() => onEdit(user)}>編輯</button>
                  <button
                    onClick={() => onDelete(user.booking_id)}
                    style={{ marginLeft: '5px' }}
                  >
                    刪除
                  </button>
                </td>
              )}
            </tr>
          );
        }
        )}
        </tbody>
      </table>
    </section>
  );
}
