const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const authRoutes = require("./routes/authRoutes");
const boardRoutes = require("./routes/boardRoutes");
const taskRoutes = require("./routes/taskRoutes");
const taskAssignRoutes = require("./routes/taskAssignRoutes");
const userRoutes = require("./routes/userRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const { initSocket } = require("./socket");

const app = express();
const server = http.createServer(app);



app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/tasks", taskAssignRoutes);
app.use("/api/users", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);




mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log(err);
    console.log("MongoDB Not Connected");
  });

app.get("/", (req, res) => {
  res.send("DevBoard API Running");
});

const PORT = process.env.PORT || 5000;

initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
