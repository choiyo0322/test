import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set('view engine', 'pug');
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", socket => {
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  socket.on("enter_room",(roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome");
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) => socket.to(room).emit("bye"));
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", msg);
    done();
  });
});
/* 
const sockets = [];
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("Connected to Browser");
    socket.on("close", onSocketClose);
    socket.on("message", (msg) => {
        const message = JSON.parse(msg.toString());
        switch (message.type) {
          case "new_message":
            sockets.forEach((aSocket) =>
              aSocket.send(`${socket.nickname}: ${message.payload}`)
            );
            break;
          case "nickname":
            socket["nickname"] = message.payload;
            break;
        }
      });
    });*/
const handleListen = () => console.log('Listening on http://localhost:3000');
httpServer.listen(3000, handleListen);