import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useSession() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored){
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    navigate('/');
  }, [navigate]);

  return {
    currentUser,
    isAdmin,
    handleLogout,
  };

}