import { useState } from "react";
import { X } from "lucide-react";

// Image that never shows a broken icon: on error it renders the reference
// name (initials) instead. Clicking a loaded image opens an in-screen
// preview modal with a close button.
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
  const name = user?.fullName || user?.email || "?";
  const showImg = user?.avatarUrl && !failed;
  const style = { width: size, height: size, fontSize: Math.max(12, size * 0.38) };

  const inner = showImg ? (
    <img
      src={user.avatarUrl}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full rounded-full object-cover"
    />
  ) : (
    <span className="font-semibold">{initialsOf(name)}</span>
  );

  const cls =
    "flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white";

  if (showImg && onPreview) {
    return (
      <button type="button" onClick={() => onPreview(user.avatarUrl, name)} className={cls} style={style} title="Preview photo">
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

export function ImagePreview({ src, name, onClose }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <p className="truncate text-sm font-semibold text-slate-800">{name || "Preview"}</p>
          <button onClick={onClose} className="rounded-lg p-2 hover:bg-slate-100" title="Close">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="flex items-center justify-center bg-slate-100 p-6">
          {!src || failed ? (
            <div className="flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-4xl font-bold text-white">
              {initialsOf(name)}
            </div>
          ) : (
            <img
              src={src}
              alt={name}
              onError={() => setFailed(true)}
              className="max-h-[60vh] rounded-lg object-contain"
            />
          )}
        </div>
      </div>
    </div>
  );
}
