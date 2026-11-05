import { useState } from "react";

// Image that never shows a broken icon: on error it renders the reference
// name (initials) instead.
function initialsOf(name) {
  const clean = (name || "?").trim();
  if (!clean || clean === "?") return "?";
  const parts = clean.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function SafeImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt={alt || "image"}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

export function Avatar({ user, size = 40, onPreview }) {
  const [failed, setFailed] = useState(false);
  const name = user?.fullName || user?.name || user?.email || "?";
  const showImg = (user?.avatarUrl || user?.profilePhotoUrl) && !failed;
  const style = { width: size, height: size, fontSize: Math.max(12, size * 0.38) };

  const inner = showImg ? (
    <img
      src={user.avatarUrl || user.profilePhotoUrl}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span className="font-bold">{initialsOf(name)}</span>
  );

  const cls =
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-100 text-primary-700 border border-primary-200";

  if (showImg && onPreview) {
    return (
      <button
        type="button"
        onClick={() => onPreview(user.avatarUrl || user.profilePhotoUrl, name)}
        className={cls}
        style={style}
        title="View photo"
      >
        {inner}
      </button>
    );
  }
  return (
    <div className={cls} style={style} title={name}>
      {inner}
    </div>
  );
}

// Fallback image viewer helper
export function ImagePreview({ src, name, onClose }) {
  const [failed, setFailed] = useState(false);
  if (!src) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs">
        <span className="font-semibold text-slate-700">{name || "Image Preview"}</span>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            Close
          </button>
        )}
      </div>
      <div className="flex justify-center bg-slate-50 p-2 rounded-lg">
        {failed ? (
          <span className="text-xs text-slate-400">Failed to load preview</span>
        ) : (
          <img
            src={src}
            alt={name || "Preview"}
            onError={() => setFailed(true)}
            className="max-h-60 rounded-md object-contain"
          />
        )}
      </div>
    </div>
  );
}
