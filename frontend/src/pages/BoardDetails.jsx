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
    <div>
      <h1>Board Details</h1>

      <form onSubmit={createTask}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />
        <br />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">Create Task</button>
      </form>

      <hr />
      <h3>Tasks</h3>

      {tasks.map((task) => (
        <div key={task._id}>
          <p>{task.title}</p>
          <p>{task.description}</p>
          <h3
            onClick={() =>
              navigate(`/boards/${boardId}/tasks/edit/${task._id}`)
            }
            style={{ cursor: "pointer" }}
          >
            🖋️Edit
          </h3>
          <h3
            onClick={() => deleteTask(task._id)}
            style={{ cursor: "pointer" }}
          >
            🗑️Delete
          </h3>
        </div>
      ))}
      <button onClick={() => navigate("/dashboard")}>⬅️ Dashboard</button>
    </div>
  );
}

export default BoardDetails;
