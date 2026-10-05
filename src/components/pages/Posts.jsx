import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Loader2,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Heart,
  MessageSquare,
  Share2,
  MapPin,
  Tag,
  X,
  Send,
} from "lucide-react";
import { postsApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";
import { useFocusHighlight, focusRing } from "../../hooks/useFocusHighlight";

const COLUMNS = [
  { key: "post", label: "Post" },
  { key: "author", label: "Author" },
  { key: "engagement", label: "Engagement" },
  { key: "created", label: "Date" },
  { key: "actions", label: "Actions", center: true },
];

export default function Posts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });
  const focusId = useFocusHighlight();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);

  // Form state for Create / Edit
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverPhoto: "",
    photos: "",
    tags: "",
    location: "",
  });

  // Comments inside detail modal
  const [commentText, setCommentText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["posts", search],
    queryFn: () => postsApi.list({ page: 1, limit: 100, search: search || undefined }),
  });

  const { data: detailData, refetch: refetchDetail } = useQuery({
    queryKey: ["post-detail", detailTarget?.id],
    queryFn: () => postsApi.get(detailTarget.id),
    enabled: !!detailTarget?.id,
  });

  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ["post-comments", detailTarget?.id],
    queryFn: () => postsApi.comments(detailTarget.id, { page: 1, limit: 50 }),
    enabled: !!detailTarget?.id,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload) => postsApi.create(payload),
    onSuccess: () => {
      setNotice({ type: "success", text: "Post created successfully" });
      setCreateModalOpen(false);
      resetForm();
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => postsApi.update(id, payload),
    onSuccess: () => {
      setNotice({ type: "success", text: "Post updated successfully" });
      setEditTarget(null);
      resetForm();
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => postsApi.remove(id),
    onSuccess: () => {
      setNotice({ type: "success", text: "Post deleted successfully" });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ id, content }) => postsApi.addComment(id, { content }),
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      refetchDetail();
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: posts, total } = extractList(data);
  const activePost = detailData?.data ?? detailData ?? detailTarget;
  const commentsList = extractList(commentsData).items;

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      coverPhoto: "",
      photos: "",
      tags: "",
      location: "",
    });
  };

  const openCreateModal = () => {
    resetForm();
    setCreateModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditTarget(post);
    setFormData({
      title: post.title || "",
      description: post.description || "",
      coverPhoto: post.coverPhoto || "",
      photos: Array.isArray(post.photos) ? post.photos.join(", ") : "",
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
      location: post.location || "",
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title.trim() || undefined,
      description: formData.description.trim(),
      coverPhoto: formData.coverPhoto.trim() || undefined,
      photos: formData.photos
        ? formData.photos.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      tags: formData.tags
        ? formData.tags.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      location: formData.location.trim() || undefined,
    };

    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const onAction = (action, id) => {
    const post = posts.find((p) => String(p.id) === String(id));
    if (!post) return;
    if (action === "view") {
      setDetailTarget(post);
    } else if (action === "edit") {
      openEditModal(post);
    } else if (action === "delete") {
      if (window.confirm(`Delete post "${post.title || post.id}"? This will soft-delete the post.`)) {
        deleteMutation.mutate(post.id);
      }
    }
  };

  const renderRow = (post) => (
    <tr
      key={post.id}
      className={`border-b border-slate-100 hover:bg-slate-50/50 transition-colors ${focusRing(
        focusId,
        post.id,
      )}`}
    >
      {/* Post Info */}
      <td className="px-6 py-4 max-w-sm">
        <div className="flex items-center gap-3">
          {post.coverPhoto ? (
            <img
              src={post.coverPhoto}
              alt=""
              className="h-12 w-12 rounded-lg object-cover border border-slate-200 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
              <Tag size={18} />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">
              {post.title || "Untitled Post"}
            </p>
            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
              {post.truncatedDescription || post.description}
            </p>
            {post.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                <MapPin size={10} /> {post.location}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Author Info (Admin view) */}
      <td className="px-6 py-4">
        {post.author ? (
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center text-xs shrink-0">
              {post.author.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">
                {post.author.fullName || post.author.name || "Unknown"}
              </p>
              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase bg-slate-100 text-slate-600">
                {post.author.role || "user"}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Anonymous</span>
        )}
      </td>

      {/* Engagement */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 font-medium text-red-600" title="Likes">
            <Heart size={14} className="fill-red-500 text-red-500" />
            {post.likesCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-blue-600" title="Comments">
            <MessageSquare size={14} />
            {post.commentsCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-emerald-600" title="Shares">
            <Share2 size={14} />
            {post.sharesCount ?? 0}
          </span>
        </div>
      </td>

      {/* Date */}
      <td className="px-6 py-4 text-xs text-slate-500">
        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—"}
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-center">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            data-action="view"
            data-id={post.id}
            title="View Details"
            className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Eye size={16} />
          </button>
          <button
            type="button"
            data-action="edit"
            data-id={post.id}
            title="Edit Post"
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 size={16} />
          </button>
          <button
            type="button"
            data-action="delete"
            data-id={post.id}
            title="Delete Post"
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manage Posts</h1>
          <p className="mt-1 text-slate-600 text-sm">
            {isLoading ? "Loading..." : `Moderation, engagement, and feed management — ${total} posts`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors cursor-pointer"
          >
            <Plus size={16} /> Create Post
          </button>
        </div>
      </div>

      {/* Alert Notice */}
      {notice.text && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          <span>{notice.text}</span>
          <button onClick={() => setNotice({ type: "", text: "" })} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable
            id="manage-posts-table"
            columns={COLUMNS}
            data={posts}
            renderRow={renderRow}
            onAction={onAction}
            emptyText="No posts found."
          />
        )}
      </div>

      {/* CREATE / EDIT POST MODAL */}
      {(createModalOpen || editTarget) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-900">
                {editTarget ? "Edit Post" : "Create New Post"}
              </h2>
              <button
                onClick={() => {
                  setCreateModalOpen(false);
                  setEditTarget(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Foundation Pour Completed"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write the full post description or update here..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Cover Photo URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.coverPhoto}
                  onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Additional Photos (Comma-separated URLs)
                </label>
                <input
                  type="text"
                  value={formData.photos}
                  onChange={(e) => setFormData({ ...formData, photos: e.target.value })}
                  placeholder="https://photo1.jpg, https://photo2.jpg"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="concrete, safety, site"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Mohali, Punjab"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setCreateModalOpen(false);
                    setEditTarget(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-2 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-600 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editTarget
                    ? "Update Post"
                    : "Create Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW POST DETAIL MODAL */}
      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {activePost?.title || "Post Details"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  ID: {activePost?.id}
                </p>
              </div>
              <button
                onClick={() => setDetailTarget(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Author Information (Admin Only) */}
            {activePost?.author && (
              <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm">
                    {activePost.author.name?.charAt(0)?.toUpperCase() || "A"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {activePost.author.fullName || activePost.author.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Author ID: {activePost.author.id}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold uppercase bg-primary-100 text-primary-800">
                  {activePost.author.role}
                </span>
              </div>
            )}

            {/* Post Description */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Description
              </h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                {activePost?.description}
              </p>
            </div>

            {/* Photos */}
            {activePost?.photos && activePost.photos.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Photos ({activePost.photos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {activePost.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`Photo ${i + 1}`}
                      className="h-28 w-full object-cover rounded-lg border border-slate-200"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Location & Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
              {activePost?.location && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-slate-100 text-slate-700">
                  <MapPin size={12} /> {activePost.location}
                  {activePost.latitude && activePost.longitude && (
                    <span className="text-[10px] text-slate-400">
                      ({activePost.latitude}, {activePost.longitude})
                    </span>
                  )}
                </span>
              )}
              {activePost?.tags?.map((t, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700"
                >
                  <Tag size={10} /> {t}
                </span>
              ))}
            </div>

            {/* Engagement Metrics */}
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-center">
              <div>
                <p className="text-lg font-bold text-red-600">
                  {activePost?.likesCount ?? 0}
                </p>
                <p className="text-xs text-slate-500">Likes</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-600">
                  {activePost?.commentsCount ?? 0}
                </p>
                <p className="text-xs text-slate-500">Comments</p>
              </div>
              <div>
                <p className="text-lg font-bold text-emerald-600">
                  {activePost?.sharesCount ?? 0}
                </p>
                <p className="text-xs text-slate-500">Shares</p>
              </div>
            </div>

            {/* Comments Section */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Comments ({commentsList.length})
              </h3>

              {/* Add comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Write a comment as admin..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && commentText.trim()) {
                      addCommentMutation.mutate({
                        id: activePost.id,
                        content: commentText.trim(),
                      });
                    }
                  }}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button
                  disabled={!commentText.trim() || addCommentMutation.isPending}
                  onClick={() =>
                    addCommentMutation.mutate({
                      id: activePost.id,
                      content: commentText.trim(),
                    })
                  }
                  className="rounded-lg bg-primary px-3 py-2 text-white hover:bg-primary-600 disabled:opacity-50 cursor-pointer"
                >
                  <Send size={16} />
                </button>
              </div>

              {/* Comments list */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {commentsList.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">No comments yet.</p>
                ) : (
                  commentsList.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-lg bg-slate-50 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800">
                          {c.author?.fullName || c.author?.name || "User"}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                        </span>
                      </div>
                      <p className="text-slate-600">{c.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
