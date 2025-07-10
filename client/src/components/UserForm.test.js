import { render, screen, fireEvent } from '@testing-library/react';
import UserForm from './UserForm';
import React from 'react';


describe('UserForm', () => {
  const baseProps = {
    formData: {
      name: '',
      phone: '',
      booking_time: '',
      status: '',
    },
    isEditing: false,
    isAdmin: false,
    onChange: jest.fn(),
    onSubmit: jest.fn((e) => e.preventDefault()),
    onCancel: jest.fn(),
  };

  const renderUserForm = (customProps = {}) =>{
    const props = {...baseProps, ...customProps};
    render(<UserForm {...props}/>);
    return props;
  }

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  test('renders inputs and submit/cancel buttons', () => {
    render(<UserForm {...baseProps}/>);
    expect(screen.getByLabelText('姓名')).toBeInTheDocument();
    expect(screen.getByLabelText('電話')).toBeInTheDocument();
    expect(screen.getByLabelText('預定時間')).toBeInTheDocument();
    expect(screen.getByTestId('submit-btn')).toBeInTheDocument();
    expect(screen.getByText('取消編輯')).toBeInTheDocument();
  });

  test('calls onChange when input changes', () => {
    const props = renderUserForm();

    fireEvent.change(screen.getByLabelText('姓名'), {target: {value: 'John'}});
    expect(props.onChange).toHaveBeenCalled();
  });

  test('calls onSubmit when form submitted', () => {
    const props = renderUserForm();

    fireEvent.submit(screen.getByTestId('user-form'));
    expect(props.onSubmit).toHaveBeenCalled();
  });

  test('calls onCancel when cancel clicked', () => {
   const props = renderUserForm();
    fireEvent.click(screen.getByText('取消編輯'));
    expect(props.onCancel).toHaveBeenCalled();
  });

  test('renders status field if isAdmin is true', () => {
    //jsx寫法 isAmin可覆蓋前值
    const props = renderUserForm({isAdmin:true});
    //getByLabelText測試東西存在時是否存在
    expect(screen.getByLabelText('狀態')).toBeInTheDocument();
  });

  test('does not render status field if isAdmin is false', () => {
    const props = renderUserForm();
    //queryByLabelText測試東西不存在時是否不存在 不能與上面混用
    expect(screen.queryByLabelText('狀態')).toBeNull();
  });

});