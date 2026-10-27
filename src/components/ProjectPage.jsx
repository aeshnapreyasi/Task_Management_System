import { useCallback, useEffect, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import ViewTask from "./tasksPage/ViewTask";
import CreateTask from "./tasksPage/CreateTask";
import TaskProgress from "./tasksPage/TaskProgress";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]); // store the fetched tasks
  const [tasksLoading, setTasksLoading] = useState(false); //will check the task loading status
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [tasksError, setTasksError] = useState("");
  const [taskSaving, setTaskSaving] = useState(false);
  const [projectTaskCounts, setProjectTaskCounts] = useState({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");

  const user = useOutletContext();
  const isManager = user?.role === "MANAGER";
  const navigate = useNavigate();

  const fetchProjects = useCallback(async () => {
    try {
      setError("");

      const response = await fetch("/api/projects", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch projects");
      }

      setProjects(data.projects || []);
      await fetchProjectTaskCounts(data.projects); // for the bar progress 
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!isManager) return;

    async function fetchEmployees() {
      try {
        const response = await fetch("/api/projects/employees", {
          method: "GET",
          credentials: "include",
        });

        const result = await response.json();

        if (response.ok) {
          setEmployees(result.employees || []);
        }
      } catch (err) {
        console.error("Error fetching employees:", err);
      }
    }

    fetchEmployees();
  }, [isManager]);

  // fetching the tasks when the task button is clicked
  const fetchTasks = async (projectId) => {
    setTasksLoading(true);
    setTasksError("");
    setTasks([]);

    try {
      
      const response = await fetch(`/api/tasks?projectId=${projectId}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tasks!");
      }

      setTasks(data.tasks || []);
    } catch (error) 
    {
      console.log("Status update error:", error);
      setTasksError(error.message || "Something went wrong!");
    } finally {
      setTasksLoading(false);
    }
  };

  //function to createTask and to make api call so that, manager can create the task and assigend to the employee
  const handleCreateTask = async (taskData) => {
    if (!selectedProject) return;

    setTaskSaving(true);
    setTasksError("");

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...taskData,
          projectId: selectedProject.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task!");
      }

      setIsTaskFormOpen(false);
      await fetchTasks(selectedProject.id);
    } catch (error) {
      setTasksError(error.message || "Failed to create task!");
    } finally {
      setTaskSaving(false);
    }
  };

  //function to update the task status
  const handleStatusChange = async (taskId, status) => {
    console.log("Sending status:", taskId, status);
    try {
      const response = await fetch(`api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task status");
      }

      if (selectedProject) {
        await fetchTasks(selectedProject.id);
        await fetchProjectTaskCounts(projects);
      }
    } catch (error) {
      setTasksError(error.message || "Failed to update task status");
    }
  };

  const fetchProjectTaskCounts = async(projectList) => {
    const counts = {};

    await Promise.all(
      projectList.map(async(project) => {
        try{
          const response = await fetch(`/api/tasks?projectId=${project.id}`,
            {
            method:"GET",
            credentials: "include",
            }
          );

          const data = await response.json();

          if(!response.ok) {
            throw new Error("Failed to fetch project tasks");
          }
          const projectTask = (data.tasks || []).filter(
            (task) => task.projectId === project.id
          );

          counts[project.id] = {
            total: projectTask.length,
            completed: projectTask.filter(
              (task) => task.status === "COMPLETED"
            ).length,
          };
        } catch(error){
          console.error(
            `Failed to fetch tasks for project ${project.id}:`,
            error
          );

          counts[project.id] = {
            total: 0,
            completed: 0,
          };
        }
      })
    );
    setProjectTaskCounts(counts);
  };

  function openCreateModal() {
    setEditingProject(null);
    setName("");
    setDescription("");
    setSelectedEmployee("");
    setFormError("");
    setIsModalOpen(true);
  }

  function openUpdateModal(project) {
    setEditingProject(project);
    setName(project.name);
    setDescription(project.description || "");
    setSelectedEmployee(project.userId || "");
    setFormError("");
    setIsModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setIsModalOpen(false);
    setEditingProject(null);
    setFormError("");
  }

  // Open the task modal for the selected project
  function openTaskModal(project) {
    setSelectedProject(project);
    fetchTasks(project.id);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Project name is required.");
      return;
    }

    try {
      setSaving(true);

      const isEditing = Boolean(editingProject);

      const response = await fetch(
        isEditing ? `/api/projects/${editingProject.id}` : "/api/projects",
        {
          method: isEditing ? "PUT" : "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim(),
            userId: selectedEmployee,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Failed to ${isEditing ? "update" : "create"} project`,
        );
      }

      setIsModalOpen(false);
      setEditingProject(null);
      setName("");
      setDescription("");
      setSelectedEmployee("");

      await fetchProjects();
    } catch (err) {
      setFormError(err.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?`,
    );

    if (!confirmed) return;

    try {
      setDeletingId(project.id);
      setError("");

      const response = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete project");
      }

      await fetchProjects();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout failed. Please try again later!");
      }

      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-[#111214] px-4 py-8 text-white sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* Page header */}
        <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-violet-400">
              Workspace
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">Your Projects</h1>

            <p className="mt-2 text-gray-400">
              Manage your projects and keep your work organized.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#1b1c20] px-4 py-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>

              <p className="font-medium text-white">{user?.name || "User"}</p>
            </div>

            {isManager && (
              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
              >
                <span className="text-xl">+</span>
                New Project
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-white/10 px-5 py-3 font-semibold text-gray-300 transition hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Project count */}
        <section className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[#303136] bg-[#1C1D21] p-5">
            <p className="text-sm text-gray-400">Total Projects</p>
            <p className="mt-2 text-3xl font-bold">{projects.length}</p>
            <p className="mt-1 text-sm text-gray-500">
              Projects in your workspace
            </p>
          </div>
        </section>

        {/* Project list */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold">All Projects</h2>
          </div>

          {loading ? (
            <p className="py-12 text-center text-gray-400">
              Loading your projects...
            </p>
          ) : error ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 text-red-300">
              {error}
              <button
                type="button"
                onClick={fetchProjects}
                className="ml-3 underline"
              >
                Try again
              </button>
            </div>
          ) : projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#3A3B42] bg-[#1C1D21] px-6 py-16 text-center">
              <h3 className="text-lg font-semibold">No projects yet</h3>
              <p className="mt-2 text-gray-400">
                Create your first project to get started.
              </p>

              {isManager && (
                <button
                  type="button"
                  onClick={openCreateModal}
                  className="mt-5 rounded-lg bg-violet-600 px-4 py-2 font-semibold hover:bg-violet-500"
                >
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="flex flex-col rounded-2xl border border-[#303136] bg-[#1C1D21] p-5 transition hover:-translate-y-1 hover:border-violet-500/50"
                >
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 text-2xl">
                      📁
                    </div>

                    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                      Project
                    </span>
                  </div>

                  <h3 className="wrap-break-words text-xl font-bold">
                    {project.name}
                  </h3>

                  <p className="mt-2 min-h-12 wrap-break-words text-sm leading-6 text-gray-400">
                    {project.description || "No description added yet."}
                  </p>

                  <TaskProgress
                    totalTasks={projectTaskCounts[project.id] ?.total ?? 0}
                    completedTasks={projectTaskCounts[project.id] ?.completed ?? 0} />

                  {/* Open task modal */}
                  <button
                    type="button"
                    onClick={() => openTaskModal(project)}
                    className="mt-4 w-full rounded-lg border border-violet-500/40 px-3 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
                  >
                    View Tasks
                  </button>

                  {isManager && (
                    <div className="mt-6 flex gap-3 border-t border-[#303136] pt-4">
                      <button
                        type="button"
                        onClick={() => openUpdateModal(project)}
                        className="flex-1 rounded-lg border border-violet-500/40 px-3 py-2 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/10"
                      >
                        Update
                      </button>

                      <button
                        type="button"
                        disabled={deletingId === project.id}
                        onClick={() => handleDelete(project)}
                        className="flex-1 rounded-lg border border-red-500/30 px-3 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === project.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Create / Update Project modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            className="w-full max-w-lg rounded-2xl border border-[#383941] bg-[#1C1D21] p-6 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 id="project-modal-title" className="text-2xl font-bold">
                  {editingProject ? "Update Project" : "Create Project"}
                </h2>

                <p className="mt-1 text-sm text-gray-400">
                  {editingProject
                    ? "Make changes to your project."
                    : "Add a new project to your workspace."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close modal"
                className="rounded-lg px-3 py-1 text-2xl text-gray-400 hover:bg-[#303136] hover:text-white"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Project Name
                </label>

                <input
                  id="project-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter project name"
                  maxLength={120}
                  required
                  className="w-full rounded-xl border border-[#383941] bg-[#111214] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
                />
              </div>

              {/* Assign project to an employee */}
              {isManager && (
                <div>
                  <label
                    htmlFor="project-employee"
                    className="mb-2 block text-sm text-gray-300"
                  >
                    Assign to Employee
                  </label>

                  <select
                    id="project-employee"
                    value={selectedEmployee}
                    onChange={(event) =>
                      setSelectedEmployee(event.target.value)
                    }
                    required
                    className="w-full rounded-lg border border-gray-700 bg-[#111214] p-3 text-white"
                  >
                    <option value="">Select an employee</option>

                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name} ({employee.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label
                  htmlFor="project-description"
                  className="mb-2 block text-sm font-medium text-gray-200"
                >
                  Description
                </label>

                <textarea
                  id="project-description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe your project (optional)"
                  rows={4}
                  className="w-full resize-y rounded-xl border border-[#383941] bg-[#111214] px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-violet-500"
                />
              </div>

              {formError && (
                <p role="alert" className="text-sm text-red-400">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-3 border-t border-[#303136] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[#383941] px-4 py-2.5 font-medium text-gray-300 hover:bg-[#303136] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-violet-600 px-5 py-2.5 font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingProject
                      ? "Save Changes"
                      : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task modal for the selected project */}
      {selectedProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedProject(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#303136] bg-[#1C1D21] p-6 shadow-2xl"
          >
            {/* Task modal header */}
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-violet-300">Project Tasks</p>

                <h2 id="task-modal-title" className="mt-1 text-2xl font-bold">
                  {selectedProject.name}
                </h2>

                <p className="mt-2 text-sm text-gray-400">
                  Manage tasks for this project.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close task modal"
                className="rounded-lg px-3 py-2 text-gray-400 hover:bg-[#303136] hover:text-white"
              >
                ×
              </button>
            </div>

            {/* Task actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#303136] pb-5">
              <p className="text-sm text-gray-400">Tasks for this project</p>

              {isManager && (
                <button
                  type="button"
                  onClick={() => setIsTaskFormOpen(true)}
                  className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500"
                >
                  + Create New Task
                </button>
              )}
            </div>

            {isManager && isTaskFormOpen && (
              <CreateTask
                onClose={() => setIsTaskFormOpen(false)}
                onSubmit={handleCreateTask}
                saving={taskSaving}
              />
            )}

            {/* Task list will be connected to the API next */}
            <div className="min-h-0 flex-1 overflow-y-auto py-6">
              {tasksLoading ? (
                <p className="text-center text-gray-400">Loading tasks...</p>
              ) : tasksError ? (
                <p className="text-center text-red-400"> {tasksError} </p>
              ) : tasks.length === 0 ? (
                <p className="py-8 text-center text-gray-400">
                  No tasks found for this project!
                </p>
              ) : (
                <ViewTask // this is for viewing the tasks in the task section, and is being imported from the taskPage
                  tasks={tasks}
                  tasksLoading={tasksLoading}
                  tasksError={tasksError}
                  isManager={isManager}
                  onStatusChange={handleStatusChange}
                ></ViewTask>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
