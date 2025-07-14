import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../../config/axios";
import { toast } from "react-toastify";

export const fetchCommentsByBlogId = createAsyncThunk(
  "comment/fetchByBlogId",
  async (blogId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/comment/blog/${blogId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch comments"
      );
    }
  }
);

export const createComment = createAsyncThunk(
  "comment/createComment",
  async (commentData, { rejectWithValue, getState }) => {
    try {
      // Gọi API với dữ liệu thô
      const response = await api.post("/comment/create", commentData);
      const newComment = response.data.data;

      // Lấy thông tin user đang đăng nhập từ Redux state
      const { user } = getState().user;

      // "Populate" thủ công dữ liệu trả về từ API
      // Gán object user đầy đủ vào trường authorId
      if (typeof newComment.authorId === "string" && user) {
        newComment.authorId = {
          _id: user._id,
          name: user.name,
          picture: user.picture,
        };
      }

      // Trả về bình luận đã được populate đầy đủ
      return newComment;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create comment"
      );
    }
  }
);

export const deleteComment = createAsyncThunk(
  "comment/deleteComment",
  async (commentId, { rejectWithValue }) => {
    try {
      await api.delete(`/comment/${commentId}`);
      return commentId;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete comment"
      );
    }
  }
);

const initialState = {
  comments: [],
  status: "idle",
  error: null,
};

const commentSlice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    resetCommentState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Xử lý fetchComments
      .addCase(fetchCommentsByBlogId.pending, (state) => {
        state.status = "loading";
        state.comments = [];
      })
      .addCase(fetchCommentsByBlogId.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.comments = action.payload;
      })
      .addCase(fetchCommentsByBlogId.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      // Xử lý createComment
      .addCase(createComment.fulfilled, (state, action) => {
        // Chỉ có một nơi duy nhất thêm bình luận vào state
        // action.payload ở đây đã được populate đầy đủ từ thunk
        state.comments.unshift(action.payload);
      })
      .addCase(createComment.rejected, (state, action) => {
        toast.error(`Lỗi: ${action.payload}`);
      })
      // Xử lý deleteComment
      .addCase(deleteComment.fulfilled, (state, action) => {
        const deletedCommentId = action.payload;
        state.comments = state.comments.filter(
          (comment) => comment._id !== deletedCommentId
        );
      })
      .addCase(deleteComment.rejected, (state, action) => {
        toast.error(`Lỗi xóa bình luận: ${action.payload}`);
      });
  },
});

export const { resetCommentState } = commentSlice.actions;
export default commentSlice.reducer;
