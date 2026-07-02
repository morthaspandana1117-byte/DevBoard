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
        await client.put(`/boards/${boardId}`, {

        title,
      });

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Update Failed");
    }
  };

  return (
    <div className="center-page">
      <div className="edit-card">
        <div className="section-heading centered">
          <h1>Edit Board</h1>
          <p>Update the board title and return to your dashboard.</p>
        </div>

        <form className="form-stack" onSubmit={updateBoard}>
          <div className="field-group">
            <label htmlFor="board-title">Board Title</label>
            <input
              id="board-title"
              className="input-control"
              type="text"
              placeholder="Board Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit">
            Update Board
          </button>
        </form>

        <button className="btn btn-outline btn-full" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      <footer className="app-footer">
        Built with love using React, Express and MongoDB.
      </footer>
    </div>
  );
}

export default EditBoard;
