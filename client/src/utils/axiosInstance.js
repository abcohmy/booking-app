
//前端import (REACT所使用的esm) 後端require (node.js使用的commonJs)
import axios from 'axios';

//實例instance:經過客製化的工具副本
const axiosInstance = axios.create({
    //所有請求自動加REACT_APP_API_BASE_URL
    baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
    headers: {
        /*所有請求自動加json
            MIME type (RFC 2046) => <type>/<subtype>
        */
        'Content-Type': 'application/json',
    },
});

/*
    interceptors.request => 所有從後端發送前的動作
    interceptors.response=> 所有從前端收到回應後的動作
    use(onSuccess, onError) => 攔截到要處理的function
*/
axiosInstance.interceptors.request.use ((config) => {
    //token存在localStorage但必須手動加到認證上
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token){
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
    }, (error) => {
        return Promise.reject(error);
    }
    
);

//前端export default (REACT所使用的esm) 後端module.exports (node.js使用的commonJs)
export default axiosInstance;