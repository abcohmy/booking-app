
import React, {useState} from 'react'; // React 在react-17前需要引入
import { useNavigate } from 'react-router-dom';
//default export 匯出的變數名字，import 時可以自己取。
import axiosInstance from '../utils/axiosInstance';

//props 回傳只有一個，寫這樣比props.onLoginSuccess易讀
function Login() {
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();   

    const handleInputChange = (e) => {
        const { name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]:value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        //簡單版欄位驗證 trim在刪除空白
        if (!formData.username.trim()){
            setError('帳號不能是空白');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6){
            setError('密碼至少要6碼');
            setLoading(false);
            return;
        }


        try {
            // axios只負責request, response
            const res = await axiosInstance.post('/auth/login', {
                username: formData.username, 
                password: formData.password});
            // 密碼不能存進localStorage
            const {user, token } = res.data;
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);

            console.log("Login 成功 response:", res.data.user);
            navigate('/');
            
        } catch (error){
            console.error("Login failed:", error);
            //error為axios回覆的物件 => error.response是伺服器回應的錯誤
            setError(error.response?.data?.message || '登入失敗，請檢察帳號密碼。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='login-container'>
            <h2>登入</h2>
            {error && <p style={{color: 'red'}}>{error}</p>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor='username'>帳號:</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder='帳號'
                        required
                    />
                </div>
                <div>
                    <label htmlFor='password'>密碼:</label>
                    <input
                        type={showPassword? 'text' : 'password'}
                        name='password'
                        id='password'
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder='密碼'
                        required
                    />
                    
                    <button type='button' onClick={() => setShowPassword(prev => !prev)}>
                        {showPassword? '隱藏' : '顯示'} 密碼
                    </button>
                </div>
                {/* loading = true 時變灰色 不給按 */}
                <button type='submit' disabled = {loading}>
                    {loading? '登入中...' : '登入'}
                </button>    
            </form>
        </div>
    );
}

export default Login;