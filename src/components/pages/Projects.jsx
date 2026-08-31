import { Plus, MoreHorizontal, Calendar, Users, BarChart3 } from "lucide-react";

const projects = [
  { id: 1, name: "Website Redesign", status: "In Progress", progress: 65, team: 4, dueDate: "2024-09-15", color: "from-blue-500 to-blue-600" },
  { id: 2, name: "Mobile App Dev", status: "Completed", progress: 100, team: 6, dueDate: "2024-08-30", color: "from-emerald-500 to-emerald-600" },
  { id: 3, name: "API Integration", status: "In Progress", progress: 45, team: 3, dueDate: "2024-10-01", color: "from-purple-500 to-purple-600" },
  { id: 4, name: "Database Migration", status: "On Hold", progress: 30, team: 2, dueDate: "2024-10-15", color: "from-amber-500 to-amber-600" },
];

export default function Projects() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="mt-2 text-slate-600">Manage and track {projects.length} projects</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20">
          <Plus size={20} /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <div key={project.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{project.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{project.dueDate}</p>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <MoreHorizontal size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-600">Progress</span>
                  <span className="text-sm font-bold text-slate-900">{project.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${project.color}`} style={{ width: `${project.progress}%` }} />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-slate-600">
                  <Users size={16} />
                  <span className="text-sm">{project.team} Members</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  project.status === "Completed" ? "bg-emerald-50 text-emerald-700" :
                  project.status === "In Progress" ? "bg-blue-50 text-blue-700" :
                  "bg-amber-50 text-amber-700"
                }`}>
                  {project.status}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}