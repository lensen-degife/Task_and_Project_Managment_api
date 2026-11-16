import { useState } from 'react'

function TaskCard() {
  const [status, setStatus] = useState("TODO")

  return (
    <div className="w-full rounded-2xl bg-white p-5 sm:p-6 shadow-sm border border-gray-100 min-w-0">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
        Design Login Page
      </h3>

      <p className="mt-2 text-xs sm:text-sm text-gray-500">
        Status: <span className="font-medium text-gray-700">{status}</span>
      </p>

      <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
        <button
          type="button"
          onClick={() => setStatus("IN_PROGRESS")}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs sm:text-sm font-medium text-white transition hover:bg-blue-700 active:scale-[0.98]"
        >
          Start Task
        </button>

        <button
          type="button"
          onClick={() => setStatus("COMPLETED")}
          className="rounded-lg border border-gray-200 px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 transition hover:bg-gray-50 active:scale-[0.98]"
        >
          Complete Task
        </button>
      </div>
    </div>
  )
}

export default TaskCard
