import React from "react";

function TaskProgress({ totalTasks, completedTasks }) {
  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="mt-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="text-gray-400"> Task Progress </span>
        <span className="font-medium text-violet-300">{progress}%</span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[#303136]"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-violet-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {completedTasks} of {totalTasks} tasks completed
      </p>
    </div>
  );
}

export default TaskProgress;
