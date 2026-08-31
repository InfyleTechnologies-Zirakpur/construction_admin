import { Plus, Search, MoreHorizontal, Mail, Phone } from "lucide-react";

const users = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 234 567 8900", status: "Active", role: "Admin" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1 234 567 8901", status: "Active", role: "Manager" },
  { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "+1 234 567 8902", status: "Inactive", role: "User" },
  { id: 4, name: "Alice Williams", email: "alice@example.com", phone: "+1 234 567 8903", status: "Active", role: "Manager" },
];

export default function Users() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Users</h1>
          <p className="mt-2 text-slate-600">Manage and view all {users.length} users</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20">
          <Plus size={20} /> Add User
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 p-6">
          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2.5">
            <Search size={18} className="text-slate-500" />
            <input type="text" placeholder="Search users..." className="bg-transparent outline-none w-full text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Email</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Role</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                        {user.name.charAt(0)}
                      </div>
                      <p className="font-medium text-slate-900">{user.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{user.phone}</td>
                  <td className="px-6 py-4"><span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{user.role}</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      user.status === "Active" 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal size={18} className="text-slate-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}