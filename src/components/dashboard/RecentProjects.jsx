import { statusBadgeClass } from "../../theme/colors";

export default function RecentProjects({ projects }) {
  return (
    <div className="rounded-2xl border border-line bg-white shadow-sm hover:shadow-lg transition-all overflow-hidden">
      <div className="border-b border-line p-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-dark">
            Recent Projects
          </h2>
          <p className="mt-1 text-sm text-text-secondary">Latest project updates</p>

        </div>

        <button className="text-sm font-semibold text-primary hover:text-primary-700">
          View All
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {projects.map((project) => (
          <div
            key={project.id}
            className="p-5 transition hover:bg-slate-50 sm:p-6"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">
                  {project.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {project.contractor}
                </p>
              </div>

              <span
                className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-slate-500">
                  Progress
                </span>

                <span className="font-semibold text-slate-800">
                  {project.progress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary"
                  style={{
                    width: `${project.progress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}