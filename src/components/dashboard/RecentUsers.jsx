import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { statusBadgeClass, roleBadgeClass } from "../../theme/colors";

export default function RecentUsers({ users }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Users & Companies
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Latest platform registrations
          </p>
        </div>

        <button
          onClick={() => navigate("/users")}
          className="text-xs font-semibold text-primary hover:text-orange-700 transition-colors"
        >
          View All Users
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <th className="pb-3 pl-2">User</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Registered</th>
              <th className="pb-3 pr-2 text-right">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-xs text-slate-400">
                  No recent users
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  onClick={() => navigate(`/users/${user.id}`)}
                  className="transition-colors hover:bg-slate-50/70 cursor-pointer"
                >
                  <td className="py-3.5 pl-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-xs font-bold text-primary">
                        {(user.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors">
                          {user.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${roleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>

                  <td className="py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  <td className="py-3.5 text-xs text-slate-500">
                    {user.date ? new Date(user.date).toLocaleDateString() : "—"}
                  </td>

                  <td className="py-3.5 pr-2 text-right">
                    <span className="inline-flex items-center justify-center rounded-lg p-1 text-slate-400 hover:text-primary">
                      <ChevronRight size={16} />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
