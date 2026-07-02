import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import client from "../api/client";

function Dashboard() {
  const [boards, setBoards] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const getUserId = (value) => value?._id || value;
  const isOwner = (board) => getUserId(board.owner) === currentUser?._id;
  const ownedBoards = boards.filter((board) => isOwner(board));
  const sharedBoards = boards.filter((board) => !isOwner(board));

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [boardsResponse, userResponse] = await Promise.all([
          client.get("/boards"),
          client.get("/auth/me"),
        ]);

        setBoards(boardsResponse.data);
        setCurrentUser(userResponse.data);
      } catch (error) {
        alert(error.response?.data?.message || "Fetching boards Failed");
      }
    };

    fetchDashboard();
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

  const renderBoards = (projectBoards) => {
    if (projectBoards.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">Folder</div>
          <h3>No projects here</h3>
          <p>Create a board or wait for an invite.</p>
        </div>
      );
    }

    return (
      <div className="board-grid">
        {projectBoards.map((board) => {
          const owner = board.owner?.name || "Unknown owner";
          const memberCount = board.members?.length || 0;
          const ownerRole = isOwner(board);

          return (
            <div className="board-card" key={board._id}>
              <button
                className="card-title-button"
                onClick={() => navigate(`/boards/${board._id}`)}
              >
                {board.title}
              </button>

              <div className="meta-list">
                <span>Owner: {owner}</span>
                <span>Members: {memberCount}</span>
 o               <span>Role: {ownerRole ? "Owner" : "Member"}</span>
              </div>

              <div className="card-actions">
                {ownerRole && (
                  <>
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
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
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
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button className="btn btn-outline" onClick={() => navigate("/analytics")}>
            Analytics
          </button>

          <button className="btn btn-outline" onClick={() => navigate("/profile")}>
            Profile
          </button>

          <button
            className="btn btn-logout"
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>

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
            <h2>Owned Projects</h2>
            <p>Projects where you manage board settings and members.</p>
          </div>

          {renderBoards(ownedBoards)}
        </section>

        <section>
          <div className="section-heading">
            <h2>Shared Projects</h2>
            <p>Projects where you can view, create, and update tasks.</p>
          </div>

          {renderBoards(sharedBoards)}
        </section>
      </main>

      <footer className="app-footer">
        Built with love using React, Express and MongoDB.
      </footer>
    </div>
  );
}

export default Dashboard;
