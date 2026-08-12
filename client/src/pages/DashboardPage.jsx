import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { projectApi } from "../api/client";
import Modal from "../components/Modal";
import { PageLoader } from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";

const emptyProject = { name: "", description: "", status: "active" };

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyProject);
  const [submitting, setSubmitting] = useState(false);

  const loadProjects = async () => {
    try {
      setError("");
      const data = await projectApi.list();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await projectApi.create({
        name: form.name,
        description: form.description || undefined,
      });
      setModalOpen(false);
      setForm(emptyProject);
      await loadProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Overview
          </p>
          <h1 className="mt-1 text-3xl font-extrabold text-slate-900">
            Your projects
          </h1>
          <p className="mt-2 text-slate-500">
            Create projects, invite teammates, and track tasks.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700"
        >
          + New project
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {projects.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-slate-900">No projects yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Create your first project to start adding tasks and inviting team
            members.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-6 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Create project
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-700">
                    {project.name}
                  </h3>
                  <StatusBadge status={project.status} type="project" />
                </div>
                <span className="rounded-xl bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  Open
                </span>
              </div>
              <p className="mt-4 line-clamp-3 text-sm text-slate-500">
                {project.description || "No description provided."}
              </p>
              <p className="mt-6 text-xs text-slate-400">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        title="Create project"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Project name
            </span>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              placeholder="Website redesign"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">
              Description
            </span>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              placeholder="What is this project about?"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
          >
            {submitting ? "Creating..." : "Create project"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
