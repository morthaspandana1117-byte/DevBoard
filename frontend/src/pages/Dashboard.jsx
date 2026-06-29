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
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <h1>DevBoard</h1>
            <p>Welcome back. Keep your work moving.</p>
          </div>
        </div>
        <button className="btn btn-logout" onClick={() => navigate("/")}>
          Logout
        </button>
      </header>

      <main className="page-content">
        <section className="panel">
          <div className="section-heading">
            <h2>Create Board</h2>
            <p>Start a new workspace for tasks, ideas, or sprint planning.</p>
          </div>

          <form className="create-form" onSubmit={createBoard}>
            <input
              className="input-control"
              type="text"
              placeholder="Enter board title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <button className="btn btn-primary" type="Submit">
              Create Board
            </button>
          </form>
        </section>

        <section>
          <div className="section-heading">
            <h2>Boards</h2>
            <p>Open a board to manage its tasks.</p>
          </div>

          {boards.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">Folder</div>
              <h3>No boards yet</h3>
              <p>Create your first board.</p>
            </div>
          ) : (
            <div className="board-grid">
              {boards.map((board) => (
                <div className="board-card" key={board._id}>
                  <button
                    className="card-title-button"
                    onClick={() => navigate(`/boards/${board._id}`)}
                  >
                    {board.title}
                  </button>
                  <div className="card-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() => navigate(`/boards/edit/${board._id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => deleteBoard(board._id)}
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

export default Dashboard;
