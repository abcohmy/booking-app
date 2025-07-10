import { useState, useEffect, useCallback } from "react";
import * as userApi from '../api/userApi';

export function useUserList({pageLimit = 15, onUnauthorized, setError, setLoading}){
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [nameSearch, setNameSearch] = useState('');
  const [dateSearch, setDateSearch] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userApi.fetchUsers(nameSearch, dateSearch, sortBy, page, pageLimit);
      setUsers(data.data);
      setTotalPages(data.totalPages);
    } catch (err) {
      if ([401, 403].includes(err?.response?.status)){
        // 等同 if (typeof onUnauthorized === 'function') onUnauthorized();
        onUnauthorized?.();
      } else {
        setError(err?.response?.data?.message || err?.message || '發生未知錯誤');
      }
    } finally {
      setLoading(false);
    }
  }, [nameSearch, dateSearch, sortBy, page, pageLimit, onUnauthorized, setError, setLoading]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    page,
    setPage,
    totalPages,
    nameSearch,
    setNameSearch,
    dateSearch,
    setDateSearch,
    sortBy,
    setSortBy,
    fetchUsers,
  };


}