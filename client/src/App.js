
import React from 'react';
import {Routes, Route, Navigate} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import UserPage from './pages/UserPage';

function App(){

    return (
                        

        <div className='App'>

            <Routes>
                <Route path='/' element={<UserPage/>}/>
                <Route path='/login' element={<Login />}/>
                <Route path='/register' element={<Register/>}/>
                <Route path='*' element={<Navigate to='/'/>} />
            </Routes> 
        
        </div>
    );
}



export default App;
