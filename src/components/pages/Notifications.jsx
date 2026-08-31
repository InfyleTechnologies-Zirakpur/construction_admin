import { Bell, Trash2, Check, Clock } from "lucide-react";

const notifications = [
  { id: 1, title: "New user registration", message: "5 new users joined today", type: "info", time: "2 hours ago", read: false },
  { id: 2, title: "Project completed", message: "Website Redesign project has been completed", type: "success", time: "1 day ago", read: false },
  { id: 3, title: "System update", message: "A new version is available for download", type: "warning", time: "3 days ago", read: true },
  { id: 4, title: "Low storage alert", message: "Server storage is at 85% capacity", type: "error", time: "1 week ago", read: true },
];

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Notifications</h1>
          <p className="mt-2 text-slate-600">View all system notifications</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors font-medium text-sm">
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div key={notif.id} className={`rounded-2xl border p-6 shadow-sm transition-all ${
            notif.read 
              ? "border-slate-200 bg-white" 
              : "border-blue-200 bg-blue-50"
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                  notif.type === "success" ? "bg-emerald-100 text-emerald-600" :
                  notif.type === "warning" ? "bg-amber-100 text-amber-600" :
                  notif.type === "error" ? "bg-red-100 text-red-600" :
                  "bg-blue-100 text-blue-600"
                }`}>
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900">{notif.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                    <Clock size={14} />
                    {notif.time}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                {!notif.read && (
                  <button className="p-2 hover:bg-blue-100 rounded-lg transition-colors">
                    <Check size={18} className="text-blue-600" />
                  </button>
                )}
                <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <Trash2 size={18} className="text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}