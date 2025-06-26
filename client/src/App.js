import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from './utils/axiosInstance';
import {formatToLocalDatetimeInput, formatForDisplay, toISOStringOrNull} from './utils/time';
import Login from './pages/Login';
import './App.css';

// 設定後端基礎URL
// Express 假設設在 http://localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/bookings'; //Express API 路徑前綴為 /bookings

function App() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
        name:'',
        phone:'', 
        booking_time:'',
        status:'pending',
      });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const isAdmin = currentUser?.role === 'admin';

  const handleLoginSuccess = (userData) =>{
    setCurrentUser(userData);
    setShowLogin(false);
  };

  const handleLogout = useCallback(async () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
    setEditingUser(null);
    setError(null);
  }, [setCurrentUser, setEditingUser, setError]);


  //useCallback 使之變成變數賦值
  const fetchUsers = useCallback(async () => { // JS中瀏覽器的發送網路請求
    setLoading(true); // 同載入中功能
    setError(null); //清除上次錯誤訊息
    try {
      //fetch沒寫預設get fetch接收網路請求會接續router做處理 結果回傳(response)
      const response = await axiosInstance.get(`${API_BASE_URL}`);
      setUsers(response.data);
    } catch (error){
      console.error("Fetch users failed:", error);
      // 401 Unanthorized => token 不存在或已過期
      // 403 Forbidden => 登入但權限不夠
      if (error.response?.status === 401 || error.response?.status === 403){
        handleLogout();
        setError('請重新登入，或您沒有權限訪問。');
      }else{
      setError(`無法載入用戶資料。錯誤: ${error.response?.data?.message || error.message}`);
      }
    } finally{
      setLoading(false);
    }
    // setLoading, setError, setUsers, handleLogout變動 才會重建
  }, [setLoading, setError, setUsers, handleLogout]);



    //表單輸入處理
    const handleInputChange = (e) => {
      const {name, value} = e.target;
      setFormData({...formData, [name]:value});
    };

    // 新增用戶
    const handleAddUser = async (e) => {
      e.preventDefault(); // 阻止瀏覽器預設的表單提交行為(頁面重新載入)
      setLoading(true);
      setError(null);
      try {

        if (!formData.name.trim()){
          setError('請輸入姓名。');
          return;
        }

        const phoneRegex = /^09\d{8}$/;
        if (!phoneRegex.test(formData.phone)){
          setError('請輸入有效的手機號碼(09開頭共10碼)。');
          return;
        }

        if (!formData.booking_time){
          setError('請選擇預約時間');
          return;
        }

        const dataToSend = {
          name: formData.name, 
          phone: formData.phone,
          booking_time: formData.booking_time,
        }

        await axiosInstance.post(`${API_BASE_URL}`, dataToSend);
        setFormData({name:'',phone:'', booking_time:'', status:'pending'});
        fetchUsers();
      } catch (error){
        console.error("Add user failed:", error);
        setError(`新增用戶失敗。錯誤: ${error.response?.data?.message || error.message}`);
      } finally{
        setLoading(false);
      }
    };

    //3 編輯用戶 (設定編輯狀態)
    const handleEditClick = (user) => {
      setEditingUser(user);

      //時間不改預設是ISO 8601 UTC 會與input的datetime-local不符(不同時區) 再改的時候就不會顯示出來 所以得改
      const formattedBookingTime = formatToLocalDatetimeInput(user.booking_time);

      setFormData({name: user.name, phone: user.phone, status: user.status || 'pending',booking_time: formattedBookingTime});
    };

    // 取消編輯
    const handleCancelEdit = () => {
      setEditingUser(null);
      setFormData({name:'', phone:'', booking_time:'', status:'pending'});
    };

    //3.1 提交編輯
    const handleUpdateUser = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      if (!editingUser || !editingUser.id){
        setError("沒有正在編輯的用戶ID。");
        setLoading(false);
        return;
      }

      if (!formData.name.trim()){
        setError('請輸入姓名。');
        return;
      }

      const phoneRegex = /^09\d{8}$/;
      if (!phoneRegex.test(formData.phone)){
        setError('請輸入有效的手機號碼(09開頭共10碼)。');
        return;
      }

      if (!formData.booking_time){
        setError('請選擇預約時間');
        return;
      }

      const dataToUpdate = {
        name: formData.name, 
        phone: formData.phone,
        booking_time: formData.booking_time,
        status: formData.status
      }



      try{
        await axiosInstance.put(`${API_BASE_URL}/${editingUser.id}`, dataToUpdate);
        setFormData({name:'',phone:'', booking_time:'', status:'pending'});
        setEditingUser(null); 
        fetchUsers();
      } catch (error){
        console.error("Update user failed:", error);
        setError(`更新用戶失敗，錯誤: ${error.response?.data?.message|| error.message}`);
      } finally{
        setLoading(false);
      }
    };
    
    //4. 刪除用戶
    const handleDeleteUser = async (userId) => {
      setLoading(true);
      setError(null);
      if (!window.confirm("確定要刪除此用戶嗎？")){
        setLoading(false);
        return;
      }
      try {
        await axiosInstance.delete(`${API_BASE_URL}/${userId}`);
        fetchUsers();
      } catch (error){
        console.error("Delete user failed:", error);
        setError(`刪除用戶失敗，錯誤: ${error.response?.data?.message || error.message}`);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => { // render以外的雜事交給useEffect

    const storedUser = localStorage.getItem('user');
    if (storedUser){
      setCurrentUser(JSON.parse(storedUser));
    }
    fetchUsers();
  }, [fetchUsers]); //空依賴振烈表示此只在首次渲染執行

  useEffect(() => {
    if (currentUser?.role ==='admin'){
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>用戶管理介面</h1>
        <div style={{display: 'flex', alignItems: 'center'}}>
          {currentUser? ( 
            <>
              <p style={{margin: '0 15px 0 0'}}>
                哈囉，{currentUser.username} ({currentUser.role === 'admin' ? '管理者': '一般用戶'})
              </p>
              <button onClick={handleLogout} style={{padding: '8px 15px'}}>登出</button>
            </> ): (
              <button onClick={() => setShowLogin(true)} style={{padding: '8px 15px'}}>登出</button>
            )}

        </div>
      </header>
      <main>
        {showLogin && (<Login onLoginSuccess={handleLoginSuccess}/>)}
        {error && <p style={{ color: 'red'}}>錯誤:{error}</p>}
        {loading && <p>載入中...</p>}

        <section className='user-from'>
          <h2>{editingUser ? '編輯用戶' : '新增用戶'}</h2>
          <form onSubmit={editingUser? handleUpdateUser:handleAddUser}>
            <div>
              <label htmlFor='name'>姓名:</label>
              <input 
                type='text'
                id='name'
                name='name'
                placeholder='姓名'
                value={formData.name}
                onChange={handleInputChange}
                required
              />
              <label htmlFor='phone'>電話:</label>
              {/* <small>Format: 0912345678</small> */}
              <input
                type='tel'
                id='phone'
                name='phone' 
                pattern="09[0-9]{8}"
                placeholder='0912345678'
                value={formData.phone}
                onChange={handleInputChange}
                required
                />
              <label htmlFor='booking_time'>預定時間:</label>
              <input
                type='datetime-local'
                id='booking_time'
                name='booking_time'
                value={formData.booking_time}
                onChange={handleInputChange}
                required
                />
                {isAdmin && (
                  <>
                    <label htmlFor='status'>狀態:</label>
                    <input 
                      type='text'
                      id='status'
                      name='status'
                      placeholder='pending?completed?canceled?'
                      value={formData.status}
                      onChange={handleInputChange}
                      required
                    />
                  </>
                )}
            </div>
            {/* editingUser == true時才會顯示, type=button 是要button綁死onClick 不然預設會是submit */}
            <button type='submit'>{editingUser? '更新用戶':'新增用戶'}</button>
            
            {editingUser && (<button type='button' onClick={handleCancelEdit} style={{marginLeft:'10px'}}>取消編輯</button>)}
            </form>
        </section>
        <section className='user-list'>
          <h2>所有用戶</h2>
          {users.length === 0 && !loading ? (<p>目前沒有用戶。</p>):(
            
              <table>
              {/* thead 頭鏢 */}
                <thead>
                  <tr>
                    <th>姓名</th>
                    <th>電話</th>
                    <th>預約時間</th>
                    {isAdmin && <th>狀態</th>}
                  </tr>
                </thead>
                <tbody>
              {users.map((user) =>                 
                 (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>{formatForDisplay(user.booking_time)}</td>
                    <td>
                      {isAdmin && <button onClick={() => handleEditClick(user)}>編輯</button>}
                      {isAdmin && <button onClick={() => handleDeleteUser(user.id)} style={{marginLeft: '5px'}}>刪除</button>}
                    </td>
                  </tr>
              )
              )}
            </tbody>
          </table>
          )}
        </section>
      </main>

    </div>
  );
}

export default App;
