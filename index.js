const { getUserInfo } = require("@replit/repl-auth")
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const httpserver = http.Server(app);
const io = socketio(httpserver);

const gamedirectory = path.join(__dirname, "html");

app.use(express.static(gamedirectory));

app.get('/', (req, res) => {
  const user = getUserInfo(req)
  if (user) {
    res.send('Hello ' + user.name)
  } else {
    res.sendFile(__dirname + '/index.html')
  }
});

httpserver.listen(3000);

var rooms = [];
var usernames = [];

io.on('connection', function(socket){

  socket.on("join", function(room, username){
    if (username != ""){
      rooms[socket.id] = room;
      usernames[socket.id] = username;
      socket.leaveAll();
      socket.join(room);
      io.in(room).emit("recieve", "Welcome, " + username + ". We're glad you're here. UPDATE: New Favicon!");
      socket.emit("join", room);
    }
  })

  socket.on("send", function(message){
    io.in(rooms[socket.id]).emit("recieve", usernames[socket.id] +" : " + message);
  })

  socket.on("recieve", function(message){
    socket.emit("recieve", message);
  })
})
