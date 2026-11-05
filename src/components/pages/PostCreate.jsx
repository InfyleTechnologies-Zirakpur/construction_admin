import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Loader2, Plus, Sparkles } from "lucide-react";
import { postsApi, apiError } from "../../api";

export default function PostCreate() {
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

  const createMutation = useMutation({
    mutationFn: (payload) => postsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      navigate("/posts");
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

    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div>
        <button
          onClick={() => navigate("/posts")}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft size={16} /> Back to Manage Posts
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Create Construction Feed Post
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Publish updates, project milestones, or site notices to all construction users.
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
              Post Title (Optional)
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Milestone Achieved: Foundation Pour Completed"
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
              placeholder="Write the full post description, project update, or site guidelines here..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Cover Photo Image URL (Optional)
            </label>
            <input
              type="url"
              value={formData.coverPhoto}
              onChange={(e) => setFormData({ ...formData, coverPhoto: e.target.value })}
              placeholder="https://example.com/site-photo.jpg"
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
              placeholder="https://img1.jpg, https://img2.jpg"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Tags (Comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                placeholder="concrete, safety, foundation"
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
                placeholder="e.g. Sector 62, Mohali"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/posts")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !formData.description.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              {createMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              Publish Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

