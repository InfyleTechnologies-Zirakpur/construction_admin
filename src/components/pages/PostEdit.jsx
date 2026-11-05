import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Loader2 } from "lucide-react";
import { postsApi, apiError } from "../../api";

export default function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverPhoto: "",
    photos: "",
    tags: "",
    location: "",
  });

  const { data: postData, isLoading } = useQuery({
    queryKey: ["post-detail", id],
    queryFn: () => postsApi.get(id),
  });

  const post = postData?.data ?? postData;

  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        description: post.description || "",
        coverPhoto: post.coverPhoto || "",
        photos: Array.isArray(post.photos) ? post.photos.join(", ") : "",
        tags: Array.isArray(post.tags) ? post.tags.join(", ") : "",
        location: post.location || "",
      });
    }
  }, [post]);

  const updateMutation = useMutation({
    mutationFn: (payload) => postsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-detail", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate(`/posts/${id}`);
    },
    onError: (err) => setError(apiError(err)),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

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

    updateMutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <button
          onClick={() => navigate(`/posts/${id}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Post
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Edit Post
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Update description, media, or tags for this post.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Post Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description / Content *
            </label>
            <textarea
              rows={5}
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Cover Photo Image URL
            </label>
            <input
              type="url"
              value={formData.coverPhoto}
              onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Additional Photos (Comma-separated URLs)
            </label>
            <input
              type="text"
              value={formData.photos}
              onChange={(e) => setFormData({ ...formData, photos: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Tags
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Site Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(`/posts/${id}`)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !formData.description.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {updateMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

