import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// 設定後端基礎URL
// Express 假設設在 http://localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/bookings'; //Express API 路徑前綴為 /bookings

function App() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({name:'',phone:'', booking_time:''});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => { // JS中瀏覽器的發送網路請求
    setLoading(true); // 同載入中功能
    setError(null); //清除上次錯誤訊息
    try {
      //fetch沒寫預設get fetch接收網路請求會接續router做處理 結果回傳(response)
      const response = await axios.get(`${API_BASE_URL}`);
      setUsers(response.data);
    } catch (err){
      console.error("Fetch users failed:", err);
      setError(`無法載入用戶資料。錯誤: ${err.response?.data?.message || err.message}`);
    } finally{
      setLoading(false);
    }
  }

    useEffect(() => { // render以外的雜事交給useEffect
      fetchUsers();
    }, []); //空依賴振烈表示此只在首次渲染執行


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
        await axios.post(`${API_BASE_URL}`, formData);
        setFormData({name:'',phone:'', booking_time:''});
        fetchUsers();
      } catch (err){
        console.error("Add user failed:", err);
        setError(`新增用戶失敗。錯誤: ${err.response?.data?.message || err.message}`);
      } finally{
        setLoading(false);
      }
    };

    //3 編輯用戶 (設定編輯狀態)
    const handleEditClick = (user) => {
      setEditingUser(user);

      //時間不改預設是ISO 8601 UTC 會與input的datetime-local不符(不同時區) 再改的時候就不會顯示出來 所以得改
      let formattedBookingTime = '';
      if (user.booking_time && typeof user.booking_time === 'string'){
        const dateObj = new Date(user.booking_time);

        if (!isNaN(dateObj.getTime())) { //getTime()無效傳回NaN
          const year = dateObj.getFullYear();
          const month = String(dateObj.getMonth() + 1).padStart(2, '0'); //JS的奇怪設定 月從0開始
          const day = String(dateObj.getDate()).padStart(2, '0'); 
          const hours = String(dateObj.getHours()).padStart(2, '0'); 
          const minutes = String(dateObj.getMinutes()).padStart(2, '0'); 
          formattedBookingTime = `${year}-${month}-${day}T${hours}:${minutes}`;
        } else{
          console.warn ('Invalid Date string received:', user.booking_time);
        }
      }


      setFormData({name: user.name, phone: user.phone, booking_time: formattedBookingTime});
    };

    // 取消編輯
    const handleCancelEdit = () => {
      setEditingUser(null);
      setFormData({name:'', phone:'', booking_time:''});
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
      try{
        await axios.put(`${API_BASE_URL}/${editingUser.id}`, formData);
        setFormData({name:'',phone:'', booking_time:''});
        setEditingUser(null); 
        fetchUsers();
      } catch (err){
        console.error("Update user failed:", err);
        setError("更新用戶失敗，請檢察輸入或後端服務。");
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
        await axios.delete(`${API_BASE_URL}/${userId}`);
        fetchUsers();
      } catch (err){
        console.error("Delete user failed:", err);
        setError("刪除用戶失敗，請檢查後端服務。");
      } finally {
        setLoading(false);
      }
    };

  return (
    <div className='App'>
      <header className='App-header'>
        <h1>用戶管理介面</h1>
      </header>
      <main>
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
                  </tr>
                </thead>
                <tbody>
              {users.map((user) =>  {
                  //booking_time格式化
                  let displayBookingTime = '未設定';
                  if (user.booking_time){
                    try {
                      const bookingDate = new Date(user.booking_time);
                      if (!isNaN(bookingDate.getTime())){
                        //格式化成地區完整日期時間
                        displayBookingTime = bookingDate.toLocaleDateString('zh-tw', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        });
                      } else{
                        displayBookingTime = '日期無效';
                      }
                    } catch (e){
                      console.error("日期解析失敗:", user.booking_time,e);
                      displayBookingTime = '日期解析錯誤';
                    }
                  }
                
                return (
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>{displayBookingTime}</td>
                    <td>
                      <button onClick={() => handleEditClick(user)}>編輯</button>
                      <button onClick={() => handleDeleteUser(user.id)} style={{marginLeft: '5px'}}>刪除</button>
                    </td>
                  </tr>
              );
              })}
            </tbody>
          </table>
          )}
        </section>
      </main>

    </div>
  );
}

export default App;
