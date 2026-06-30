import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const getFileIcon = (fileName = "") => {
  const extension = fileName.split(".").pop()?.toLowerCase();

  if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
    return "🖼";
  }

  if (extension === "pdf") {
    return "📄";
  }

  if (["doc", "docx", "txt"].includes(extension)) {
    return "📝";
  }

  if (extension === "zip") {
    return "📦";
  }

  return "📁";
};

import client from "../api/client";

function BoardDetails() {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteError, setInviteError] = useState("");

  const navigate = useNavigate();
  const isOwner = board?.owner?._id === currentUser?._id;
  const currentRole = !board || !currentUser ? "Loading" : isOwner ? "Owner" : "Member";

  useEffect(() => {
    const fetchBoardDetails = async () => {
      try {
        const [boardResponse, tasksResponse, userResponse] = await Promise.all([
          client.get(`/boards/${boardId}`),
          client.get(`/tasks/board/${boardId}`),
          client.get("/auth/me"),
        ]);

        setBoard(boardResponse.data);
        setTasks(tasksResponse.data);
        setCurrentUser(userResponse.data);
      } catch (error) {
        alert(error.response?.data?.message || "Fetching board details Failed");
      }
    };

    fetchBoardDetails();
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

  const openInviteModal = () => {
    setInviteMessage("");
    setInviteError("");
    setMemberEmail("");
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    setMemberEmail("");
    setInviteError("");
  };

  const inviteMember = async (e) => {
    e.preventDefault();

    try {
      const response = await client.post(`/boards/${boardId}/invite`, {
        email: memberEmail,
      });

      setBoard(response.data);
      setMemberEmail("");
      setInviteError("");
      setInviteMessage("Member invited successfully");
      setIsInviteModalOpen(false);
    } catch (error) {
      setInviteMessage("");
      setInviteError(error.response?.data?.message || "Inviting member failed");
    }
  };

  const removeMember = async (memberId) => {
    try {
      const confirmRemove = window.confirm(
        "Remove this member from the project?",
      );

      if (!confirmRemove) {
        return;
      }

      const response = await client.delete(
        `/boards/${boardId}/members/${memberId}`,
      );

      setBoard(response.data);
      setInviteError("");
      setInviteMessage("Member removed successfully");
    } catch (error) {
      setInviteMessage("");
      setInviteError(error.response?.data?.message || "Removing member failed");
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <h1>Board Details</h1>
            <p>{board?.title || "Create, review, and refine your tasks."}</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="page-content">
        <section className="panel">
          <div className="section-heading section-heading-row">
            <div>
              <h2>Members</h2>
              <p>Owner, members, and your current role on this board.</p>
            </div>

            {isOwner && (
              <button className="btn btn-primary" onClick={openInviteModal}>
                Invite Member
              </button>
            )}
          </div>

          {inviteMessage && <div className="alert alert-success">{inviteMessage}</div>}
          {inviteError && <div className="alert alert-error">{inviteError}</div>}

          <div className="project-meta">
            <div>
              <span className="meta-label">Owner</span>
              <strong>{board?.owner?.name || "Unknown owner"}</strong>
              <span>{board?.owner?.email}</span>
            </div>

            <div>
              <span className="meta-label">Your Role</span>
              <strong>{currentRole}</strong>
            </div>

            <div>
              <span className="meta-label">Members</span>
              <strong>{board?.members?.length || 0}</strong>
            </div>
          </div>

          <div className="member-list">
            {board?.owner && (
              <div className="member-row">
                <div>
                  <strong>{board.owner.name}</strong>
                  <span>{board.owner.email}</span>
                  <span>Role: Owner</span>
                </div>
              </div>
            )}

            {board?.members?.length > 0 &&
              board.members.map((member) => (
                <div className="member-row" key={member._id}>
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.email}</span>
                    <span>Role: Member</span>
                  </div>

                  {isOwner && (
                    <button
                      className="btn btn-danger"
                      onClick={() => removeMember(member._id)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            }
          </div>
        </section>

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
                      <span className={`status-badge ${task.status}`}>
                        {task.status === "todo"
                          ? "To Do"
                          : task.status === "in-progress"
                          ? "In Progress"
                          : "Done"}
                      </span>
                    )}
                  </div>
                  <p>{task.description}</p>
                  <div className="field-group">
                    <label>Assigned To</label>
                    <div className="input-control">
                      👤 {task.assignedTo?.name || "Unassigned"}
                    </div>
                  </div>
                  <div className="field-group">
                    <label>Attachments</label>
                    {task.attachments?.length ? (
                      <div className="task-attachments-list">
                        {task.attachments.map((attachment) => (
                          <div className="attachment-item" key={attachment._id}>
                            <div className="attachment-meta">
                              <span>{getFileIcon(attachment.originalName)}</span>
                              <div>
                                <strong>{attachment.originalName}</strong>
                                <div className="attachment-details">
                                  {Math.round((attachment.fileSize || 0) / 1024)} KB • {new Date(attachment.uploadedAt).toLocaleDateString()}
                                </div>
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
                                onClick={async () => {
                                  const confirmDelete = window.confirm("Delete this attachment?");
                                  if (!confirmDelete) {
                                    return;
                                  }

                                  try {
                                    await client.delete(`/tasks/${task._id}/attachment/${attachment._id}`);
                                    const refreshed = await client.get(`/tasks/board/${boardId}`);
                                    setTasks(refreshed.data);
                                  } catch (error) {
                                    alert(error.response?.data?.message || "Deleting attachment failed");
                                  }
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="input-control">No attachments</div>
                    )}
                  </div>
                  <div className="card-actions">
                    <button
                      className="btn btn-edit"
                      onClick={() =>
                        navigate(`/boards/${boardId}/tasks/edit/${task._id}`)
                      }
                    >
                      Edit
                    </button>
                    {isOwner && (
                      <button
                        className="btn btn-danger"
                        onClick={() => deleteTask(task._id)}
                      >
                        Delete
                      </button>
                    )}
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

      {isInviteModalOpen && (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="invite-title">
            <div className="section-heading">
              <h2 id="invite-title">Invite Member</h2>
              <p>Add an existing DevBoard user to this project.</p>
            </div>

            {inviteError && <div className="alert alert-error">{inviteError}</div>}

            <form className="form-stack" onSubmit={inviteMember}>
              <div className="field-group">
                <label htmlFor="invite-email">Email</label>
                <input
                  id="invite-email"
                  className="input-control"
                  type="email"
                  placeholder="member@gmail.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
              </div>

              <div className="card-actions">
                <button className="btn btn-primary" type="submit">
                  Invite
                </button>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={closeInviteModal}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoardDetails;
