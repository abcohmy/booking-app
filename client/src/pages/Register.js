
import React, {useEffect, useState, useRef} from 'react';
import {useNavigate} from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

export default function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [usernameAvailable, setUsernameAvailable] = useState(null);

    //不想要重新render(function重新執行?)就讀值時用useRef 利用.current存值
    const debounceTimer = useRef(null);
    const navigate = useNavigate();

    useEffect(()=>{
      if (!formData.username.trim()){
        setUsernameAvailable(null);
        return;
      }  

      if (debounceTimer.current) clearTimeout(debounceTimer.current);

      debounceTimer.current = setTimeout (async () => {
        try {
          const res = await axiosInstance.get('/auth/check-username', {
            params: {
              username : formData.username
            }
          });
          setError(null);
          setUsernameAvailable(res.data.available);
        } catch (err){
          console.error ('帳號檢查失敗', err);
          setError(err.response?.data?.message || '檢查帳號失敗');

          setUsernameAvailable(null);
        }

      }, 500);

    }, [formData.username]);

    const handleInputChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({
            ...prev,
            // name: key 是"name" => [name]: key是name的變數值
            [name]:value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (!formData.username.trim()){
            setError('帳號不能是空白。');
            setLoading(false);
            return;
        }

        if (formData.password.length < 6){
            setError('密碼至少要6碼');
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword){
            setError('密碼不一致。');
            setLoading(false);
            return;
        }

        try {
            await axiosInstance.post('/auth/register',{
                username: formData.username,
                password: formData.password
            });
            
            navigate('/login');
                
        } catch (err) {
            console.error("Register failed:", err);
            setError(err.response?.data?.message || '註冊失敗，請檢察帳號密碼');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100'>
          <div className='w-full max-w-sm bg-white p-6 rounded-lg shadow-md'>
            <h2 className='text-2xl font-semibold text-gray-800 mb-4 text-center'>帳號註冊</h2>
            {error && <p className='text-red-500 mb-2 text-sm text-center'>{error}</p>}
            <form onSubmit={handleSubmit} data-testid="register-form" className='space-y-4'>
                <div>
                    <RegisterLabelInput
                      id='username'
                      label='帳號'
                      type='text'
                      placeholder='用戶帳號'
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                    />

                    {formData.username && (
                      <p className={`text-sm mt-1 ${usernameAvailable === false? 'text-red-500' : 'text-green-600'}`}>
                        {usernameAvailable === false ? '此帳號已被使用' : '帳號可用'}
                      </p>
                    )}
                </div>
                    <RegisterLabelInput
                      id='password'
                      label='密碼'
                      type='password'
                      placeholder='用戶密碼'
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      showToggle
                      show={showPassword}
                      onToggle={() => setShowPassword(prev => !prev)}
                    />

                    <RegisterLabelInput
                      id='confirmPassword'
                      label='再次輸入密碼'
                      type='password'
                      placeholder='再次輸入密碼'
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      showToggle
                      show={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(prev => !prev)}
                    />
                    
                  
                <button type='submit' disabled={loading}
                // font-medium => font-weight:500
                  className={`w-full py-2 rounded-md text-white font-medium transition ${
                    loading? 'bg-gray-400 cursor-not-allowed': 'bg-blue-500 hover:bg-blue-600'}`}>
                    {loading? '創建新用戶中...': '創建新用戶'}
                </button>
            </form>
                <div className='mt-4 text-center space-y-1'>
                  <button onClick={()=> navigate('/login')}
                    className='text-sm text-blue-600 hover:underline'>
                      回登入</button>
                  
                  <br/>

                  <button onClick={()=> navigate('/')}
                    className='text-sm text-blue-600 hover:underline'
                    >回主頁</button>
              </div>
            </div>
          </div>
    );    


}

//React 中 函式元件名稱必須以大寫開頭。
function RegisterLabelInput({
  id,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  showToggle = false,
  show = false,
  onToggle = null,
}) {
  return (
    <div className='mb-4'>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700 mb-1'>
        {label}
      </label>

      <div className='relative'>
        <input
          type= {showToggle? (show ? 'text' : 'password') : type}
          id={id}
          name={id}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
        />

        {showToggle && (
          <button type='button'
          onClick={onToggle}
          className='absolute right-2 top-1/2 -translate-y-1/2 text-sm text-blue-600 hover:underline'
          >
            {show ? <EyeSlashIcon className="w-5 h-5 text-blue-600" />
                : <EyeIcon className="w-5 h-5 text-blue-600" />}
          </button>
        )}
      </div>
    </div>
  );
}