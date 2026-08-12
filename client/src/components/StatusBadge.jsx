export default function StatusBadge({ status, type = "project" }) {
  const styles = {
    project: {
      active: "bg-emerald-100 text-emerald-700",
      in_progress: "bg-amber-100 text-amber-700",
      completed: "bg-slate-200 text-slate-700",
    },
    task: {
      todo: "bg-slate-100 text-slate-700",
      in_progress: "bg-sky-100 text-sky-700",
      completed: "bg-emerald-100 text-emerald-700",
    },
    priority: {
      low: "bg-slate-100 text-slate-600",
      medium: "bg-amber-100 text-amber-700",
      high: "bg-rose-100 text-rose-700",
    },
    role: {
      owner: "bg-violet-100 text-violet-700",
      admin: "bg-indigo-100 text-indigo-700",
      member: "bg-sky-100 text-sky-700",
      viewer: "bg-slate-100 text-slate-600",
    },
  };

  const label = String(status || "").replace(/_/g, " ");
  const palette = styles[type] || styles.project;
  const color = palette[status] || "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${color}`}
    >
      {label}
    </span>
  );
}
