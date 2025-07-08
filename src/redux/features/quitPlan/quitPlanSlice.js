import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../../config/axios';

// Async thunks
export const getSuggestedPlan = createAsyncThunk(
    'quitPlan/getSuggestedPlan',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('quit-plans/suggestions');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const createQuitPlan = createAsyncThunk(
    'quitPlan/createQuitPlan',
    async ({ reason, customStages }, { rejectWithValue }) => {
        try {
            const response = await api.post('quit-plans', {
                reason,
                customStages
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getCurrentPlan = createAsyncThunk(
    'quitPlan/getCurrentPlan',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('quit-plans/current');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getCurrentStage = createAsyncThunk(
    'quitPlan/getCurrentStage',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('quit-plans/current-stage');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getStageById = createAsyncThunk(
    'quitPlan/getStageById',
    async (stageId, { rejectWithValue }) => {
        try {
            const response = await api.get(`quit-plans/stages/${stageId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const updateQuitPlan = createAsyncThunk(
    'quitPlan/updateQuitPlan',
    async ({ planId, updates }, { rejectWithValue }) => {
        try {
            const response = await api.put(`quit-plans/${planId}`, updates);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const completePlan = createAsyncThunk(
    'quitPlan/completePlan',
    async (planId, { rejectWithValue }) => {
        try {
            const response = await api.put(`quit-plans/${planId}/complete`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const cancelPlan = createAsyncThunk(
    'quitPlan/cancelPlan',
    async (planId, { rejectWithValue }) => {
        try {
            const response = await api.put(`quit-plans/${planId}/cancel`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

export const getPlanHistory = createAsyncThunk(
    'quitPlan/getPlanHistory',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('quit-plans/history');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || error.message);
        }
    }
);

// Initial state
const initialState = {
    suggestedPlan: null,
    currentPlan: null,
    currentStage: null,
    stageDetails: null,
    planHistory: [],
    loading: false,
    error: null,
    success: false,
    message: ''
};

// Slice
const quitPlanSlice = createSlice({
    name: 'quitPlan',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearSuccess: (state) => {
            state.success = false;
            state.message = '';
        },
        resetQuitPlan: (state) => {
            state.suggestedPlan = null;
            state.currentPlan = null;
            state.currentStage = null;
            state.stageDetails = null;
            state.planHistory = [];
            state.error = null;
            state.success = false;
            state.message = '';
        },
        clearStageDetails: (state) => {
            state.stageDetails = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Suggested Plan
            .addCase(getSuggestedPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getSuggestedPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.suggestedPlan = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getSuggestedPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Create Quit Plan
            .addCase(createQuitPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createQuitPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentPlan = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(createQuitPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
                state.success = false;
            })

            // Get Current Plan
            .addCase(getCurrentPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCurrentPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.currentPlan = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getCurrentPlan.rejected, (state, action) => {
                state.loading = false;
                // state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Get Current Stage
            .addCase(getCurrentStage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCurrentStage.fulfilled, (state, action) => {
                state.loading = false;
                state.currentStage = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getCurrentStage.rejected, (state, action) => {
                state.loading = false;
                // state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Get Stage By ID
            .addCase(getStageById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getStageById.fulfilled, (state, action) => {
                state.loading = false;
                state.stageDetails = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getStageById.rejected, (state, action) => {
                state.loading = false;
                // state.error = action.payload?.message || 'Có lỗi xảy ra';
            })

            // Update Quit Plan
            .addCase(updateQuitPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(updateQuitPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentPlan = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(updateQuitPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
                state.success = false;
            })

            // Complete Plan
            .addCase(completePlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(completePlan.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentPlan = null; // Clear current plan after completion
                state.currentStage = null;
                state.message = action.payload.message;
            })
            .addCase(completePlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
                state.success = false;
            })

            // Cancel Plan
            .addCase(cancelPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(cancelPlan.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.currentPlan = null; // Clear current plan after cancellation
                state.currentStage = null;
                state.message = action.payload.message;
            })
            .addCase(cancelPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
                state.success = false;
            })

            // Get Plan History
            .addCase(getPlanHistory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPlanHistory.fulfilled, (state, action) => {
                state.loading = false;
                state.planHistory = action.payload.data;
                state.message = action.payload.message;
            })
            .addCase(getPlanHistory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload?.message || 'Có lỗi xảy ra';
            });
    }
});

export const { clearError, clearSuccess, resetQuitPlan, clearStageDetails } = quitPlanSlice.actions;
export default quitPlanSlice.reducer;