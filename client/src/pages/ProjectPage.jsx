import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { projectApi, taskApi } from "../api/client";
import Modal from "../components/Modal";
import { PageLoader } from "../components/Spinner";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

const emptyTask = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: "",
  assignedTo: "",
  status: "todo",
};

const emptyInvite = { email: "", role: "member" };

function formatDate(value) {
  if (!value) {
    return "—";
  }
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("tasks");

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [inviteForm, setInviteForm] = useState(emptyInvite);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingTaskId, setUploadingTaskId] = useState(null);

  const isOwner = project?.ownerId === user?.id;

  const memberMap = useMemo(
    () => new Map(members.map((member) => [member.userId, member])),
    [members]
  );

  const loadData = async () => {
    try {
      setError("");
      const [projectData, taskData, memberData] = await Promise.all([
        projectApi.get(projectId),
        taskApi.list(projectId),
        projectApi.members(projectId),
      ]);

      setProject(projectData.project);
      setTasks(taskData.tasks || []);
      setMembers(memberData.members || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({
      ...emptyTask,
      assignedTo: user?.id || "",
      dueDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    });
    setTaskModalOpen(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      dueDate: new Date(task.dueDate).toISOString().slice(0, 16),
      assignedTo: task.assignedTo,
      status: task.status,
    });
    setTaskModalOpen(true);
  };

  const handleTaskSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    const payload = {
      title: taskForm.title,
      description: taskForm.description || undefined,
      priority: taskForm.priority,
      dueDate: new Date(taskForm.dueDate).toISOString(),
      assignedTo: taskForm.assignedTo,
    };

    try {
      if (editingTask) {
        await taskApi.update(projectId, editingTask.id, {
          ...payload,
          status: taskForm.status,
        });
      } else {
        await taskApi.create(projectId, payload);
      }

      setTaskModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) {
      return;
    }

    try {
      await taskApi.remove(projectId, taskId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInvite = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await projectApi.inviteMember(projectId, inviteForm);
      setInviteModalOpen(false);
      setInviteForm(emptyInvite);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Remove this member from the project?")) {
      return;
    }

    try {
      await projectApi.removeMember(projectId, memberId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRoleChange = async (memberId, role) => {
    try {
      await projectApi.updateMemberRole(projectId, memberId, { role });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpload = async (taskId, file) => {
    if (!file) {
      return;
    }

    setUploadingTaskId(taskId);
    try {
      await taskApi.uploadAttachment(projectId, taskId, file);
      await loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingTaskId(null);
    }
  };

  const handleDeleteAttachment = async (taskId) => {
    try {
      await taskApi.deleteAttachment(projectId, taskId);
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  if (!project) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        {error || "Project not found."}
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/"
        className="inline-flex items-center text-sm font-medium text-slate-500 transition hover:text-brand-600"
      >
        ← Back to dashboard
      </Link>

      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-slate-900">
              {project.name}
            </h1>
            <StatusBadge status={project.status} type="project" />
          </div>
          <p className="mt-2 max-w-2xl text-slate-500">
            {project.description || "No description yet."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={openCreateTask}
            className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            + New task
          </button>
          {isOwner && (
            <button
              type="button"
              onClick={() => setInviteModalOpen(true)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Invite member
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="mt-8 flex gap-2 border-b border-slate-200">
        {["tasks", "members"].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-4 py-3 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "border-brand-600 text-brand-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "tasks" ? (
        <div className="mt-6 space-y-4">
          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
              <p className="text-slate-500">No tasks yet. Create the first one.</p>
            </div>
          ) : (
            tasks.map((task) => {
              const assignee = memberMap.get(task.assignedTo);
              return (
                <article
                  key={task.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {task.title}
                        </h3>
                        <StatusBadge status={task.status} type="task" />
                        <StatusBadge status={task.priority} type="priority" />
                      </div>
                      {task.description && (
                        <p className="mt-2 text-sm text-slate-600">
                          {task.description}
                        </p>
                      )}
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                        <span>Due {formatDate(task.dueDate)}</span>
                        <span>
                          Assigned to{" "}
                          {assignee?.name || assignee?.email || "Unknown"}
                        </span>
                      </div>

                      {task.attachmentUrl && (
                        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                          <a
                            href={task.attachmentUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-brand-600 hover:text-brand-700"
                          >
                            View attachment
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(task.id)}
                            className="text-sm text-rose-600 hover:text-rose-700"
                          >
                            Remove file
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                        {uploadingTaskId === task.id ? "Uploading..." : "Upload file"}
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,.pdf,.doc,.docx"
                          disabled={uploadingTaskId === task.id}
                          onChange={(e) => {
                            handleUpload(task.id, e.target.files?.[0]);
                            e.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => openEditTask(task)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task.id)}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-4">Member</th>
                <th className="px-5 py-4">Role</th>
                {isOwner && <th className="px-5 py-4">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-t border-slate-100">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{member.name}</p>
                    <p className="text-slate-500">{member.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    {isOwner && member.role !== "owner" ? (
                      <select
                        value={member.role}
                        onChange={(e) =>
                          handleRoleChange(member.id, e.target.value)
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <StatusBadge status={member.role} type="role" />
                    )}
                  </td>
                  {isOwner && (
                    <td className="px-5 py-4">
                      {member.role !== "owner" && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-sm font-medium text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={taskModalOpen}
        title={editingTask ? "Edit task" : "Create task"}
        onClose={() => setTaskModalOpen(false)}
      >
        <form onSubmit={handleTaskSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Title</span>
            <input
              required
              value={taskForm.title}
              onChange={(e) =>
                setTaskForm({ ...taskForm, title: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Description</span>
            <textarea
              rows={3}
              value={taskForm.description}
              onChange={(e) =>
                setTaskForm({ ...taskForm, description: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Priority</span>
              <select
                value={taskForm.priority}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, priority: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Due date</span>
              <input
                type="datetime-local"
                required
                value={taskForm.dueDate}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, dueDate: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Assign to</span>
            <select
              required
              value={taskForm.assignedTo}
              onChange={(e) =>
                setTaskForm({ ...taskForm, assignedTo: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              {members.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name} ({member.role})
                </option>
              ))}
            </select>
          </label>
          {editingTask && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium">Status</span>
              <select
                value={taskForm.status}
                onChange={(e) =>
                  setTaskForm({ ...taskForm, status: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In progress</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
          >
            {submitting ? "Saving..." : editingTask ? "Save changes" : "Create task"}
          </button>
        </form>
      </Modal>

      <Modal
        open={inviteModalOpen}
        title="Invite team member"
        onClose={() => setInviteModalOpen(false)}
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Email</span>
            <input
              type="email"
              required
              value={inviteForm.email}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, email: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
              placeholder="teammate@example.com"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium">Role</span>
            <select
              value={inviteForm.role}
              onChange={(e) =>
                setInviteForm({ ...inviteForm, role: e.target.value })
              }
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
          >
            {submitting ? "Inviting..." : "Send invite"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
