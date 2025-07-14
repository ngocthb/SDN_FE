import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../config/axios';

// Async thunks
export const createOrUpdateSmokingStatus = createAsyncThunk(
    'smokingStatus/createOrUpdate',
    async ({ cigarettesPerDay, pricePerCigarette }, { rejectWithValue }) => {
        try {
            const response = await api.post('smoking-status', {
                cigarettesPerDay,
                pricePerCigarette
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getSmokingStatus = createAsyncThunk(
    'smokingStatus/get',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('smoking-status');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const calculateSmokingCost = createAsyncThunk(
    'smokingStatus/calculateCost',
    async (days = 30, { rejectWithValue }) => {
        try {
            const response = await api.get(`smoking-status/calculate-cost?days=${days}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteSmokingStatus = createAsyncThunk(
    'smokingStatus/delete',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.delete('smoking-status');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Initial state
const initialState = {
    smokingStatus: null,
    costCalculation: null,
    loading: false,
    error: null,
    success: false,
    message: ''
};

// Slice
const smokingStatusSlice = createSlice({
    name: 'smokingStatus',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
            state.message = '';
        },
        resetSmokingStatus: (state) => {
            state.smokingStatus = null;
            state.costCalculation = null;
            state.error = null;
            state.success = false;
            state.message = '';
        },
        clearSmokingStatusState: (state) => {
            return initialState;
        }
    },
    extraReducers: (builder) => {
        builder
            // Create or Update Smoking Status
            .addCase(createOrUpdateSmokingStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createOrUpdateSmokingStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.smokingStatus = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(createOrUpdateSmokingStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
                state.success = false;
            })

            // Get Smoking Status
            .addCase(getSmokingStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSmokingStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.smokingStatus = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getSmokingStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Calculate Smoking Cost
            .addCase(calculateSmokingCost.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(calculateSmokingCost.fulfilled, (state, action) => {
                state.loading = false;
                state.costCalculation = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(calculateSmokingCost.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Delete Smoking Status
            .addCase(deleteSmokingStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteSmokingStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.smokingStatus = null;
                state.costCalculation = null;
                state.message = action.payload.message;
            })
            .addCase(deleteSmokingStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
                state.success = false;
            });
    }
});

export const { clearError, clearSuccess, resetSmokingStatus, clearSmokingStatusState } = smokingStatusSlice.actions;
export default smokingStatusSlice.reducer;