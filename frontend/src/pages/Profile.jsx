import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import client from "../api/client";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderTiming, setReminderTiming] = useState("1d");

  const [alertMessage, setAlertMessage] = useState("");
  const [alertError, setAlertError] = useState("");

  const navigate = useNavigate();

  const refreshProfile = async () => {
    setLoading(true);
    try {
      const response = await client.get("/users/profile");
      setProfile(response.data);

      // Sync form fields when not editing (so Save/Cancel behaves predictably)
      if (!isEditing) {
        setName(response.data?.name || "");
        setEmail(response.data?.email || "");
        setReminderEnabled(response.data?.reminderEnabled ?? true);
        setReminderTiming(response.data?.reminderTiming || "1d");
      }

      setAlertError("");
      setAlertMessage("");
    } catch (error) {
      setAlertError(error.response?.data?.message || "Fetching profile failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Avoid calling setState synchronously inside effects.
    // Defer the async refresh to the next tick.
    const id = setTimeout(() => {
      refreshProfile();
    }, 0);

    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);




  const startEditing = () => {
    setAlertMessage("");
    setAlertError("");
    setIsEditing(true);

    setName(profile?.name || "");
    setEmail(profile?.email || "");
  };

  const cancelEditing = () => {
    setAlertMessage("");
    setAlertError("");
    setIsEditing(false);

    setName(profile?.name || "");
    setEmail(profile?.email || "");
  };

  const saveChanges = async (e) => {
    e.preventDefault();

    setAlertMessage("");
    setAlertError("");

    try {
      await client.put("/users/profile", {
        name,
        email,
        reminderEnabled,
        reminderTiming,
      });

      setAlertMessage("Profile updated successfully");
      setIsEditing(false);

      await refreshProfile();
    } catch (error) {
      setAlertError(error.response?.data?.message || "Updating profile failed");
    }
  };

  const avatarLetter = profile?.name?.trim()?.[0]?.toUpperCase() || "U";
  const createdAt = profile?.createdAt;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <h1>User Profile</h1>
            <p>Manage your account details.</p>
          </div>
        </div>

        <button className="btn btn-outline" onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </header>

      <main className="page-content">
        <section className="panel">
          <div className="section-heading">
            <h2>Account</h2>
            <p>Your details are used for login and account recovery.</p>
          </div>

          {alertMessage && <div className="alert alert-success">{alertMessage}</div>}
          {alertError && <div className="alert alert-error">{alertError}</div>}

          {loading ? (
            <div className="empty-state">
              <h3>Loading profile...</h3>
              <p>Please wait.</p>
            </div>
          ) : profile ? (
            <div>
              <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 18 }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 18,
                    background: "rgba(37, 99, 235, 0.1)",
                    color: "#2563eb",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    fontSize: "1.35rem",
                    border: "1px solid rgba(37, 99, 235, 0.18)",
                  }}
                >
                  {avatarLetter}
                </div>

                <div>
                  <h2 style={{ margin: 0, fontSize: "1.3rem" }}>{profile.name}</h2>
                  <p style={{ margin: "6px 0 0", color: "var(--muted)" }}>{profile.email}</p>
                </div>

                <div style={{ marginLeft: "auto" }}>
                  {!isEditing ? (
                    <button className="btn btn-primary" onClick={startEditing}>
                      Edit Profile
                    </button>
                  ) : (
                    <form onSubmit={saveChanges}>
                      <div className="field-group" style={{ marginBottom: 12 }}>
                        <label htmlFor="profile-name">Name</label>
                        <input
                          id="profile-name"
                          className="input-control"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>

                      <div className="field-group" style={{ marginBottom: 12 }}>
                        <label htmlFor="profile-email">Email</label>
                        <input
                          id="profile-email"
                          className="input-control"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="field-group" style={{ marginBottom: 12 }}>
                        <label htmlFor="reminder-enabled">Email Reminders</label>
                        <select
                          id="reminder-enabled"
                          className="input-control"
                          value={reminderEnabled ? "enabled" : "disabled"}
                          onChange={(e) => setReminderEnabled(e.target.value === "enabled")}
                        >
                          <option value="enabled">Enable</option>
                          <option value="disabled">Disable</option>
                        </select>
                      </div>

                      <div className="field-group" style={{ marginBottom: 12 }}>
                        <label htmlFor="reminder-timing">Reminder Timing</label>
                        <select
                          id="reminder-timing"
                          className="input-control"
                          value={reminderTiming}
                          onChange={(e) => setReminderTiming(e.target.value)}
                        >
                          <option value="30m">30 minutes before</option>
                          <option value="1h">1 hour before</option>
                          <option value="6h">6 hours before</option>
                          <option value="1d">1 day before</option>
                        </select>
                      </div>

                      <div className="card-actions">
                        <button className="btn btn-primary" type="submit">
                          Save Changes
                        </button>
                        <button
                          className="btn btn-outline"
                          type="button"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>

              {!isEditing && (
                <div className="project-meta" style={{ marginBottom: 0 }}>
                  <div>
                    <span className="meta-label">Full Name</span>
                    <strong>{profile.name}</strong>
                  </div>

                  <div>
                    <span className="meta-label">Email</span>
                    <strong>{profile.email}</strong>
                  </div>

                  <div>
                    <span className="meta-label">Account Created</span>
                    <strong>{new Date(createdAt).toLocaleDateString()}</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <h3>Profile not found.</h3>
              <p>Please login again.</p>
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

export default Profile;

