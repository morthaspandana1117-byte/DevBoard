import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import client from "../api/client";

function BoardDetails() {
  const { boardId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await client.get(`/tasks/board/${boardId}`);

        setTasks(response.data);
      } catch (error) {
        alert(error.response?.data?.message || "Fetching tasks Failed");
      }
    };

    fetchTasks();
  }, [boardId]);

  const createTask = async (e) => {
    e.preventDefault();

    try {
      const response = await client.post("/tasks", {
        title,
        description,
        board: boardId,
      });

      setTasks([...tasks, response.data]);
      setTitle("");
      setDescription("");
    } catch (error) {
      alert(error.response?.data?.message || "Creating Task Failed");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this task?",
      );
      if (!confirmDelete) {
        return;
      }
      await client.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((task) => task._id !== taskId));
    } catch (error) {
      alert(error.response?.data?.message || "DeleteFailed");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <h1>Board Details</h1>
            <p>Create, review, and refine your tasks.</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="page-content">
        <section className="panel">
          <div className="section-heading">
            <h2>Create Task</h2>
            <p>Add a task with a clear title and description.</p>
          </div>

          <form className="form-stack" onSubmit={createTask}>
            <div className="field-group">
              <label htmlFor="task-title">Task Title</label>
              <input
                id="task-title"
                className="input-control"
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label htmlFor="task-description">Description</label>
              <textarea
                id="task-description"
                className="input-control textarea-control"
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <button className="btn btn-primary form-action" type="submit">
              Create Task
            </button>
          </form>
        </section>

        <section>
          <div className="section-heading">
            <h2>Tasks</h2>
            <p>Track the work connected to this board.</p>
          </div>

          {tasks.length === 0 ? (
            <div className="empty-state">
              <h3>No tasks available.</h3>
              <p>Create your first task.</p>
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <div className="task-card" key={task._id}>
                  <div className="task-card-header">
                    <h3>{task.title}</h3>
                    {task.status && (
                      <span className="status-badge">{task.status}</span>
                    )}
                  </div>
                  <p>{task.description}</p>
                  <div className="card-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() =>
                        navigate(`/boards/${boardId}/tasks/edit/${task._id}`)
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        Built with love using React, Express and MongoDB.
      </footer>
    </div>
  );
}

export default BoardDetails;
