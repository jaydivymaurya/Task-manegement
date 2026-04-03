const { useEffect, useMemo, useState } = React;
const e = React.createElement;

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [statusMessage, setStatusMessage] = useState("Ready to plan your next task.");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const summary = useMemo(() => {
    const completed = tasks.filter((task) => task.completed).length;
    return {
      total: tasks.length,
      completed,
      open: tasks.length - completed
    };
  }, [tasks]);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/tasks");
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not load tasks.");
      }

      setTasks(payload.tasks || []);
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function addTask(event) {
    event.preventDefault();

    if (!title.trim()) {
      setStatusMessage("Please enter a task title.");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: title.trim(),
          details: details.trim()
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not create the task.");
      }

      setTasks((currentTasks) => [payload.task, ...currentTasks]);
      setTitle("");
      setDetails("");
      setStatusMessage("Task added successfully.");
    } catch (error) {
      setStatusMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleTask(task) {
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          completed: !task.completed
        })
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not update the task.");
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) => (item._id === task._id ? payload.task : item))
      );
      setStatusMessage(task.completed ? "Task moved back to open." : "Task marked complete.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  async function deleteTask(taskId) {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE"
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Could not delete the task.");
      }

      setTasks((currentTasks) => currentTasks.filter((task) => task._id !== taskId));
      setStatusMessage("Task deleted.");
    } catch (error) {
      setStatusMessage(error.message);
    }
  }

  return e(
    "main",
    { className: "page-shell" },
    e(
      "section",
      { className: "hero-panel" },
      e("p", { className: "eyebrow" }, "Simple MERN website"),
      e("h1", null, "Organize your day with a clean task board."),
      e(
        "p",
        { className: "hero-copy" },
        "This starter project uses React on the frontend and Express, Node.js, and MongoDB on the backend."
      ),
      e(
        "div",
        { className: "stats-grid" },
        statCard("Total Tasks", summary.total),
        statCard("Open", summary.open),
        statCard("Completed", summary.completed)
      )
    ),
    e(
      "section",
      { className: "content-grid" },
      e(
        "article",
        { className: "panel form-panel" },
        e("h2", null, "Add a task"),
        e(
          "form",
          { className: "task-form", onSubmit: addTask },
          e(
            "label",
            { className: "field" },
            e("span", null, "Task title"),
            e("input", {
              type: "text",
              value: title,
              placeholder: "Finish landing page copy",
              onChange: (event) => setTitle(event.target.value),
              maxLength: 120
            })
          ),
          e(
            "label",
            { className: "field" },
            e("span", null, "Details"),
            e("textarea", {
              value: details,
              placeholder: "Optional notes for this task",
              onChange: (event) => setDetails(event.target.value),
              maxLength: 280,
              rows: 5
            })
          ),
          e(
            "button",
            { type: "submit", disabled: isSaving },
            isSaving ? "Saving..." : "Create task"
          ),
          e("p", { className: "status-message" }, statusMessage)
        )
      ),
      e(
        "article",
        { className: "panel list-panel" },
        e("h2", null, "Your tasks"),
        isLoading
          ? e("p", { className: "empty-state" }, "Loading tasks...")
          : tasks.length === 0
            ? e("p", { className: "empty-state" }, "No tasks yet. Add your first one on the left.")
            : e(
                "div",
                { className: "task-list" },
                tasks.map((task) =>
                  e(
                    "article",
                    {
                      className: `task-card${task.completed ? " is-complete" : ""}`,
                      key: task._id
                    },
                    e(
                      "div",
                      { className: "task-copy" },
                      e("h3", null, task.title),
                      e("p", null, task.details || "No extra details added yet.")
                    ),
                    e(
                      "div",
                      { className: "task-actions" },
                      e(
                        "button",
                        {
                          type: "button",
                          className: "secondary-button",
                          onClick: () => toggleTask(task)
                        },
                        task.completed ? "Mark open" : "Complete"
                      ),
                      e(
                        "button",
                        {
                          type: "button",
                          className: "ghost-button",
                          onClick: () => deleteTask(task._id)
                        },
                        "Delete"
                      )
                    )
                  )
                )
              )
      )
    )
  );
}

function statCard(label, value) {
  return e(
    "div",
    { className: "stat-card", key: label },
    e("span", { className: "stat-label" }, label),
    e("strong", { className: "stat-value" }, String(value))
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(e(App));
