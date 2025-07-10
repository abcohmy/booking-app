

import { useState } from "react";
import * as userService from '../services/userService';
import * as userApi from '../api/userApi';

export function useUserForm({ onSuccess, onError, setLoading}){
  const [formData, setFormData] = useState(userService.emptyFormData());
  const [editingUser, setEditingUser] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData(f => ({...f, [name]: value}));
  };

  const handleEditClick = (user) => {
    setIsFormOpen(true);
    setEditingUser(user);
    setFormData(userService.formatToForm(user));
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData(userService.emptyFormData());
    setIsFormOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = userService.validateUserData(formData);
    if (err) {
      onError(err);
      return ;
    }
    try {
      setLoading(true);
      const payload = userService.formatToServer(formData);
      if (editingUser){
        await userApi.updateUser(editingUser.booking_id, payload);
      } else {
        await userApi.createUser(payload);
      }
      setFormData(userService.emptyFormData());
      setEditingUser(null);
      onSuccess();
    }catch(err){
      onError(err);
    } finally {
      setLoading(false);
      setIsFormOpen(false);
    }
  };
  return {
    formData, 
    editingUser,
    isEditing: !! editingUser,
    isFormOpen,
    setIsFormOpen,
    handleInputChange,
    handleEditClick,
    handleCancelEdit,
    handleSubmit,
  }
}