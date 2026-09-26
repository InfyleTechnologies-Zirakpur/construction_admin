import { MoreHorizontal } from "lucide-react";
import { statusBadgeClass } from "../../theme/colors";

export default function RecentUsers({ users }) {
  return (
    <div className="rounded-2xl border border-line bg-white shadow-sm hover:shadow-lg transition-all overflow-hidden">
      <div className="border-b border-line p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-dark">
            Recent Users
          </h2>

          <p className="mt-1 text-sm text-text-secondary">
            Recently joined users and companies
          </p>
        </div>

        <button className="text-sm font-semibold text-primary hover:text-primary-700">
          View All
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-y border-line bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                User
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Role
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                Joined
              </th>

              <th className="px-6 py-3" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                      {user.name.charAt(0)}
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {user.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-slate-600">
                  {user.role}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                      user.status
                    )}`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-slate-500">
                  {user.date}
                </td>

                <td className="px-6 py-4">
                  <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}