
import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({currentUser, onLogout}){

    const navigate = useNavigate();
    return (
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
            {currentUser ? (
                <>
                    <p style={{margin: '0 15px 0 0'}}>
                        哈囉，{currentUser.username} ({currentUser.role === 'admin' ? '管理者' : '一般用戶'})
                    </p>
                    <button onClick={onLogout} style={{ padding: '8px 15px'}}>
                        登出
                    </button>
                </>
            ) : (
                <button onClick={() => navigate('/login')}>登入</button>
            ) }
        </div>
    );
}