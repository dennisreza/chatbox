const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./src/config/db");
const colors = require("colors");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const Messages = require("./src/models/messages");

const app = express();
const server = http.createServer(app);

// PORT
const PORT = process.env.PORT || 3000;

// env config
dotenv.config();

//connect mongoDB
connectDB();

// socket io
const io = socketIO(server);

//cors config
app.use(cors());

app.use(bodyParser.json());
app.get("/", (req, res) => {
  res.send("API is running successfully");
});

// connect socket
io.on("connect", (socket) => {
  // get data from mongoDB
  console.log("client is connecting to socket".magenta.bold);

  Messages.find().then((result) => {
    socket.emit("output-messages", result);
  });

  socket.emit("message", "admin", "welcome to chat room");

  // send message & save to mongoDB
  socket.on("chatmessage", (user, msg) => {
    const message = new Messages({user: user, msg: msg });
    message.save().then(() => {
      io.emit("message", user, msg);
    });
  });

  // user disconnect to socket
  socket.on("disconnect", () => {
    console.log("user disconnected".grey.bold);
  });
});

server.listen(PORT, console.log(`server started on PORT ${PORT}`.yellow.bold));
