import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import client from "../api/client";

function EditTask() {
  const { taskId, boardId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await client.get(`/tasks/${taskId}`);

        setTitle(response.data.title);
        setDescription(response.data.description);
        setStatus(response.data.status);
      } catch (error) {
        alert(error.response?.data?.message || "Fetching task details Failed");
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const updateTask = async (e) => {
    e.preventDefault();

    try {
      const response = await client.put(`/tasks/${taskId}`, {
        title,
        description,
        status,
      });

      navigate(`/boards/${boardId}`);
    } catch (error) {
      alert(error.response?.data?.message || "Update Failed");
    }
  };

  return (
    <div className="center-page">
      <div className="edit-card">
        <div className="section-heading centered">
          <h1>Edit Task</h1>
          <p>Refine the title and description for this task.</p>
        </div>

        <form className="form-stack" onSubmit={updateTask}>
          <div className="field-group">
            <label htmlFor="edit-task-title">Title</label>
            <input
              id="edit-task-title"
              className="input-control"
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="edit-task-description">Description</label>
            <textarea
              id="edit-task-description"
              className="input-control textarea-control"
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="edit-task-status">
              Status
            </label>

            <select
              id="edit-task-status"
              className="input-control"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <button className="btn btn-primary btn-full" type="submit">
            Update Task
          </button>
        </form>

        <button
          className="btn btn-outline btn-full"
          onClick={() => navigate(`/boards/${boardId}`)}
        >
          Back to Board
        </button>
      </div>

      <footer className="app-footer">
        Built with love using React, Express and MongoDB.
      </footer>
    </div>
  );
}

export default EditTask;
