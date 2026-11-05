import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ChevronRight,
} from "lucide-react";
import { postsApi, extractList, apiError } from "../../api";
import DataTable from "../common/DataTable";

const COLUMNS = [
  { key: "post", label: "Post Content" },
  { key: "author", label: "Author" },
  { key: "engagement", label: "Engagement" },
  { key: "created", label: "Published Date" },
  { key: "actions", label: "Actions", center: true },
];

export default function Posts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState({ type: "", text: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["posts", search],
    queryFn: () => postsApi.list({ page: 1, limit: 100, search: search || undefined }),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["posts"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (id) => postsApi.remove(id),
    onSuccess: () => {
      setNotice({ type: "success", text: "Post deleted successfully" });
      invalidate();
    },
    onError: (err) => setNotice({ type: "error", text: apiError(err) }),
  });

  const { items: posts, total } = extractList(data);

  const onAction = (action, id) => {
    if (action === "view") {
      navigate(`/posts/${id}`);
    } else if (action === "edit") {
      navigate(`/posts/${id}/edit`);
    } else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this post?")) {
        deleteMutation.mutate(id);
      }
    }
  };

  const renderRow = (post) => (
    <tr
      key={post.id}
      onClick={() => navigate(`/posts/${post.id}`)}
      className="transition-colors hover:bg-slate-50/70 cursor-pointer"
    >
      {/* Post Info */}
      <td className="px-5 py-4 max-w-sm">
        <div className="flex items-center gap-3">
          {post.coverPhoto ? (
            <img
              src={post.coverPhoto}
              alt=""
              className="h-11 w-11 rounded-xl object-cover border border-slate-200 shrink-0"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="h-11 w-11 rounded-xl bg-primary-50 border border-primary-200/50 flex items-center justify-center shrink-0 text-primary">
              <Tag size={18} />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate hover:text-primary transition-colors">
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

      {/* Author */}
      <td className="px-5 py-4 text-xs">
        {post.author ? (
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary-50 text-primary font-bold flex items-center justify-center text-xs shrink-0">
              {post.author.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="font-medium text-slate-800">
                {post.author.fullName || post.author.name || "Unknown"}
              </p>
              <span className="text-[10px] text-slate-400 capitalize">
                {post.author.role || "user"}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-slate-400">Anonymous</span>
        )}
      </td>

      {/* Engagement */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 font-semibold text-rose-600" title="Likes">
            <Heart size={13} className="fill-rose-500" />
            {post.likesCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-blue-600" title="Comments">
            <MessageSquare size={13} />
            {post.commentsCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600" title="Shares">
            <Share2 size={13} />
            {post.sharesCount ?? 0}
          </span>
        </div>
      </td>

      {/* Date */}
      <td className="px-5 py-4 text-xs text-slate-500">
        {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "—"}
      </td>

      {/* Actions */}
      <td className="px-5 py-4 text-center">
        <div className="inline-flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            data-action="view"
            data-id={post.id}
            title="View Details"
            className="p-1.5 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            data-action="edit"
            data-id={post.id}
            title="Edit Post"
            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            data-action="delete"
            data-id={post.id}
            title="Delete Post"
            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Community & Updates
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Manage Feed Posts
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {isLoading ? "Loading posts..." : `Moderation, engagement, and feed management — ${total} posts`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-xs"
          />
          <button
            onClick={() => navigate("/posts/create")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 transition-colors cursor-pointer"
          >
            <Plus size={15} /> Create Post
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

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
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
    </div>
  );
}
