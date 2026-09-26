import { Plus, Edit2, Trash2, Shield, Lock } from "lucide-react";

const roles = [
  { id: 1, name: "Administrator", permissions: 15, users: 2, description: "Full system access", color: "from-primary to-primary-600" },
  { id: 2, name: "Manager", permissions: 10, users: 5, description: "Team management access", color: "from-blue-400 to-blue-600" },
  { id: 3, name: "Developer", permissions: 8, users: 12, description: "Development access", color: "from-dark-400 to-dark-600" },
  { id: 4, name: "User", permissions: 3, users: 45, description: "Limited read-only access", color: "from-success-400 to-success-600" },
];

export default function Roles() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Roles & Permissions</h1>
          <p className="mt-2 text-slate-600">Manage {roles.length} roles and access control</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2.5 hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20">
          <Plus size={20} /> Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className={`h-12 w-12 rounded-lg bg-linear-to-br ${role.color} text-white flex items-center justify-center`}>
                  <Shield size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{role.name}</h3>
                  <p className="text-sm text-slate-500 mt-1">{role.description}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Edit2 size={18} className="text-slate-500" />
                </button>
                <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={18} className="text-slate-400 hover:text-red-600" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Permissions</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{role.permissions}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold">Users</p>
                <p className="text-lg font-bold text-slate-900 mt-1">{role.users}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}