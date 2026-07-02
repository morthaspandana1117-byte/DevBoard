import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import client from "../api/client";

function EditTask() {
  const { taskId, boardId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("todo");
  const [assignedTo, setAssignedTo] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [board, setBoard] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const navigate = useNavigate();
  const isOwner = board?.owner?._id === currentUser?._id;
  const boardMembers = [board?.owner, ...(board?.members || [])].filter(Boolean);
  const selectedAssignment = boardMembers.find((member) => member._id === assignedTo);

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const [taskResponse, boardResponse, userResponse] = await Promise.all([
          client.get(`/tasks/${taskId}`),
          client.get(`/boards/${boardId}`),
          client.get("/auth/me"),
        ]);

        setTitle(taskResponse.data.title);
        setDescription(taskResponse.data.description);
        setStatus(taskResponse.data.status);
        setAssignedTo(taskResponse.data.assignedTo?._id || taskResponse.data.assignedTo || "");
        setDueDate(
  taskResponse.data.dueDate ? new Date(taskResponse.data.dueDate).toISOString().slice(0, 16): "");
        setAttachments(taskResponse.data.attachments || []);
        setBoard(boardResponse.data);
        setCurrentUser(userResponse.data);
      } catch (error) {
        alert(error.response?.data?.message || "Fetching task details Failed");
      }
    };

    fetchTaskDetails();
  }, [boardId, taskId]);

  const updateTask = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        title,
        description,
        status,
        dueDate: dueDate || null,
      };

      if (isOwner) {
        payload.assignedTo = assignedTo || null;
      }

      await client.put(`/tasks/${taskId}`, payload);

      navigate(`/boards/${boardId}`);
    } catch (error) {
      alert(error.response?.data?.message || "Update Failed");
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      alert("Please select at least one file");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("attachment", file);
      });

      await client.post(`/tasks/${taskId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const taskResponse = await client.get(`/tasks/${taskId}`);
      setAttachments(taskResponse.data.attachments || []);
      setSelectedFiles([]);
      document.getElementById("attachment-input")?.value && (document.getElementById("attachment-input").value = "");
    } catch (error) {
      alert(error.response?.data?.message || "Uploading files failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    const confirmDelete = window.confirm("Delete this attachment?");
    if (!confirmDelete) {
      return;
    }

    try {
      await client.delete(`/tasks/${taskId}/attachment/${attachmentId}`);
      const taskResponse = await client.get(`/tasks/${taskId}`);
      setAttachments(taskResponse.data.attachments || []);
    } catch (error) {
      alert(error.response?.data?.message || "Deleting attachment failed");
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
            <label htmlFor="edit-task-status">Status</label>

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

          <div className="field-group">
            <label htmlFor="edit-task-due-date">Due Date</label>
            <input
              id="edit-task-due-date"
              className="input-control"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="edit-task-assigned-to">Assigned To</label>

            {isOwner ? (
              <select
                id="edit-task-assigned-to"
                className="input-control"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {boardMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="input-control">
                {selectedAssignment ? selectedAssignment.name : "Unassigned"}
              </div>
            )}
          </div>

          <div className="field-group">
            <label htmlFor="attachment-input">Attachments</label>
            <input
              id="attachment-input"
              className="input-control"
              type="file"
              multiple
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />

            <div className="card-actions">
              <button
                className="btn btn-primary"
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </div>

          {attachments.length > 0 && (
            <div className="field-group">
              <label>Uploaded Files</label>
              <div className="task-attachments-list">
                {attachments.map((attachment) => (
                  <div className="attachment-item" key={attachment._id}>
                    <div className="attachment-meta">
                      <span>{attachment.originalName}</span>
                      <div className="attachment-details">
                        {Math.round((attachment.fileSize || 0) / 1024)} KB • {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="card-actions">
                      <a
                        className="btn btn-outline"
                        href={`http://localhost:5000${attachment.filePath}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                      <button
                        className="btn btn-danger"
                        type="button"
                        onClick={() => handleDeleteAttachment(attachment._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
