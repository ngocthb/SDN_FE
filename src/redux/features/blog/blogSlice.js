// src/redux/features/blog/blogSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../config/axios";

// THUNK ĐỂ LẤY DANH SÁCH BLOG (Không thay đổi)
export const fetchBlogs = createAsyncThunk(
  "blog/fetchBlogs",
  async ({ page, initialLoad }, { rejectWithValue }) => {
    const limit = initialLoad ? 5 : 3;
    const skip = initialLoad ? 0 : 5 + (page - 1) * 3;

    try {
      const response = await api.post("/blog/all", {
        skip,
        limit,
      });
      return { blogs: response.data.data, limit };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blogs"
      );
    }
  }
);

// --- THÊM MỚI: THUNK ĐỂ TẠO BLOG MỚI ---
export const createBlog = createAsyncThunk(
  "blog/createBlog",
  async (blogData, { rejectWithValue }) => {
    try {
      // Gọi API đến endpoint /api/blog/create
      const response = await api.post("/blog/create", blogData);
      // Backend trả về bài blog vừa tạo trong response.data.data
      return response.data.data;
    } catch (error) {
      // Nếu có lỗi, trả về message lỗi từ server
      return rejectWithValue(
        error.response?.data?.message || "Failed to create post"
      );
    }
  }
);

export const deleteBlog = createAsyncThunk(
  "blog/deleteBlog",
  async (blogId, { rejectWithValue }) => {
    try {
      // Gọi API đến endpoint /api/blog/:id với method DELETE
      await api.delete(`/blog/${blogId}`);
      // Nếu thành công, trả về blogId để slice biết cần xóa bài nào
      return blogId;
    } catch (error) {
      // Nếu có lỗi, trả về message lỗi từ server
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

const initialState = {
  blogs: [],
  status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  hasMore: true,
  page: 0,
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    resetBlogState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchBlogs
      .addCase(fetchBlogs.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        const { blogs, limit } = action.payload;

        if (state.page === 0) {
          state.blogs = blogs;
        } else {
          state.blogs = [...state.blogs, ...blogs];
        }

        state.status = "succeeded";
        state.page += 1;
        state.error = null;

        if (blogs.length < limit) {
          state.hasMore = false;
        }
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // --- THÊM MỚI: Xử lý createBlog ---
      .addCase(createBlog.pending, (state) => {
        // Có thể set 1 trạng thái loading riêng cho việc tạo bài nếu cần
        // Ví dụ: state.createStatus = 'loading';
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        // Thêm bài viết mới vào đầu danh sách để hiển thị ngay lập tức
        // action.payload là bài blog mới trả về từ API
        state.blogs.unshift(action.payload);
        state.status = "succeeded";
      })
      .addCase(createBlog.rejected, (state, action) => {
        // Gán lỗi để có thể hiển thị cho người dùng nếu cần
        state.status = "failed";
        state.error = action.payload;
      })

      // --- THÊM MỚI: Xử lý deleteBlog ---
      .addCase(deleteBlog.pending, (state) => {
        // Có thể thêm trạng thái loading riêng cho việc xóa nếu cần
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        // action.payload chính là blogId đã trả về từ thunk
        const blogIdToDelete = action.payload;
        // Lọc ra khỏi mảng blogs bài viết có ID tương ứng
        state.blogs = state.blogs.filter((blog) => blog._id !== blogIdToDelete);
        state.status = "succeeded";
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.status = "failed";
        // Gán lỗi để có thể hiển thị cho người dùng nếu cần
        state.error = action.payload;
        // Có thể hiện toast/notification báo lỗi ở đây
        console.error("Delete failed:", action.payload);
      });
  },
});

export const { resetBlogState } = blogSlice.actions;
export default blogSlice.reducer;
