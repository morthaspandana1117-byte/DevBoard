import { useState } from "react";
import { useNavigate } from "react-router-dom";

import client from "../api/client";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await client.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.token);
      window.dispatchEvent(new Event("auth:changed"));

      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-mark">D</div>
        <h1>DevBoard</h1>
        <p className="auth-subtitle">Manage your projects efficiently.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              className="input-control"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              className="input-control"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit">
            Login
          </button>
          <button
            className="btn btn-secondary btn-full"
            type="button"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </form>
      </div>

      <footer className="app-footer">
        Built with love using React, Express and MongoDB.
      </footer>
    </div>
  );
}

export default Login;
