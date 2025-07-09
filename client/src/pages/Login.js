
import React, {useState} from 'react'; // React 在react-17前需要引入
import { useNavigate } from 'react-router-dom';
//default export 匯出的變數名字，import 時可以自己取。
import axiosInstance from '../utils/axiosInstance';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';


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
        //min-h-screen:min-height=100vh max-w-sm:384px, max-w-md:448px
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
            <div className='w-full max-w-sm bg-white p-6 rounded-lg shadow-md'>
              <h2 className='text-2xl font-semibold text-gray-800 mb-4 text-center'>登入</h2>
              {error && <p className='text-red-500 mb-2 text-sm text-center'>{error}</p>}
            <form onSubmit={handleSubmit} data-testid="login-form" className='space-y-4'>
                <div>
                    <label htmlFor='username' className='block text-sm font-medium text-gray-700 mb-1'>帳號</label>
                    <input
                        type="text"
                        name="username"
                        id="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder='請輸入帳號'
                        required
                        className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                    />
                </div>
                <div>
                    <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-1'>密碼</label>
                    {/* 父用relative讓子元素當標準用absolute去做定位，沒relative直接用absolute會直接以整個畫面為標準 */}
                    <div className='relative'>
                      <input
                          type={showPassword? 'text' : 'password'}
                          name='password'
                          id='password'
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder='請輸入密碼'
                          required
                          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                      />
                      
                      <button 
                        type='button' 
                        onClick={() => setShowPassword(prev => !prev)}
                        //right-2 => 從右邊界往內縮0.5rem, 從上邊界開始設定在高度的50%, -translate-y-1/2移動自己高度的一半 <=CSS置中對齊的常見寫法
                        className='absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:underline'>
                          {showPassword
                            ? <EyeSlashIcon className="w-5 h-5 text-blue-600" />
                            : <EyeIcon className="w-5 h-5 text-blue-600" />}
                      </button>
                    </div>
                </div>
                {/* loading = true 時變灰色 不給按 */}
                <button 
                  type='submit' 
                  disabled = {loading}
                  className={`w-full py-2 rounded-md text-white font-medium transition ${
                    loading? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue--600'
                  }`}>
                    {loading? '登入中...' : '登入'}
                </button>    
            </form>
            <div className='mt-4 text-center'>
              <button 
                onClick={() => navigate('/register')}
                className='text-sm text-blue-600 hover:underline'
                >
                  創建新帳號
              </button>
            </div>
          </div>
        </div>
    );
}

export default Login;