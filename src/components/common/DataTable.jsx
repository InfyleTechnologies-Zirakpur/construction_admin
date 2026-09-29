import { useEffect, useRef } from "react";

// Thin React wrapper around DataTables.net (CDN global `DataTable`).
// Rows stay rendered by React; DataTables only adds search / sort / pagination.
// Actions inside cells work via data-action / data-id delegation (no per-row handlers
// lost on redraw). Falls back to a plain table if the CDN is unreachable.
export default function DataTable({ id, columns, data, renderRow, onAction, emptyText = "No records found" }) {
  const tableRef = useRef(null);
  const actionRef = useRef(onAction);
  actionRef.current = onAction;
  const dataKey = (data || []).map((r) => r.id ?? JSON.stringify(r)).join("|");

  useEffect(() => {
    const el = tableRef.current;
    if (!el) return undefined;

    const onClick = (e) => {
      const btn = e.target.closest("[data-action]");
      if (btn && actionRef.current) {
        actionRef.current(btn.dataset.action, btn.dataset.id, e);
      }
    };
    el.addEventListener("click", onClick);

    let dt = null;
    try {
      if (typeof window !== "undefined" && window.DataTable) {
        const rowCount = el.querySelectorAll("tbody tr").length;
        if (rowCount > 0) {
          dt = new window.DataTable(el, {
            perPage: 10,
            searchable: true,
            sortable: true,
          });
        }
      }
    } catch {
      dt = null;
    }

    return () => {
      el.removeEventListener("click", onClick);
      try {
        dt?.destroy();
      } catch {
        /* noop */
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataKey]);

  return (
    <div className="overflow-x-auto">
      <table id={id} ref={tableRef} className="w-full">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-6 py-4 text-sm font-semibold text-slate-700 ${col.center ? "text-center" : "text-left"}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {(data || []).map((row) => renderRow(row))}
          {(data || []).length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-16 text-center text-sm text-slate-500">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
