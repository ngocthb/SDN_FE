import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../config/axios';

// Async thunk
export const getMySubscription = createAsyncThunk(
    'subscription/getMySubscription',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('subscription/my-subscription');
            console.log('getMySubscription response:', response.data);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Initial state
const initialState = {
    mySubscription: null,
    hasActiveSubscription: false,
    loading: false,
    error: null,
    message: ''
};

// Slice
const subscriptionSlice = createSlice({
    name: 'subscription',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMessage: (state) => {
            state.message = '';
        },
        resetSubscription: (state) => {
            state.mySubscription = null;
            state.hasActiveSubscription = false;
            state.error = null;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            // Get My Subscription
            .addCase(getMySubscription.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMySubscription.fulfilled, (state, action) => {
                state.loading = false;
                state.mySubscription = action.payload.data.subscription;
                state.hasActiveSubscription = action.payload.data.hasActiveSubscription;
                state.message = action.payload.message;
            })
            .addCase(getMySubscription.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
                state.mySubscription = null;
                state.hasActiveSubscription = false;
            });
    }
});

export const { clearError, clearMessage, resetSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;