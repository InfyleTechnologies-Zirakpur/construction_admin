import { Plus, Star, MapPin, Briefcase } from "lucide-react";

const contractors = [
  { id: 1, name: "Alex Chen", specialty: "Full Stack Developer", rating: 4.8, projects: 12, location: "San Francisco", available: true },
  { id: 2, name: "Maria Rodriguez", specialty: "UI/UX Designer", rating: 4.9, projects: 8, location: "Madrid", available: true },
  { id: 3, name: "James Wilson", specialty: "DevOps Engineer", rating: 4.6, projects: 15, location: "London", available: false },
  { id: 4, name: "Sarah Ahmed", specialty: "Product Manager", rating: 4.7, projects: 10, location: "Dubai", available: true },
];

export default function Contractors() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contractors</h1>
          <p className="mt-2 text-slate-600">Manage {contractors.length} contractors</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/20">
          <Plus size={20} /> Invite Contractor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contractors.map((contractor) => (
          <div key={contractor.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-linear-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  {contractor.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{contractor.name}</h3>
                  <p className="text-sm text-slate-500">{contractor.specialty}</p>
                </div>
              </div>
              <span className={`w-3 h-3 rounded-full ${contractor.available ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-600">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-medium">{contractor.rating}</span>
                <span className="text-xs text-slate-500">({contractor.projects} projects)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin size={16} />
                <span className="text-sm">{contractor.location}</span>
              </div>
            </div>

            <button className="w-full mt-4 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}