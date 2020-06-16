const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const router = require("./router");
const { addUser, removeUser, getUser, getUserInRoom } = require("./users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });
    socket.broadcast
      .to(user.name)
      .emit("message", { user: "admin", text: `${user.name}, has joined!` });

    socket.join(user.room);
    callback();
  });
  socket.on("sendMessage", (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.name).emit("message", { user: user.name, text: message });

    callback();
  });

  socket.on("disconnet", () => {
    console.log("user has left !");
  });
});

app.use(router);
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`server is running on port ${PORT}...`);
});
