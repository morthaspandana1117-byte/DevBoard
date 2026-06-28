import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import client from "../api/client";

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await client.get("/boards");

        setBoards(response.data);
      } catch (error) {
        calert(error.response?.data?.message || "Fetching boards Failed");
      }
    };

    fetchBoards();
  }, []);

  const createBoard = async (e) => {
    e.preventDefault();

    try {
      const response = await client.post("/boards", {
        title,
      });

      setBoards([...boards, response.data]);
      setTitle("");
    } catch (error) {
      alert(error.response?.data?.message || "Creating baord Failed");
    }
  };

  const deleteBoard = async (boardId) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this board?",
      );
      if (!confirmDelete) {
        return;
      }
      await client.delete(`/boards/${boardId}`);
      setBoards(boards.filter((board) => board._id !== boardId));
    } catch (error) {
      alert(error.response?.data?.message || "DeleteFailed");
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>

      <form onSubmit={createBoard}>
        <input
          type="text"
          placeholder="Enter title name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button type="Submit">Create Board</button>
      </form>

      {boards.map((board) => (
        <div key={board._id}>
          <h3
            onClick={() => navigate(`/boards/${board._id}`)}
            style={{ cursor: "pointer" }}
          >
            {board.title}
          </h3>
          <h3
            onClick={() => navigate(`/boards/edit/${board._id}`)}
            style={{ cursor: "pointer" }}
          >
            🖋️Edit
          </h3>
          <h3
            onClick={() => deleteBoard(board._id)}
            style={{ cursor: "pointer" }}
          >
            🗑️Delete
          </h3>
        </div>
      ))}
      <button onClick={() => navigate("/")}>⬅️ Logout</button>
    </div>
  );
}

export default Dashboard;
