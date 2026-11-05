import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Loader2,
  Edit2,
  Trash2,
  Heart,
  MessageSquare,
  Share2,
  MapPin,
  Tag,
  Send,
  Calendar,
  User,
} from "lucide-react";
import { postsApi, extractList, apiError } from "../../api";

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data: detailData, isLoading, isError, error, refetch: refetchDetail } = useQuery({
    queryKey: ["post-detail", id],
    queryFn: () => postsApi.get(id),
  });

  const { data: commentsData, refetch: refetchComments } = useQuery({
    queryKey: ["post-comments", id],
    queryFn: () => postsApi.comments(id, { page: 1, limit: 50 }),
  });

  const post = detailData?.data ?? detailData;
  const comments = extractList(commentsData).items;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["post-detail", id] });
    queryClient.invalidateQueries({ queryKey: ["post-comments", id] });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const deleteMutation = useMutation({
    mutationFn: () => postsApi.remove(id),
    onSuccess: () => {
      alert("Post deleted successfully");
      navigate("/posts");
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const addCommentMutation = useMutation({
    mutationFn: (content) => postsApi.addComment(id, { content }),
    onSuccess: () => {
      setCommentText("");
      refetchComments();
      refetchDetail();
      setNotice({ type: "success", text: "Comment added successfully" });
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-12 text-center">
        <p className="text-sm font-semibold text-red-600">{apiError(error) || "Post not found"}</p>
        <button
          onClick={() => navigate("/posts")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-orange-600"
        >
          Back to Manage Posts
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => navigate("/posts")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Manage Posts
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/posts/${id}/edit`)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:border-primary hover:text-primary transition-colors"
          >
            <Edit2 size={14} /> Edit Post
          </button>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this post?")) {
                deleteMutation.mutate();
              }
            }}
            disabled={deleteMutation.isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {notice.text && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs font-medium ${
            notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {notice.text}
        </div>
      )}

      {/* Main Post Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        {/* Author Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 font-bold text-primary text-sm">
              {post.author?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900">
                {post.author?.fullName || post.author?.name || "Anonymous Admin"}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="capitalize">{post.author?.role || "user"}</span>
                {post.createdAt && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-semibold text-rose-600">
              <Heart size={15} className="fill-rose-500" /> {post.likesCount ?? 0}
            </span>
            <span className="flex items-center gap-1 font-semibold text-blue-600">
              <MessageSquare size={15} /> {post.commentsCount ?? comments.length}
            </span>
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <Share2 size={15} /> {post.sharesCount ?? 0}
            </span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          {post.title && (
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mb-3 sm:text-2xl">
              {post.title}
            </h1>
          )}
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {post.description}
          </p>
        </div>

        {/* Media / Photos */}
        {post.coverPhoto && (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <img
              src={post.coverPhoto}
              alt="Cover"
              className="max-h-96 w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        {Array.isArray(post.photos) && post.photos.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
              Additional Photos
            </span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {post.photos.map((photoUrl, idx) => (
                <a
                  key={idx}
                  href={photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50"
                >
                  <img
                    src={photoUrl}
                    alt={`Photo ${idx + 1}`}
                    className="h-32 w-full object-cover transition-transform hover:scale-105"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tags & Location */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          {post.location && (
            <span className="flex items-center gap-1 font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              <MapPin size={12} className="text-primary" /> {post.location}
            </span>
          )}
          {Array.isArray(post.tags) &&
            post.tags.map((tag, i) => (
              <span
                key={i}
                className="flex items-center gap-1 font-medium text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200"
              >
                <Tag size={11} className="text-slate-400" /> {tag}
              </span>
            ))}
        </div>
      </div>

      {/* Comments Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs space-y-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-3">
          Discussion & Comments ({comments.length})
        </h2>

        {/* Add Comment Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (commentText.trim()) {
              addCommentMutation.mutate(commentText.trim());
            }
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write a moderation note or response..."
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            disabled={addCommentMutation.isPending || !commentText.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {addCommentMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Send size={14} />
            )}
            Send
          </button>
        </form>

        {/* Comments List */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No comments posted yet.</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    {comment.author?.fullName || comment.author?.name || "User"}
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{comment.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

