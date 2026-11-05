import { useEffect, useRef } from "react";

// Thin React wrapper around DataTables.net (CDN global `DataTable`).
// Rows stay rendered by React; DataTables only adds search / sort / pagination.
// Actions inside cells work via data-action / data-id delegation.
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
  }, [dataKey]);

  return (
    <div className="overflow-x-auto">
      <table id={id} ref={tableRef} className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/80">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 ${
                  col.center ? "text-center" : "text-left"
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {(data || []).map((row) => renderRow(row))}
          {(data || []).length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-14 text-center text-sm text-slate-400">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
