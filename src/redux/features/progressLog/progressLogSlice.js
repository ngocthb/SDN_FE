import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../config/axios';

// Async thunks
export const logDailyProgress = createAsyncThunk(
    'progressLog/logDailyProgress',
    async ({ cigarettesPerDay, healthNote, mood }, { rejectWithValue }) => {
        try {
            const response = await api.post('progress-logs', {
                cigarettesPerDay,
                healthNote,
                mood
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getTodayProgress = createAsyncThunk(
    'progressLog/getTodayProgress',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('progress-logs/today');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getProgressLogs = createAsyncThunk(
    'progressLog/getProgressLogs',
    async ({ startDate, endDate, limit = 30 }, { rejectWithValue }) => {
        try {
            const params = new URLSearchParams();
            if (startDate) params.append('startDate', startDate);
            if (endDate) params.append('endDate', endDate);
            params.append('limit', limit);

            const response = await api.get(`progress-logs?${params.toString()}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getProgressStatistics = createAsyncThunk(
    'progressLog/getProgressStatistics',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('progress-logs/statistics');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getProgressChart = createAsyncThunk(
    'progressLog/getProgressChart',
    async (days = 30, { rejectWithValue }) => {
        try {
            const response = await api.get(`progress-logs/chart?days=${days}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const deleteProgressLog = createAsyncThunk(
    'progressLog/deleteProgressLog',
    async (logId, { rejectWithValue }) => {
        try {
            const response = await api.delete(`progress-logs/${logId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Initial state
const initialState = {
    todayProgress: null,
    progressLogs: [],
    statistics: null,
    chartData: null,
    newAchievements: [],
    loading: false,
    error: null,
    success: false,
    message: ''
};

// Slice
const progressLogSlice = createSlice({
    name: 'progressLog',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
            state.message = '';
        },
        clearNewAchievements: (state) => {
            state.newAchievements = [];
        },
        resetProgressLog: (state) => {
            state.todayProgress = null;
            state.progressLogs = [];
            state.statistics = null;
            state.chartData = null;
            state.newAchievements = [];
            state.error = null;
            state.success = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            // Log Daily Progress
            .addCase(logDailyProgress.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(logDailyProgress.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.todayProgress = action.payload.data;
                state.newAchievements = action.payload.newAchievements || [];
                state.message = action.payload.message;
            })
            .addCase(logDailyProgress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
                state.success = false;
            })

            // Get Today Progress
            .addCase(getTodayProgress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getTodayProgress.fulfilled, (state, action) => {
                state.loading = false;
                state.todayProgress = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getTodayProgress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Get Progress Logs
            .addCase(getProgressLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProgressLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.progressLogs = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getProgressLogs.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Get Progress Statistics
            .addCase(getProgressStatistics.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProgressStatistics.fulfilled, (state, action) => {
                state.loading = false;
                state.statistics = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getProgressStatistics.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Get Progress Chart
            .addCase(getProgressChart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProgressChart.fulfilled, (state, action) => {
                state.loading = false;
                state.chartData = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getProgressChart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Delete Progress Log
            .addCase(deleteProgressLog.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(deleteProgressLog.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.message = action.payload.message;
                // Remove the deleted log from the logs array
                state.progressLogs = state.progressLogs.filter(
                    log => log._id !== action.meta.arg
                );
            })
            .addCase(deleteProgressLog.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
                state.success = false;
            });
    }
});

export const {
    clearError,
    clearSuccess,
    clearNewAchievements,
    resetProgressLog
} = progressLogSlice.actions;
export default progressLogSlice.reducer;