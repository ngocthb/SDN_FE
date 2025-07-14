import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../config/axios";

export const fetchBlogs = createAsyncThunk(
  "blog/fetchBlogs",
  async ({ page, initialLoad }, { rejectWithValue }) => {
    const limit = initialLoad ? 5 : 3;
    const skip = initialLoad ? 0 : 5 + (page - 1) * 3;
    try {
      const response = await api.post("/blog/all", { skip, limit });
      return { blogs: response.data.data, limit };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch blogs"
      );
    }
  }
);

export const createBlog = createAsyncThunk(
  "blog/createBlog",
  async (blogData, { rejectWithValue }) => {
    try {
      const response = await api.post("/blog/create", blogData);
      return response.data.data;
    } catch (error) {
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
      await api.delete(`/blog/${blogId}`);
      return blogId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete post"
      );
    }
  }
);

const initialState = {
  blogs: [],
  status: "idle",
  error: null,
  hasMore: true,
  page: 0,
};

const blogSlice = createSlice({
  name: "blog",
  initialState,
  reducers: {
    resetBlogState: () => initialState,
    incrementCommentCount: (state, action) => {
      const blogId = action.payload;
      const blogToUpdate = state.blogs.find((blog) => blog._id === blogId);
      if (blogToUpdate) {
        blogToUpdate.commentCount = (blogToUpdate.commentCount || 0) + 1;
      }
    },
    decrementCommentCount: (state, action) => {
      const blogId = action.payload;
      const blogToUpdate = state.blogs.find((blog) => blog._id === blogId);
      if (blogToUpdate) {
        blogToUpdate.commentCount = Math.max(
          0,
          (blogToUpdate.commentCount || 1) - 1
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
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
      .addCase(createBlog.fulfilled, (state, action) => {
        const newBlog = action.payload;
        newBlog.commentCount = 0;
        state.blogs.unshift(newBlog);
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        const blogIdToDelete = action.payload;
        state.blogs = state.blogs.filter((blog) => blog._id !== blogIdToDelete);
      });
  },
});

export const { resetBlogState, incrementCommentCount, decrementCommentCount } =
  blogSlice.actions;
export default blogSlice.reducer;
