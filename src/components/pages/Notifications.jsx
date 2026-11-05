import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Clock,
  Send,
  Loader2,
  ArrowUpRight,
  User,
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, extractList, apiError } from "../../api";
import { notificationTarget } from "../../api/notificationTargets";

const EVENTS = [
  "admin_announcement",
];

export default function Notifications() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    title: "",
    body: "",
    event: "admin_announcement",
    userIds: "",
  });
  const [isBroadcast, setIsBroadcast] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Filters & Pagination
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [search, setSearch] = useState("");

  const listQuery = useQuery({
    queryKey: ["admin-notifications", page, selectedEvent, search],
    queryFn: () =>
      notificationsApi.adminList({
        page,
        limit: 20,
        event: selectedEvent || undefined,
        search: search.trim() || undefined,
      }),
  });

  const sendMutation = useMutation({
    mutationFn: () =>
      notificationsApi.send({
        title: form.title.trim(),
        body: form.body.trim(),
        event: form.event,
        ...(!isBroadcast && form.userIds.trim()
          ? {
              userIds: form.userIds
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            }
          : {}),
      }),
    onSuccess: (data) => {
      const count = data?.data?.count ?? data?.count ?? "?";
      setFeedback({ ok: true, text: `Dispatched to ${count} recipient user(s)` });
      setForm({ title: "", body: "", event: "admin_announcement", userIds: "" });
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e) => setFeedback({ ok: false, text: apiError(e) }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const rawData = listQuery.data?.data ?? listQuery.data;
  const { items, total } = extractList(rawData);
  const unreadCount = rawData?.unreadCount ?? items.filter((n) => !n.isRead).length;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Broadcast & Messaging
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Notifications Center
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            {total} total system notifications recorded · {unreadCount} unread
          </p>
        </div>

        <button
          onClick={() => markAllMutation.mutate()}
          disabled={markAllMutation.isPending || unreadCount === 0}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          <Check size={15} /> Mark all as read
        </button>
      </div>

      {/* Admin Announcement / Send Form */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-800">
              <Send size={16} className="text-primary" /> Send Announcement / Push Notification
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Dispatches notification with real-time push to web and mobile devices.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="Announcement Title *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              value={form.event}
              onChange={(e) => setForm({ ...form, event: e.target.value })}
            >
              {EVENTS.map((ev) => (
                <option key={ev} value={ev}>
                  {ev}
                </option>
              ))}
            </select>
          </div>

          <textarea
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            rows={3}
            placeholder="Notification message body / content *"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
          />

          {/* Audience selection */}
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  checked={isBroadcast}
                  onChange={() => setIsBroadcast(true)}
                  className="text-primary focus:ring-primary"
                />
                <Users size={15} className="text-slate-500" />
                Broadcast to all active users
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="audience"
                  checked={!isBroadcast}
                  onChange={() => setIsBroadcast(false)}
                  className="text-primary focus:ring-primary"
                />
                <User size={15} className="text-slate-500" />
                Target specific user IDs
              </label>
            </div>

            {!isBroadcast && (
              <div className="pt-2">
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none"
                  placeholder="Paste comma-separated user UUIDs (e.g. 550e8400-e29b-41d4-a716-446655440000)"
                  value={form.userIds}
                  onChange={(e) => setForm({ ...form, userIds: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>

        {feedback && (
          <div
            className={`rounded-xl p-3 text-xs font-medium border ${
              feedback.ok
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {feedback.text}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            onClick={() => sendMutation.mutate()}
            disabled={
              sendMutation.isPending ||
              !form.title.trim() ||
              !form.body.trim() ||
              (!isBroadcast && !form.userIds.trim())
            }
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-orange-600 disabled:opacity-50 transition-colors"
          >
            {sendMutation.isPending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
            {isBroadcast ? "Broadcast Announcement" : "Dispatch to Selected"}
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none"
            placeholder="Search notifications by title or message..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={15} className="text-slate-400" />
          <select
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-primary focus:outline-none w-full sm:w-auto"
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Event Types</option>
            {EVENTS.map((ev) => (
              <option key={ev} value={ev}>
                {ev}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {listQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : items.length > 0 ? (
          items.map((notif) => (
            <NotificationCard key={notif.id} notif={notif} />
          ))
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center text-xs text-slate-400">
            <Bell size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">No notifications found</p>
            <p className="text-slate-400 mt-0.5">
              No platform alerts matching current criteria.
            </p>
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-xs text-xs text-slate-600">
          <span>
            Page {page} of {totalPages} ({total} notifications)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-semibold text-slate-800">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationCard({ notif }) {
  const navigate = useNavigate();
  const target = notificationTarget(notif);
  const recipient = notif.user;

  return (
    <div
      className={`rounded-2xl border p-4 shadow-xs transition-all ${
        notif.isRead
          ? "border-slate-200 bg-white"
          : "border-primary-200/60 bg-primary-50/20"
      } ${target ? "hover:border-primary/40 cursor-pointer" : ""}`}
      onClick={() => {
        if (target) navigate(target);
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-1 items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary">
            <Bell size={18} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
              {notif.event && (
                <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600">
                  {notif.event}
                </span>
              )}
              {notif.isPushed && (
                <span className="rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-semibold">
                  FCM Push
                </span>
              )}
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  notif.isRead
                    ? "bg-slate-100 text-slate-500"
                    : "bg-primary-50 text-primary"
                }`}
              >
                {notif.isRead ? "Read" : "New"}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-600 whitespace-pre-line leading-relaxed">
              {notif.body}
            </p>

            {/* Recipient User Information */}
            <div className="mt-2.5 flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <User size={12} className="text-slate-400" />
                {recipient?.fullName || recipient?.email || notif.userId || "Broadcast Audience"}
              </span>
              {recipient?.role && (
                <span className="rounded bg-slate-200/60 px-1.5 py-0.5 font-medium text-slate-700 uppercase text-[9px]">
                  {recipient.role}
                </span>
              )}
            </div>

            {/* Timestamp & Target */}
            <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ""}
              </span>

              {target && (
                <span className="inline-flex items-center gap-1 font-semibold text-primary hover:underline">
                  View Target <ArrowUpRight size={12} />
                </span>
              )}
            </div>
          </div>
        </div>

        {!notif.isRead && (
          <span onClick={(e) => e.stopPropagation()}>
            <MutationReadButton id={notif.id} />
          </span>
        )}
      </div>
    </div>
  );
}

function MutationReadButton({ id }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => notificationsApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="rounded-lg p-2 transition-colors hover:bg-slate-100 text-slate-400 hover:text-primary disabled:opacity-50"
      title="Mark as read"
    >
      <Check size={16} />
    </button>
  );
}
