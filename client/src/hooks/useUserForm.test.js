jest.mock('../services/userService');
jest.mock('../api/userApi');

import React from 'react';
import { render, fireEvent, screen, waitFor} from '@testing-library/react';
import UserPage from '../pages/UserPage';
import { MemoryRouter } from 'react-router-dom';

import * as userService from '../services/userService';
import * as userApi from '../api/userApi';

describe('Testing UserPage integration with useUserForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
    userService.emptyFormData.mockReturnValue({
      name: '',
      phone: '',
      booking_time: '',
      status: '',
    });
  });

  test('Trigger createUser after successfully submitting the form', async() => {
    userService.validateUserData.mockReturnValue(null);
    userService.formatToServer.mockReturnValue({ name: '小黑'});
    userApi.createUser.mockReturnValue({});

    render(<UserPage/>, {wrapper: MemoryRouter});
    fireEvent.click(screen.getByText('+ 新增用戶'));
    fireEvent.change(screen.getByLabelText('姓名'), {
      target: { value: '小黑'},
    });
    fireEvent.change(screen.getByLabelText('電話'), {
      target: { value: '0912345678'},
    });
    fireEvent.change(screen.getByLabelText('預定時間'), {
      target: {value: '2025-07-01T10:00'},
    });
    fireEvent.click(screen.getByTestId('submit-btn'));

    expect(userService.validateUserData).toHaveBeenCalled();
    expect(userService.formatToServer).toHaveBeenCalled();
    await waitFor(() => {
      expect(userApi.createUser).toHaveBeenCalledWith({ name: '小黑'});
    });

  });

  test('Trigger onError and display errors when form validation fails', async () =>{
    userService.validateUserData.mockReturnValue('請輸入姓名');
    render(<UserPage/>, {wrapper: MemoryRouter});
    fireEvent.click(screen.getByText('+ 新增用戶'));

    

    fireEvent.submit(screen.getByTestId('user-form'));


    expect(userService.validateUserData).toHaveBeenCalled();
    expect(userService.formatToServer).not.toHaveBeenCalled();
    expect(userApi.createUser).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByTestId('error-box')).toHaveTextContent('請輸入姓名');
    });  });

 
});
