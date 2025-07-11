import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../../config/axios';

export const fetchLoginThunk = createAsyncThunk(
    'user/fetchLogin',
    async (credentials, thunkAPI) => {
        try {
            const res = await api.post('user/login', credentials);
            console.log('Login response:', res);
            const token = res.data.data.token;
            console.log(token)
            localStorage.setItem('userId', res.data.data.user._id);
            localStorage.setItem('userName', res.data.data.user.name);
            localStorage.setItem('userAvatar', res.data.data.user.picture);
            localStorage.setItem('token', token);
            if (res.data.data.user.isAdmin === true) {
                localStorage.setItem('role', 'admin');
            } else if (res.data.data.user.isCoach === true) {
                localStorage.setItem('role', 'coach');
            } else {
                localStorage.setItem('role', 'user');
            }

            return res.data.data.user;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data.message);
        }
    }
);

export const fetchRegisterThunk = createAsyncThunk(
    'user/fetchRegister',
    async (userData, thunkAPI) => {
        try {
            const res = await api.post('user/register', userData);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data.message);
        }
    }
);

export const fetchSendOTPThunk = createAsyncThunk(
    'user/fetchSendOTP',
    async (emailData, thunkAPI) => {
        try {
            const res = await api.post('auth/send-otp', emailData);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data.message);
        }
    }
);

export const fetchVerifyOTPThunk = createAsyncThunk(
    'user/fetchVerifyOTP',
    async (otpData, thunkAPI) => {
        try {
            const res = await api.post('auth/check', otpData);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data.message);
        }
    }
);

export const fetchForgetPasswordThunk = createAsyncThunk(
    'user/fetchForgetPassword',
    async (emailData, thunkAPI) => {
        try {
            const res = await api.post('auth/forgot-password', emailData);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data.message);
        }
    }
);

export const fetchResetPasswordThunk = createAsyncThunk(
    'user/fetchResetPassword',
    async (resetData, thunkAPI) => {
        try {
            const res = await api.post('auth/reset-password', resetData);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data.message);
        }
    }
);

export const fetchCheckResetOTPThunk = createAsyncThunk(
    'user/fetchCheckResetOTP',
    async (otpData, thunkAPI) => {
        try {
            const res = await api.post('auth/check-reset-otp', otpData);
            return res.data;
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response?.data.message);
        }
    }
);
