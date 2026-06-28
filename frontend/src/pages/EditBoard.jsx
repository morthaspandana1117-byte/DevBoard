import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import client from "../api/client";

function EditBoard() {
  const { boardId } = useParams();
  const [title, setTitle] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        const response = await client.get(`/boards/${boardId}`);

        setTitle(response.data.title);
      } catch (error) {
        alert(error.response?.data?.message || "Fetching board details Failed");
      }
    };

    fetchBoardDetails();
  }, [boardId]);

  const updateBoard = async (e) => {
    e.preventDefault();

    try {
      const response = await client.put(`/boards/${boardId}`, {
        title,
      });

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Update Failed");
    }
  };

  return (
    <div>
      <h1>🖋️Edit Board</h1>

      <form onSubmit={updateBoard}>
        <input
          type="text"
          placeholder="Board Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">Update Board</button>
      </form>

      <hr />
      <button onClick={() => navigate("/dashboard")}>⬅️ Dashboard</button>
    </div>
  );
}

export default EditBoard;
