const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import Register from "./Register";
import { MemoryRouter, useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import React from "react";
import axios from "axios";

describe('Register component', () => {
  beforeEach(() => {
    jest.useFakeTimers(); //假時鐘，為了測試有計時的參數

  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); //清掉時間殘留
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });
  
  test('shows error when username is empty', async () => {
    render(<Register/>, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('密碼'), {
      target: {value: '123456'},
    });

    fireEvent.submit(screen.getByTestId('register-form'));
    expect(await screen.findByText((t) => t.includes('帳號不能是空白'))).toBeInTheDocument();
  });

  test('shows error when password < 6', async () => {
    //不mock掉檢查名字的會因為有計時器的關係而延緩報錯
    jest.spyOn(axiosInstance, 'get').mockResolvedValue({ data: { available: true }});

    render(<Register />, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('帳號'), {
      target: {value: 'testuser'},
    });

    fireEvent.change(screen.getByLabelText('密碼'), {
          target: { value: '123'},
    });

    fireEvent.submit(screen.getByTestId('register-form'));
    expect(await screen.findByText((t) => t.includes('密碼至少要6碼'))).toBeInTheDocument();


  });

  test('shows error when different between password and confirmed password', async ()=> {
    jest.spyOn(axiosInstance, 'get').mockResolvedValue({ data: { available: true }});

    render(<Register />, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('帳號'), {
      target: {value: 'testuser'},
    });

    fireEvent.change(screen.getByLabelText('密碼'), {
          target: { value: '123456'},
    });

    fireEvent.change(screen.getByLabelText('再次輸入密碼'), {
          target: { value: '123666'},
    });

    fireEvent.submit(screen.getByTestId('register-form'));
    expect(await screen.findByText((t) => t.includes('密碼不一致。'))).toBeInTheDocument();

  });

  test('shows error if username existed', async () => {
    jest.spyOn(axiosInstance, 'get').mockResolvedValue({ data: { available: false }});


    render(<Register />, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('帳號'), {
      target: {value: 'testuser'},
    });

    await act(async () => {
      jest.runAllTimers();
    });
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(await screen.findByText((t) => t.includes('此帳號已被使用'))).toBeInTheDocument();
    
  });

  test('pass if username not existed', async () => {
    jest.spyOn(axiosInstance, 'get').mockResolvedValue({ data: { available: true }});


    render(<Register />, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('帳號'), {
      target: {value: 'testuser'},
    });

    await act(async () => {
      jest.runAllTimers();
    });
    expect(axiosInstance.get).toHaveBeenCalledTimes(1);
    expect(await screen.findByText((t) => t.includes('帳號可用'))).toBeInTheDocument();
    
  });

  test('shows error if axios instance get return error', async () => {
    jest.spyOn(axiosInstance, 'get').mockRejectedValue({
      response: {data: {message: 'axiosInstance錯誤'}}
    });

    render(<Register />, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('帳號'), {
      target: {value: 'testuser'},
    });

    expect(await screen.findByText((t) => t.includes('axiosInstance錯誤'))).toBeInTheDocument();

  });

  test('shows error if axios instance post return error', async () => {
    jest.spyOn(axiosInstance, 'get').mockResolvedValue({ data: { available: true }});    
    jest.spyOn(axiosInstance, 'post').mockRejectedValue({
      response: {data: {message: '註冊失敗'}}
    });

     render(<Register />, {wrapper: MemoryRouter});


    fireEvent.change(screen.getByLabelText('帳號'), {
      target: {value: 'testuser'},
    });

    fireEvent.change(screen.getByLabelText('密碼'), {
          target: { value: '123456'},
    });

    fireEvent.change(screen.getByLabelText('再次輸入密碼'), {
          target: { value: '123456'},
    });

    fireEvent.submit(screen.getByTestId('register-form'));
    expect(await screen.findByText((t) => t.includes('註冊失敗'))).toBeInTheDocument();

  })

  test('successful register triggers navigate', async () => {
    jest.spyOn(axiosInstance, 'get').mockResolvedValue({ data: { available: true }});
    jest.spyOn(axiosInstance, 'post').mockResolvedValue({
      data: {user: {username: 'testuser', password:'123456'}}
    });

    render(<Register />, {wrapper: MemoryRouter});

    fireEvent.change(screen.getByLabelText('帳號'), {
      target: {value: 'testuser'},
    });

    fireEvent.change(screen.getByLabelText('密碼'), {
          target: { value: '123456'},
    });

    fireEvent.change(screen.getByLabelText('再次輸入密碼'), {
          target: { value: '123456'},
    });

    fireEvent.submit(screen.getByTestId('register-form'));
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
      //怕render過後error還在上面卻跳轉
      expect(screen.queryByText('註冊失敗')).not.toBeInTheDocument();
    });
  });

});