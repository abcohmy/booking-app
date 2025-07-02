
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({currentUser, onLogout}){

    const navigate = useNavigate();
    return (
        // shadow-sm:輕微的陰影(視覺分層) sticky top-0 黏在頂部 z-50:z-index:50顯示順序最靠前
        <div className='w-full bg-gray-100 shadow-sm px-6 py-3 flex justify-between items-center sticky top-0 z-50'>
          {/* lg=>1.125rem(18px)  font-semibold=>font-weight: 600*/}
          <h1 className='text-lg font-semibold text-gray-700'>預約管理系統</h1>

          {/* gap-4:grids之間的空格大小 */}
          <div className='flex items-center gap-4'>
            {currentUser ? (
                <>
                    <p className='text-gray-700'>
                        哈囉，{currentUser.username} ({currentUser.role === 'admin' ? '管理者' : '一般用戶'})
                    </p>
                    <button 
                      onClick={onLogout} 
                      className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600'>
                        登出
                    </button>
                </>
            ) : (
                <>
                  <button 
                    onClick={() => navigate('/login')}
                    className='text-blue-600 hover:underline'>登入</button>
                  <button 
                    onClick={() => navigate('/register')}
                    className='text-blue-600 hover:underline'>創建新帳號</button>
                </>
            ) }
          </div>
        </div>
    );
}