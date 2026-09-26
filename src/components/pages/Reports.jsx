import { Plus, Download, TrendingUp, FileText, Filter } from "lucide-react";

const reports = [
  { id: 1, name: "Q3 Performance Report", type: "Performance", generated: "Aug 28, 2024", size: "2.4 MB" },
  { id: 2, name: "User Growth Analytics", type: "Analytics", generated: "Aug 26, 2024", size: "1.8 MB" },
  { id: 3, name: "Project Completion Status", type: "Project", generated: "Aug 25, 2024", size: "3.2 MB" },
  { id: 4, name: "Revenue Report", type: "Financial", generated: "Aug 20, 2024", size: "2.1 MB" },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Reports</h1>
          <p className="mt-2 text-slate-600">View and generate {reports.length} reports</p>
        </div>
        <button className="flex items-center gap-2 rounded-lg bg-primary text-white px-4 py-2.5 hover:bg-primary-600 transition-colors font-medium shadow-lg shadow-primary/20">
          <Plus size={20} /> Generate Report
        </button>
      </div>

      <div className="space-y-4">
        {reports.map((report) => (
          <div key={report.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{report.name}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-slate-500">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.generated}</span>
                    <span>•</span>
                    <span>{report.size}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <Download size={20} className="text-blue-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}