const { Server } = require("socket.io");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("authenticate", (userId) => {
      if (!userId) {
        return;
      }

      socket.join(userId.toString());
      socket.userId = userId.toString();
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        socket.leave(socket.userId);
      }
    });
  });
};

const getSocket = () => io;

const sendNotification = (userId, notification) => {
  if (!io) {
    return;
  }

  io.to(userId.toString()).emit("notification", notification);
};

module.exports = {
  initSocket,
  getSocket,
  sendNotification,
};
