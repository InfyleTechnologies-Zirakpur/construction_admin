import { useNavigate } from "react-router-dom";
import { statusBadgeClass } from "../../theme/colors";

export default function RecentProjects({ projects }) {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-2">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Recent Projects
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Active and ongoing construction milestones
          </p>
        </div>

        <button
          onClick={() => navigate("/projects")}
          className="text-xs font-semibold text-primary hover:text-orange-700 transition-colors"
        >
          View All Projects
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {projects.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-400">No recent projects found</p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="py-4 transition-colors hover:bg-slate-50/70 cursor-pointer rounded-xl px-2"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {project.contractor || "No location set"}
                  </p>
                </div>

                <span
                  className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusBadgeClass(
                    project.status
                  )}`}
                >
                  {project.status || "active"}
                </span>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-400">Completion</span>
                  <span className="font-semibold text-slate-700">
                    {project.progress}%
                  </span>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
