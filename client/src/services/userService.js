// src/services/userService.js
import { formatToLocalDatetimeInput, toISOStringOrNull, roundToHalfHour } from '../utils/time';

export function validateUserData({ name, phone, booking_time }) {
  if (!name.trim()) return '請輸入姓名';
  if (!/^09\d{8}$/.test(phone)) return '請輸入有效的手機號碼 (09 開頭共 10 碼)';
  if (!booking_time) return '請選擇預約時間';
  return null;
}

export function formatToServer(formData) {
  const normalizedTime = roundToHalfHour(formData.booking_time);

  return {
    name: formData.name,
    phone: formData.phone,
    booking_time: toISOStringOrNull(normalizedTime),
    status: formData.status,
  };
}

export function formatToForm(userData) {
  return {
    name: userData.name,
    phone: userData.phone,
    booking_time: formatToLocalDatetimeInput(userData.booking_time),
    status: userData.status || 'pending',
  };
}

export function emptyFormData() {
  return {
    name: '',
    phone: '',
    booking_time: '',
    status: 'pending',
  };
}
