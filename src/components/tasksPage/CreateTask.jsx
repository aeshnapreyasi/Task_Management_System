import React from "react";

function CreateTask({ onClose, onSubmit, saving }) {
  const handleSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const taskData = {
      title: formData.get("title").trim(),
      description: formData.get("description").trim(),
      priority: formData.get("priority"),
      dueDate: formData.get("dueDate") || null,
    };

    onSubmit(taskData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-5 max-h-[55vh] space-y-4 overflow-y-auto rounded-xl border border-[#303136] bg-[#111214] p-5"
    >
      <h3 className="text-lg font-semibold text-white">Create New Task</h3>

      <div>
        <lable className="mb-2 block text-sm text-gray-300">Task title</lable>
        <input
          type="text"
          name="title"
          placeholder="Enter task title"
          maxLength={200}
          required
          className="w-full rounded-lg border border-[#303136] bg-[#1C1D21] px-3 py-2 text-white outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <lable className="mb-2 block text-sm text-gray-300">Description</lable>

        <textarea
          name="description"
          placeholder="Enter task description"
          rows={3}
          className="w-full rounded-lg border border-[#303136] bg-[#1C1D21] px-3 py-2 text-white outline-none focus:border-violet-500"
        />
      </div>

      <div>
        <lable className="mb-2 block text-sm text-gray-300">Priority</lable>
        <select
          name="priority"
          defaultValue= "MEDIUM"
          className="w-full rounded-lg border border-[#303136] bg-[#1C1D21] px-3 py-2 text-white outline-none focus:border-violet-500"
        >
          <option value="LOW"> Low </option>
          <option value="MEDIUM"> Medium </option>
          <option value="HIGH"> High </option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm text-gray-300">Due Date</label>
        <input
          type="date"
          name="dueDate"
          className="w-full rounded-lg border border-[#303136] bg-[#1C1D21] px-3 py-2 text-white outline-none focus:border-violet-500"
        />
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-lg border border-[#303136] px-4 text-sm text-gray-300 hover:bg-[#303136] disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}

export default CreateTask;
