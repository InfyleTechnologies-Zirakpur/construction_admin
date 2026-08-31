import { Plus, MapPin, DollarSign, Clock, Briefcase } from "lucide-react";

const jobs = [
  { id: 1, title: "Senior React Developer", company: "TechCorp", location: "Remote", salary: "$120K - $150K", type: "Full-time", posted: "2 days ago" },
  { id: 2, title: "UI/UX Designer", company: "Design Studio", location: "New York", salary: "$80K - $110K", type: "Full-time", posted: "1 week ago" },
  { id: 3, title: "DevOps Engineer", company: "CloudTech", location: "Remote", salary: "$100K - $140K", type: "Contract", posted: "3 days ago" },
  { id: 4, title: "Product Manager", company: "StartupXYZ", location: "San Francisco", salary: "$130K - $170K", type: "Full-time", posted: "5 days ago" },
];

export default function Jobs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Jobs</h1>
          <p className="mt-2 text-slate-600">Browse and manage {jobs.length} open positions</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20">
          <Plus size={20} /> Post Job
        </button>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <div key={job.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 text-white flex items-center justify-center font-bold">
                    {job.company.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <p className="text-sm text-slate-500">{job.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin size={16} />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <DollarSign size={16} />
                    <span className="text-sm">{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock size={16} />
                    <span className="text-sm">{job.posted}</span>
                  </div>
                </div>
              </div>
              <div className="ml-4 text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3">{job.type}</span>
                <button className="block w-24 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}