// src/redux/features/userMembership/userMembershipSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../config/axios";

// 1. Fetch danh sách membership
export const fetchMemberships = createAsyncThunk(
  "membership/fetchMemberships",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("membership");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 2. Tạo đơn hàng thanh toán
export const createMembershipOrder = createAsyncThunk(
  "membership/createOrder",
  async ({ userId, membershipId, mode = "register" }, { rejectWithValue }) => {
    try {
      const res = await api.post("payMembership", {
        userId,
        membershipId,
        mode,
      });
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 3. Xác nhận thanh toán cho ĐĂNG KÝ MỚI
export const confirmMembershipPayment = createAsyncThunk(
  "membership/confirmPayment",
  async (vnpayData, { rejectWithValue }) => {
    try {
      const res = await api.post("payMembership/confirm-payment", vnpayData);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// 4. Hủy gói thành viên
export const cancelMySubscription = createAsyncThunk(
  "membership/cancelSubscription",
  async (subscriptionId, { rejectWithValue }) => {
    try {
      const response = await api.put(`subscription/cancel/${subscriptionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// 5. GIA HẠN GÓI SAU KHI THANH TOÁN
export const extendSubscription = createAsyncThunk(
  "membership/extendSubscription",
  async ({ subscriptionId }, { rejectWithValue }) => {
    try {
      const res = await api.put(`subscription/extend/${subscriptionId}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const initialState = {
  memberships: [],
  mySubscription: null,
  hasActiveSubscription: false,
  loading: false,
  error: null,
  orderId: null,
  paymentUrl: null,
  confirmedSubscription: null, // Dùng chung cho cả confirm và extend
};

const membershipSlice = createSlice({
  name: "membership",
  initialState,
  reducers: {
    resetMembershipPaymentState: (state) => {
      state.orderId = null;
      state.paymentUrl = null;
      state.confirmedSubscription = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemberships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemberships.fulfilled, (state, action) => {
        state.loading = false;
        state.memberships = action.payload.data;
      })
      .addCase(fetchMemberships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi tải danh sách gói";
      })
      .addCase(createMembershipOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMembershipOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderId = action.payload.orderId;
        state.paymentUrl = action.payload.paymentUrl;
      })
      .addCase(createMembershipOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi tạo đơn hàng";
      })
      .addCase(confirmMembershipPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmMembershipPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.confirmedSubscription = action.payload;
      })
      .addCase(confirmMembershipPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi xác nhận đăng ký mới";
      })
      .addCase(extendSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(extendSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.confirmedSubscription = action.payload;
      })
      .addCase(extendSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi xác nhận gia hạn";
      })
      .addCase(cancelMySubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelMySubscription.fulfilled, (state) => {
        state.loading = false;
        state.mySubscription = null;
        state.hasActiveSubscription = false;
      })
      .addCase(cancelMySubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Lỗi khi hủy gói";
      });
  },
});

export const { resetMembershipPaymentState } = membershipSlice.actions;
export default membershipSlice.reducer;
