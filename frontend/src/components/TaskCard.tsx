import { useState } from 'react'

function TaskCard() {
  const [status, setStatus] = useState("TODO")

  return (
    <div>
      <h2>Design Login Page</h2>

      <p>Status: {status}</p>

      <button onClick={() => setStatus("IN_PROGRESS")}>
        Start Task
      </button>

      <button onClick={() => setStatus("COMPLETED")}>
        Complete Task
      </button>
    </div>
  )
}

export default TaskCard