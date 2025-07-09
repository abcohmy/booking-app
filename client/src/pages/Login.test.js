const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));
//react router dom裡的東西只能用mock， 不能spyOn

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import React from 'react';



describe('Login Component', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('shows error when username is empty', async () =>{
    //Login 元件內部使用了 react-router 的 useNavigate 需要memoryRouter包住
    //不然會報錯no router context
    render(<Login/>, {wrapper: MemoryRouter});
    
    //輸入表單
    fireEvent.change(screen.getByLabelText('密碼'), {
      target: { value: '123456'},
    });

    //執行form submit
    fireEvent.submit(screen.getByTestId('login-form'));

    //檢查螢幕輸出，看有沒有error顯示
  expect(await screen.findByText((t) => t.includes('帳號不能是空白'))).toBeInTheDocument();
  });

  test('shows error when password < 6', async () => {
    render(<Login/>, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('帳號'), {
      target: { value: 'testuser'},
    });

    fireEvent.change(screen.getByLabelText('密碼'), {
      target: { value: '123'},
    });

    fireEvent.submit(screen.getByTestId('login-form'));

    expect(await screen.findByText((t) => t.includes('密碼至少要6碼'))).toBeInTheDocument();

  });

  test('shows error if API returns error', async () => {
    //resolvedValue:處理成功的 rejectedValue:處理失敗的
    jest.spyOn(axiosInstance, 'post').mockRejectedValue({
      response: {data: {message: '帳密錯誤'}}
    });

    render(<Login />, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('帳號'), {
      target: { value: 'testuser'},
    });

    fireEvent.change(screen.getByLabelText('密碼'), {
      target: { value: '123456'},
    });

    fireEvent.submit(screen.getByTestId('login-form'));
    expect(await screen.findByText((t) => t.includes('帳密錯誤'))).toBeInTheDocument();

  })

  test('successful login triggers navigate and sets localStorage', async () => {
    
    jest.spyOn(axiosInstance, 'post').mockResolvedValue({
      data: {user: {user_id: 1, username: 'testuser'}, token: 'test-token'}
    });

    render(<Login />, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('帳號'), {
      target: { value: 'testuser'},
    });

    fireEvent.change(screen.getByLabelText('密碼'), {
      target: { value: '123456'},
    });

    fireEvent.submit(screen.getByTestId('login-form'));
    await waitFor(() => {
      expect(localStorage.getItem('user')).not.toBeNull();
      expect(localStorage.getItem('token')).toBe('test-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

  });

});