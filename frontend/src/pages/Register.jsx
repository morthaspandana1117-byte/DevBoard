import { useState } from "react";
import {useNavigate } from "react-router-dom";

import client from "../api/client";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await client.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Registration Successful");
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="brand-mark">D</div>
        <h1>Create account</h1>
        <p className="auth-subtitle">Manage your projects efficiently.</p>

        <form className="form-stack" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="register-name">Name</label>
            <input
              id="register-name"
              className="input-control"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              className="input-control"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field-group">
            <label htmlFor="register-password">Password</label>
            <input
              id="register-password"
              className="input-control"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit">
            Register
          </button>
          <button
            className="btn btn-secondary btn-full"
            type="button"
            onClick={() => navigate("/")}
          >
            Back to Login
          </button>
        </form>
      </div>

      <footer className="app-footer">
        Built with love using React, Express and MongoDB.
      </footer>
    </div>
  );
}

export default Register;
