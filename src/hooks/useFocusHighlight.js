import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Reads ?focus=<id> (set by notification deep-links) and scrolls the
// matching row into view. Returns the focused id so rows can highlight it.
export function useFocusHighlight() {
  const [params] = useSearchParams();
  const focusId = params.get("focus");

  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`row-${focusId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focusId]);

  return focusId;
}

export const focusRing = (id, focusId) =>
  id && focusId && String(id) === String(focusId)
    ? "ring-2 ring-primary border-primary"
    : "";
