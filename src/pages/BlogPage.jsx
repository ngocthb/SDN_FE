import React, { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

// --- Imports từ Redux Slices ---
import {
  fetchBlogs,
  resetBlogState,
  createBlog,
  deleteBlog,
  incrementCommentCount,
  decrementCommentCount,
} from "../redux/features/blog/blogSlice";
import {
  fetchCommentsByBlogId,
  createComment,
  deleteComment,
  resetCommentState,
} from "../redux/features/comment/commentSlice";
import { getMySubscription } from "../redux/features/subscription/subscriptionSlice";

// --- Imports Component & Tiện ích ---
import Navbar from "../components/Navbar";
import {
  IoTimeOutline,
  IoSyncCircle,
  IoClose,
  IoImageOutline,
  IoTrophyOutline,
  IoWarningOutline,
  IoEllipsisVertical,
  IoLockClosedOutline,
  IoChatbubbleOutline,
  IoPaperPlaneOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { format, formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "react-toastify";

// --- COMPONENT: MODAL XÁC NHẬN XÓA ---
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[70] animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card p-8 rounded-2xl w-full max-w-md mx-4 animate-slide-up text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 mb-4">
          <IoWarningOutline className="h-8 w-8 text-red-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-white/70 mb-8">{message}</p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="glass-button py-3 px-8 text-lg">
            Hủy
          </button>
          <button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENT: DROPDOWN CHỌN THÀNH TỰU ---
const AchievementSelector = ({ achievements, onSelect, disabledIds }) => {
  const availableAchievements = achievements.filter(
    (ach) => !disabledIds.has(ach._id)
  );
  if (availableAchievements.length === 0)
    return (
      <div className="absolute bottom-14 left-14 bg-dark-800 border border-white/20 rounded-lg shadow-2xl z-20 p-2 text-white/50 animate-fade-in-fast">
        Bạn đã chia sẻ hết thành tựu.
      </div>
    );
  return (
    <div className="absolute bottom-14 left-14 bg-dark-800 border border-white/20 rounded-lg shadow-2xl z-20 max-h-60 overflow-y-auto animate-fade-in-fast">
      {availableAchievements.map((ach) => (
        <button
          key={ach._id}
          onClick={() => onSelect(ach)}
          className="w-full text-left flex items-center space-x-3 p-3 hover:bg-purple-500/20 transition-colors"
        >
          <img
            src={ach.icon}
            alt={ach.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="text-white">{ach.name}</span>
        </button>
      ))}
    </div>
  );
};

// --- COMPONENT: MODAL TẠO BÀI VIẾT ---
const CreateBlogModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  const contentEditableRef = useRef(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAchievements, setShowAchievements] = useState(false);
  const [addedAchievements, setAddedAchievements] = useState([]);
  const isPostDisabled = !title.trim() || !content.trim() || isSubmitting;

  const handleClose = useCallback(() => {
    if (isSubmitting) return;
    setTitle("");
    if (contentEditableRef.current) contentEditableRef.current.innerHTML = "";
    setContent("");
    setImageFile(null);
    setImagePreview("");
    setAddedAchievements([]);
    setErrors({});
    onClose();
  }, [isSubmitting, onClose]);

  const validateForm = () => {
    const newErrors = {};
    if (title.trim().length < 5)
      newErrors.title = "Tiêu đề phải có ít nhất 5 ký tự.";
    if (contentEditableRef.current.innerText.trim().length < 20)
      newErrors.content = "Nội dung phải có ít nhất 20 ký tự.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm() || isPostDisabled) return;
    setIsSubmitting(true);
    try {
      const finalContent = contentEditableRef.current.innerHTML;
      const authorId = user?._id;
      if (!authorId)
        throw new Error("Không tìm thấy người dùng. Vui lòng đăng nhập lại.");
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", finalContent.trim());
      formData.append("authorId", authorId);
      if (imageFile) formData.append("imageUrl", imageFile);
      await dispatch(createBlog(formData)).unwrap();
      toast.success("Đăng bài viết thành công!");
      handleClose();
    } catch (error) {
      toast.error(`Lỗi khi đăng bài: ${error}`);
      setErrors({ api: error || "Đã có lỗi xảy ra khi đăng bài." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImageFile(file);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSelectAchievement = (achievement) => {
    const editor = contentEditableRef.current;
    if (!editor) return;
    const achievementHtml = `<div class="achievement-block" data-achievement-id="${achievement._id}" contenteditable="false"><img src="${achievement.icon}" alt="${achievement.name}" class="achievement-icon" /><strong class="achievement-name">${achievement.name}</strong><button type="button" class="achievement-delete-btn" data-delete-id="${achievement._id}">×</button></div>`;
    editor.insertAdjacentHTML("beforeend", achievementHtml);
    const newParagraph = document.createElement("p");
    newParagraph.innerHTML = "<br>";
    editor.appendChild(newParagraph);
    const range = document.createRange();
    const selection = window.getSelection();
    range.selectNodeContents(newParagraph);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    setContent(editor.innerText);
    setAddedAchievements((prev) => [...prev, achievement]);
    setShowAchievements(false);
  };

  const handleContentClick = (e) => {
    const deleteButton = e.target.closest("[data-delete-id]");
    if (deleteButton) {
      e.preventDefault();
      const achievementId = deleteButton.getAttribute("data-delete-id");
      const achievementBlock = contentEditableRef.current.querySelector(
        `[data-achievement-id="${achievementId}"]`
      );
      if (achievementBlock) achievementBlock.remove();
      setAddedAchievements((prev) =>
        prev.filter((ach) => ach._id !== achievementId)
      );
      setContent(contentEditableRef.current.innerText);
    }
  };

  useEffect(() => {
    const oldPreview = imagePreview;
    return () => {
      if (oldPreview) URL.revokeObjectURL(oldPreview);
    };
  }, [imagePreview]);

  if (!isOpen || !user) return null;
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
      onClick={handleClose}
    >
      <style>{`.achievement-block:hover .achievement-delete-btn { opacity: 1; } [contenteditable=true]:empty:before { content: attr(placeholder); pointer-events: none; display: block; opacity: 0.6; } .achievement-block { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background-color: rgba(255, 255, 255, 0.05); border-radius: 0.5rem; border: 1px solid rgba(255, 255, 255, 0.1); position: relative; cursor: default; margin-top: 5px; } .achievement-icon { width: 2.5rem; height: 2.5rem; } .achievement-name { color: #c084fc; } .achievement-delete-btn { position: absolute; top: 0.25rem; right: 0.25rem; background: rgba(0,0,0,0.5); border-radius: 9999px; width: 1.5rem; height: 1.5rem; color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.25rem; line-height: 1; opacity: 0.5; transition: opacity 0.2s; }`}</style>
      <div
        className="glass-card p-6 rounded-2xl w-full max-w-2xl mx-4 animate-slide-up relative"
        onClick={(e) => {
          e.stopPropagation();
          setShowAchievements(false);
        }}
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Tạo một bài viết mới
        </h2>
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <IoClose size={28} />
        </button>
        <div className="flex items-center space-x-3 mb-4">
          <img
            src={user.picture}
            alt={user.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <p className="font-bold text-white">{user.name}</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 max-h-[80vh] overflow-y-auto pr-2"
        >
          <div>
            <input
              type="text"
              placeholder="Tiêu đề..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`input-glass text-xl font-semibold h-14 w-full ${
                errors.title ? "border-red-500/50" : ""
              }`}
              autoFocus
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title}</p>
            )}
          </div>
          <div>
            <div
              ref={contentEditableRef}
              contentEditable="true"
              onInput={(e) => setContent(e.currentTarget.innerText)}
              onClick={handleContentClick}
              placeholder={`Bạn đang suy nghĩ gì, ${user.name}?`}
              className={`input-glass text-lg w-full min-h-[150px] p-4 ${
                errors.content ? "border-red-500/50" : ""
              }`}
            />
            {errors.content && (
              <p className="text-red-400 text-sm mt-1">{errors.content}</p>
            )}
          </div>
          {imagePreview && (
            <div className="p-3 border border-white/10 rounded-lg">
              <div className="relative w-full">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full max-h-72 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview("");
                  }}
                  className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"
                >
                  <IoClose size={20} />
                </button>
              </div>
            </div>
          )}
          {errors.api && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 p-3 rounded-lg text-center">
              {errors.api}
            </div>
          )}
          <div className="flex items-center justify-between relative border-t border-white/10 pt-4">
            <div className="flex items-center space-x-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                className="glass-button-icon"
                title="Upload Image"
              >
                <IoImageOutline size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAchievements((prev) => !prev);
                }}
                className="glass-button-icon"
                title="Share an Achievement"
              >
                <IoTrophyOutline size={22} />
              </button>
              {showAchievements && (
                <AchievementSelector
                  achievements={user.grantedAchievements || []}
                  onSelect={handleSelectAchievement}
                  disabledIds={new Set(addedAchievements.map((a) => a._id))}
                />
              )}
            </div>
            <button
              type="submit"
              disabled={isPostDisabled}
              className={`gradient-button text-lg py-3 px-8 transition-opacity ${
                isPostDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:scale-[1.02]"
              }`}
            >
              {isSubmitting ? (
                <IoSyncCircle className="animate-spin mx-auto" size={24} />
              ) : (
                "Đăng"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- COMPONENT: HIỂN THỊ MỘT BÌNH LUẬN ---
const CommentItem = ({ comment, onDelete }) => {
  const { user } = useSelector((state) => state.user);
  const isAuthor = user?._id === comment.authorId?._id;
  const authorPicture =
    comment.authorId?.picture ||
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-white/5 animate-fade-in-fast group">
      <img
        src={authorPicture}
        alt={comment.authorId?.name}
        className="w-10 h-10 rounded-full object-cover mt-1"
      />
      <div className="flex-1">
        <div className="bg-dark-800 rounded-xl p-3 relative">
          <p className="font-bold text-white text-sm">
            {comment.authorId?.name}
          </p>
          <p className="text-white/90 text-base break-words">
            {comment.content}
          </p>
          {isAuthor && (
            <button
              onClick={() => onDelete(comment._id)}
              className="absolute top-2 right-2 p-1.5 rounded-full bg-black/30 text-white/50 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-black/50 transition-all"
              title="Xóa bình luận"
            >
              <IoTrashOutline size={16} />
            </button>
          )}
        </div>
        <p className="text-xs text-white/50 mt-1 pl-3">
          {formatDistanceToNow(new Date(comment.createdAt), {
            addSuffix: true,
            locale: vi,
          })}
        </p>
      </div>
    </div>
  );
};

// --- COMPONENT: MODAL HIỂN THỊ BÌNH LUẬN ---
const BlogCommentsModal = ({ isOpen, onClose, blog }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const {
    comments,
    status: commentStatus,
    error: commentError,
  } = useSelector((state) => state.comment);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [commentToDeleteId, setCommentToDeleteId] = useState(null);
  const commentListRef = useRef(null);

  useEffect(() => {
    if (isOpen && blog?._id) dispatch(fetchCommentsByBlogId(blog._id));
    return () => {
      if (!isOpen) dispatch(resetCommentState());
    };
  }, [isOpen, blog, dispatch]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !blog || isSubmitting) return;
    setIsSubmitting(true);
    const commentData = {
      content: newComment.trim(),
      authorId: user._id,
      blogId: blog._id,
    };
    try {
      await dispatch(createComment(commentData)).unwrap();
      dispatch(incrementCommentCount(blog._id));
      setNewComment("");
      toast.success("Bình luận thành công!");
      setTimeout(() => {
        commentListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    } catch (error) {
      toast.error(`Lỗi: ${error.message || "Không thể đăng bình luận"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const promptDeleteComment = (commentId) => {
    setCommentToDeleteId(commentId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDeleteId) return;
    try {
      await dispatch(deleteComment(commentToDeleteId)).unwrap();
      dispatch(decrementCommentCount(blog._id));
      toast.success("Đã xóa bình luận.");
    } catch (error) {
      toast.error(`Không thể xóa bình luận: ${error}`);
    } finally {
      setIsConfirmOpen(false);
      setCommentToDeleteId(null);
    }
  };

  if (!isOpen || !blog) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
        onClick={onClose}
      >
        <div
          className="glass-card rounded-2xl w-full max-w-2xl mx-4 animate-slide-up flex flex-col h-[90vh] max-h-[700px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
            <h2 className="text-xl font-bold text-white text-center flex-1">
              Bình luận
            </h2>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition-colors"
            >
              <IoClose size={28} />
            </button>
          </div>
          <div
            ref={commentListRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {commentStatus === "loading" && (
              <div className="flex justify-center items-center h-full">
                <IoSyncCircle className="animate-spin text-4xl text-purple-400" />
              </div>
            )}
            {commentStatus === "failed" && (
              <p className="text-center text-red-400">{commentError}</p>
            )}
            {commentStatus === "succeeded" && comments.length === 0 && (
              <p className="text-center text-white/50 pt-10">
                Chưa có bình luận nào. Hãy là người đầu tiên!
              </p>
            )}
            {commentStatus === "succeeded" &&
              comments.map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  onDelete={promptDeleteComment}
                />
              ))}
          </div>
          <div className="p-4 border-t border-white/10 flex-shrink-0">
            <form
              onSubmit={handlePostComment}
              className="flex items-center space-x-3"
            >
              <img
                src={user?.picture}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="input-glass flex-1 h-12"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                className={`gradient-button p-3 rounded-full transition-all ${
                  !newComment.trim() || isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
              >
                {isSubmitting ? (
                  <IoSyncCircle className="animate-spin" size={20} />
                ) : (
                  <IoPaperPlaneOutline size={20} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa bình luận"
        message="Bạn có chắc chắn muốn xóa bình luận này không?"
      />
    </>
  );
};

// --- COMPONENT: THẺ BÀI VIẾT ---
const BlogCard = ({ blog, onCommentClick }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const contentRef = useRef(null);
  const menuRef = useRef(null);
  const COLLAPSED_HEIGHT_REM = 10;
  const isAuthor = user?._id === blog.authorId?._id;
  const formattedDate = format(new Date(blog.createdAt), "MMMM d, yyyy");
  const authorName = blog.authorId?.name || "Anonymous";
  const authorPicture =
    blog.authorId?.picture ||
    "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";
  const createMarkup = () => ({ __html: blog.content });

  useEffect(() => {
    const element = contentRef.current;
    if (element) {
      const collapsedHeightPx = COLLAPSED_HEIGHT_REM * 16;
      setShowButton(element.scrollHeight > collapsedHeightPx);
    }
  }, [blog.content]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target))
        setIsMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleExpansion = (e) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
  };
  const handleDelete = async () => {
    try {
      await dispatch(deleteBlog(blog._id)).unwrap();
      setIsConfirmModalOpen(false);
      toast.success("Xóa bài viết thành công");
    } catch (error) {
      toast.error(`Lỗi khi xóa bài viết: ${error}`);
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <>
      <div className="glass-card rounded-2xl overflow-hidden flex flex-col glow-effect">
        <div className="p-6 flex flex-col flex-grow">
          <div className="flex items-center justify-between space-x-3 mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={authorPicture}
                alt={authorName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-bold text-white text-lg">{authorName}</p>
                <p className="text-xs text-white/60 flex items-center space-x-1">
                  <IoTimeOutline />
                  <span>{formattedDate}</span>
                </p>
              </div>
            </div>
            {isAuthor && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <IoEllipsisVertical className="text-white/70" size={20} />
                </button>
                {isMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-dark-800 border border-white/10 rounded-lg shadow-2xl z-10 animate-fade-in-fast">
                    <button
                      onClick={() => {
                        setIsMenuOpen(false);
                        setIsConfirmModalOpen(true);
                      }}
                      className="w-full text-left text-red-400 px-4 py-3 hover:bg-red-500/20 transition-colors"
                    >
                      Xóa bài viết
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-white hover:text-purple-300 transition-colors mb-4">
              <Link to={`/blog/${blog._id}`}>{blog.title}</Link>
            </h2>
            <div
              ref={contentRef}
              style={{
                maxHeight: isExpanded
                  ? `${contentRef.current.scrollHeight}px`
                  : `${COLLAPSED_HEIGHT_REM}rem`,
              }}
              className="prose prose-invert prose-p:my-2 prose-p:text-white/80 prose-strong:text-purple-300 overflow-hidden transition-all duration-500 ease-in-out"
              dangerouslySetInnerHTML={createMarkup()}
            />
          </div>
          {showButton && (
            <button
              onClick={toggleExpansion}
              className="mt-2 text-purple-400 font-semibold hover:text-purple-300 self-start bg-transparent border-none p-0 cursor-pointer"
            >
              {isExpanded ? "Ẩn bớt" : "Xem thêm..."}
            </button>
          )}
          {blog.imageUrl && (
            <Link to={`/blog/${blog._id}`} className="block mt-4">
              <img
                src={blog.imageUrl}
                alt={blog.title}
                className="w-full h-auto max-h-[500px] object-cover rounded-lg"
              />
            </Link>
          )}
          <div className="mt-4 pt-4 border-t border-white/10">
            <button
              onClick={() => onCommentClick(blog)}
              className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
            >
              <IoChatbubbleOutline size={22} />
              <span>{blog.commentCount || 0} Bình luận</span>
            </button>
          </div>
        </div>
      </div>
      <ConfirmDeleteModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa bài viết"
        message="Bạn có chắc chắn muốn xóa bài viết này không? Hành động này không thể hoàn tác."
      />
    </>
  );
};

// --- COMPONENT: WIDGET TẠO BÀI VIẾT ---
const CreatePostWidget = ({ onOpenModal }) => {
  const { user, isAuthChecked } = useSelector((state) => state.user);
  if (!isAuthChecked)
    return (
      <div className="glass-card p-4 mb-8 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-white/10"></div>
          <div className="h-8 flex-grow bg-white/10 rounded-full"></div>
        </div>
      </div>
    );
  if (!user) return null;
  return (
    <div className="glass-card p-4 mb-8 animate-fade-in">
      <div className="flex items-center space-x-4">
        <img
          src={user.picture}
          alt="Your avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
        <button
          onClick={onOpenModal}
          className="flex-grow text-left text-white/60 bg-dark-800 hover:bg-dark-700 transition-colors p-3 rounded-full text-lg"
        >
          Bạn đang suy nghĩ gì, {user.name}?
        </button>
      </div>
    </div>
  );
};

// --- COMPONENT CHÍNH: TRANG BLOG ---
function BlogPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { blogs, status, hasMore, page, error } = useSelector(
    (state) => state.blog
  );
  const { isAuthChecked } = useSelector((state) => state.user);
  const { hasActiveSubscription, loading: subscriptionLoading } = useSelector(
    (state) => state.subscription
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [selectedBlogForComments, setSelectedBlogForComments] = useState(null);
  const observer = useRef();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    dispatch(resetBlogState());
    if (isAuthChecked) dispatch(getMySubscription());
  }, [dispatch, isAuthChecked]);

  useEffect(() => {
    const canFetch =
      isAuthChecked && hasActiveSubscription && !subscriptionLoading;
    if (canFetch && !initialLoadDone.current) {
      initialLoadDone.current = true;
      dispatch(fetchBlogs({ page: 0, initialLoad: true }));
    }
  }, [isAuthChecked, hasActiveSubscription, subscriptionLoading, dispatch]);

  const lastBlogElementRef = useCallback(
    (node) => {
      if (status === "loading") return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore)
          dispatch(fetchBlogs({ page, initialLoad: false }));
      });
      if (node) observer.current.observe(node);
    },
    [status, hasMore, page, dispatch]
  );

  const handleOpenCommentsModal = (blog) => {
    setSelectedBlogForComments(blog);
    setIsCommentsModalOpen(true);
  };
  const handleCloseCommentsModal = () => {
    setIsCommentsModalOpen(false);
    setSelectedBlogForComments(null);
  };

  const renderInitialLoading = () => (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="glass-card p-6 rounded-2xl animate-pulse h-64"
        ></div>
      ))}
    </div>
  );
  const renderError = () => (
    <div className="glass-card p-8 text-center text-white">
      <h2 className="text-2xl mb-2">Đã xảy ra lỗi</h2>
      <p className="text-red-400 mb-4">{error}</p>
      <button
        onClick={() => {
          initialLoadDone.current = false;
          dispatch(fetchBlogs({ page: 0, initialLoad: true }));
        }}
        className="gradient-button"
      >
        Thử lại
      </button>
    </div>
  );
  const renderSubscriptionGate = () => (
    <div className="glass-card p-8 rounded-2xl mb-6 border border-red-500/30 bg-red-500/10 text-center">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-purple-500/20 mb-4">
        <IoLockClosedOutline className="h-8 w-8 text-purple-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-2">
        Tính năng dành cho thành viên
      </h3>
      <p className="text-white/70 mb-6">
        Nâng cấp tài khoản để tham gia cộng đồng, chia sẻ câu chuyện của bạn và
        đọc bài viết từ người khác.
      </p>
      <button
        onClick={() => navigate("/user/membership")}
        className="gradient-button text-lg py-3 px-8 transition-transform hover:scale-105"
      >
        Nâng cấp ngay
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-purple-900/20 to-pink-900/20">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2 py-3">
          Cộng đồng & Chia sẻ
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Nơi chia sẻ câu chuyện và kinh nghiệm trong hành trình của bạn.
        </p>

        {subscriptionLoading || !isAuthChecked ? (
          renderInitialLoading()
        ) : !hasActiveSubscription ? (
          renderSubscriptionGate()
        ) : (
          <>
            <CreatePostWidget onOpenModal={() => setIsCreateModalOpen(true)} />
            {status === "loading" && page === 0 && renderInitialLoading()}
            {status === "failed" && page === 0 && renderError()}
            <div className="space-y-8">
              {blogs.map((blog, index) => {
                const card = (
                  <BlogCard
                    key={blog._id}
                    blog={blog}
                    onCommentClick={handleOpenCommentsModal}
                  />
                );
                if (blogs.length === index + 1)
                  return (
                    <div ref={lastBlogElementRef} key={blog._id}>
                      {card}
                    </div>
                  );
                return card;
              })}
            </div>
            {status === "loading" && page > 0 && (
              <div className="flex justify-center items-center py-8 space-x-3 text-white">
                <IoSyncCircle className="animate-spin text-3xl text-purple-400" />{" "}
                <span className="text-lg">Đang tải thêm...</span>
              </div>
            )}
            {!hasMore && blogs.length > 0 && (
              <p className="text-center text-white/50 py-8">
                Bạn đã xem hết rồi!
              </p>
            )}
            {status === "succeeded" && blogs.length === 0 && (
              <div className="text-center text-white/70 py-12 glass-card rounded-2xl">
                <h3 className="text-2xl font-bold">Chưa có bài viết nào</h3>
                <p>Hãy là người đầu tiên chia sẻ câu chuyện của bạn!</p>
              </div>
            )}
          </>
        )}
      </div>
      <CreateBlogModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <BlogCommentsModal
        isOpen={isCommentsModalOpen}
        onClose={handleCloseCommentsModal}
        blog={selectedBlogForComments}
      />
    </div>
  );
}

export default BlogPage;
