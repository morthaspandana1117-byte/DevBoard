import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import client from "../api/client";

function EditTask() {
  const { taskId, boardId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const response = await client.get(`/tasks/${taskId}`);

        setTitle(response.data.title);
        setDescription(response.data.description);
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
      });

      navigate(`/boards/${boardId}`);
    } catch (error) {
      alert(error.response?.data?.message || "Update Failed");
    }
  };

  return (
    <div>
      <h1>🖋️Edit Task</h1>

      <form onSubmit={updateTask}>
        <input
          type="text"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="Task Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button type="submit">Update Task</button>
      </form>

      <hr />

      <button onClick={() => navigate(`/boards/${boardId}`)}>
        ⬅️ Board Details
      </button>
    </div>
  );
}

export default EditTask;
