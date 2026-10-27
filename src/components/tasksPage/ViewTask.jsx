import React from "react";

function ViewTask({
  tasks,
  tasksLoading,
  tasksError,
  isManager,
  onStatusChange,
}) {
  //isManager - will check wheather the logged in user is manger or employee, and onStatusChange send the selected status to parent component
  if (tasksLoading) {
    return <p className="py-6 text-center text-gray-400">Loading tasks...</p>;
  }

  if (tasksError) {
    return <p className="py-6 text-center text-red-400">{tasksError}</p>;
  }

  if (!tasks || tasks.length === 0) {
    return (
      <p className="py-8 text-center text-gray-400">No Tasks Found Here!!</p>
    );

  }

  return (
    <div className="h-full flex-1 overflow-y-auto py-6">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="rounded-xl border border-[#303136] bg-[#111214] p-4"
        >
          <h3 className="font-semibold text-white">{task.title}</h3>
          {task.description && (
            <p className="mt-1 text-sm text-gray-400">{task.description}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {/* <span className="text-violet-300">Status: {task.status}</span> */}
            {isManager ? (
              <span className="text-violet-300">Status:{task.status}</span>
            ) : (
              <lable className="flex items-center gap-2 text-sm text-violet-300">
                Status:
                <select
                  value={task.status}
                  onChange={(e) => onStatusChange(task.id, e.target.value)}
                  className="rounded-lg border border-[#303136] bg-[#1C1D21] px-3 py-2 text-white"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </lable>
            )}

            <span className="text-gray-400">Priority: {task.priority}</span>

            {task.dueDate && (
              <span className="text-gray-400">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ViewTask;
