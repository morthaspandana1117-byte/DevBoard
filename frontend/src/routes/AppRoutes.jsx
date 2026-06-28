import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import BoardDetails from "../pages/BoardDetails";
import EditBoard from "../pages/EditBoard";
import EditTask from "../pages/EditTask";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/boards/:boardId" element={<BoardDetails />} />

      <Route path="/boards/edit/:boardId" element={<EditBoard />} />

      <Route
        path="/boards/:boardId/tasks/edit/:taskId"
        element={<EditTask />}
      />
    </Routes>
  );
}

export default AppRoutes;
