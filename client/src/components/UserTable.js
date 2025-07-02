
// src/components/UserTable.jsx
import React from 'react';
import { formatForDisplay } from '../utils/time';

export default function UserTable({ users, isAdmin, onEdit, onDelete, page, setPage, totalPages}) {
  if (!users.length) return <p>目前沒有用戶。</p>;

  return (
    <section className='user-list'>
      {/* text-2xl=>兩倍大小 font-bold文字加粗, mb-4=margin-bottom:1rem */}
      <h2 className='text-2xl font-bold mb-4'>所有用戶</h2>
      {/* overflow-x-auto 水平卷軸自動出現 */}
      <div className='max-h-[500px] overflow-x-auto overflow-y-auto'>
        {/* min-w-full =>最小寬度為容器寬 border:加邊框 border-gray-300邊框顏色灰300 text-sm縮小一級 */}
        <table className='min-w-full border border-gray-300 text-sm rounded-lg shadow-md'>
          {/* 背景為gray-100 */}
          <thead className='bg-gray-100'>
            <tr>
              {/* px-4:padding left/right: 1rem py-2:padding bottom/top:0.5rem border-b底部邊框 text-left文字靠左 */}
              <TableHeader>姓名</TableHeader>
              <TableHeader>預約時間</TableHeader>
              {isAdmin && <TableHeader>電話</TableHeader>}
              {isAdmin && <TableHeader>狀態</TableHeader>}
              {isAdmin && <TableHeader>操作</TableHeader>}
            </tr>
          </thead>
          <tbody >
            {users.map((user) => {

              return (
              // odd:bg-white交錯列基數列底色白 even:bg-gray-50交錯列偶數列底色灰
              <tr key={user.booking_id} className='hover:bg-gray-100 odd:bg-white even:bg-gray-50'>
                <TableCell>{user.name}</TableCell>
                <TableCell>{formatForDisplay(user.booking_time)}</TableCell>
                
                {isAdmin && <TableCell>{user.phone}</TableCell>}
                {isAdmin && <TableCell>{user.status}</TableCell>}
                {isAdmin && (
                  // space-x-2 子元素水平間距0.5rem hover:underline => 滑鼠移上去有底線
                  <td className='px-4 py-2 border-b space-x-2'>
                    <button onClick={() => onEdit(user)} className='text-blue-600 hover:underline'>編輯</button>
                    <button
                      onClick={() => onDelete(user.booking_id)}
                      className='text-red-600 hover:underline'
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
      </div>
      {/* mt-4:margin top: 1rem flex:flex box rounded:圓角(預設為rounded-md) disabled:opacity-50被disabled透明度降一半*/}
      <div className='mt-4 flex items-center justify-between'>
        <button disabled={page===1} 
            onClick={() => setPage(p => p-1)}
            className='px-4 py-1 border rounded disabled:opacity-50'
            >前一頁</button>
        <span className='text-sm text-gray-700'> page {page} / {totalPages} </span>
        <button disabled={page===totalPages} 
          onClick={() => setPage(p=>p+1)}
          className='px-4 py-1 border rounded disabled:opacity-50'>下一頁</button>
      </div>
    </section>
  );
}

//{children} = const children = props.children} JS的解構
function TableHeader({children}) {
  return (
  <th className='px-4 py-2 border-b text-left text-gray-800'>{children}</th>
  );
}

function TableCell({children}) {
  return (
    <td className='px-4 py-2 border-b'>{children}</td>
  );
}