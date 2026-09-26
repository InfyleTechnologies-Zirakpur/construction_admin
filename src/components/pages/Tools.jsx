import { Plus, Download, Settings, Zap, Grid, Code } from "lucide-react";

const tools = [
  { id: 1, name: "Figma", category: "Design", status: "Active", users: 12, icon: "🎨" },
  { id: 2, name: "GitHub", category: "Development", status: "Active", users: 45, icon: "💻" },
  { id: 3, name: "Jira", category: "Project Management", status: "Active", users: 38, icon: "📋" },
  { id: 4, name: "Slack", category: "Communication", status: "Active", users: 120, icon: "💬" },
];

export default function Tools() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tools</h1>
          <p className="mt-2 text-slate-600">Manage {tools.length} integrated tools</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2.5 hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20">
          <Plus size={20} /> Add Tool
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tools.map((tool) => (
          <div key={tool.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{tool.icon}</div>
                <div>
                  <h3 className="font-bold text-slate-900">{tool.name}</h3>
                  <p className="text-sm text-slate-500">{tool.category}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Settings size={18} className="text-slate-500" />
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div>
                <p className="text-xs text-slate-500">Active Users</p>
                <p className="text-lg font-bold text-slate-900">{tool.users}</p>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">{tool.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}