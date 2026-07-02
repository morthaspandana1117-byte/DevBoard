import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import client from "../api/client";

const statusColors = {
  todo: "#f59e0b",
  "in-progress": "#3b82f6",
  done: "#22c55e",
};

function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await client.get("/analytics");
        setAnalytics(response.data);
      } catch (error) {
        alert(error.response?.data?.message || "Fetching analytics failed");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const renderEmptyState = () => (
    <div className="empty-state">
      <div className="empty-icon">📊</div>
      <h3>No analytics available yet.</h3>
      <p>Create boards and tasks to see your insights.</p>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">A</div>
          <div>
            <h1>Analytics</h1>
            <p>Track delivery and see how your boards are progressing.</p>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="page-content">
        {loading ? (
          <section className="panel">
            <div className="empty-state">
              <div className="empty-icon">⏳</div>
              <h3>Loading analytics…</h3>
              <p>Preparing your board insights.</p>
            </div>
          </section>
        ) : !analytics || analytics.totalTasks === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <section className="panel">
              <div className="section-heading">
                <h2>Summary</h2>
                <p>Quick health snapshot of your boards and work.</p>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card task-card">
                  <span className="analytics-label">📋 Total Boards</span>
                  <strong>{analytics.totalBoards}</strong>
                </div>
                <div className="analytics-card task-card">
                  <span className="analytics-label">📝 Total Tasks</span>
                  <strong>{analytics.totalTasks}</strong>
                </div>
                <div className="analytics-card task-card">
                  <span className="analytics-label">🟡 Todo</span>
                  <strong>{analytics.todoTasks}</strong>
                </div>
                <div className="analytics-card task-card">
                  <span className="analytics-label">🔵 In Progress</span>
                  <strong>{analytics.inProgressTasks}</strong>
                </div>
                <div className="analytics-card task-card">
                  <span className="analytics-label">✅ Done</span>
                  <strong>{analytics.doneTasks}</strong>
                </div>
                <div className="analytics-card task-card">
                  <span className="analytics-label">🎯 Completion Rate</span>
                  <strong>{analytics.completedPercentage}%</strong>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="section-heading">
                <h2>Task Status Distribution</h2>
                <p>Visual breakdown of work by status.</p>
              </div>

              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={analytics.tasksByStatus}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {analytics.tasksByStatus.map((entry) => (
                        <Cell key={entry.status} fill={statusColors[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="panel">
              <div className="section-heading">
                <h2>Tasks Per Board</h2>
                <p>Compare how much work is tracked per board.</p>
              </div>

              <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={analytics.tasksPerBoard}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="boardName" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="totalTasks" radius={[8, 8, 0, 0]}>
                      {analytics.tasksPerBoard.map((entry, index) => (
                        <Cell key={`${entry.boardName}-${index}`} fill={index % 2 === 0 ? "#2563eb" : "#60a5fa"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="app-footer">
        Built with love using React, Express and MongoDB.
      </footer>
    </div>
  );
}

export default Analytics;
