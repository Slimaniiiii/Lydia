const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const messageRoutes = require("./routes/messages");
const pinRoutes = require("./routes/pin");
const roomRoutes = require("./routes/room");
const app = express();
const socket = require("socket.io");
const Room = require("./models/roomModel");

require("dotenv").config();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DB Connetion Successfull");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/pins", pinRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/uploads", express.static("uploads"));
const users = [];
const addUser = ({ socket_id, name, user_id, room_id }) => {
  const exist = users.find(
    (user) => user.room_id === room_id && user.user_id === user_id
  );
  if (exist) {
    return { error: "User already exist in this room" };
  }
  const user = { socket_id, name, user_id, room_id };
  users.push(user);
  // console.log("users list", users);
  return { user };
};
const multer = require("multer");
const fs = require("fs");

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  // fileFilter: (req, file, cb) => {
  //   const ext = path.extname(file.originalname)
  //   if (ext !== '.jpg' && ext !== '.png' && ext !== '.mp4') {
  //     return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false);
  //   }
  //   cb(null, true)
  // }
});

let upload = multer({ storage: storage }).single("file");

app.post("/api/chat/uploadfiles", (req, res) => {
  upload(req, res, (err) => {
    console.log(res);
    if (err) {
      return res.json({ success: false, err });
    }
    return res.json({ success: true, url: res.req.file.path });
  });
});

const server = app.listen(process.env.PORT, () =>
  console.log(`Server started on ${process.env.PORT}`)
);
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});

global.onlineUsers = new Map();
io.on("connection", (socket) => {
  global.chatSocket = socket;
  socket.on("add-user", (userId) => {
    onlineUsers.set(userId, socket.id);
  });

  socket.on("send-msg", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    if (sendUserSocket) {
      socket.to(sendUserSocket).emit("msg-recieve", data.msg);
    }
  });
  // console.log("onlineUsers", onlineUsers);
  socket.on("callUser", (data) => {
    // console.log("data", data)
    const sendUserSocket = onlineUsers.get(data.userToCall);
    // console.log("data", data)
    socket.to(sendUserSocket).emit("callUser", {
      signal: data.signal,
      from: data.from,
      name: data.name,
    });
  });
  socket.on("answerCall", (data) => {
    const sendUserSocket = onlineUsers.get(data.to);
    socket.to(sendUserSocket).emit("callAccepted", data.signal);
  });

  //rooms
  //room creation
  socket.on("create-room", (name) => {
    const room = new Room({ name });
    room.save().then((result) => {
      io.emit("room-created", result);
    });
  });

  //room joining
  socket.on("join", ({ name, room_id, user_id }) => {
    console.log("hererereiuhra");
    const { error, user } = addUser({
      socket_id: socket.id,
      name,
      room_id,
      user_id,
    });
    socket.join(room_id);
    if (error) {
      console.log("join error", error);
    } else {
      console.log("join user", user);
    }
  });

  // socket.on("get-messages-history", (room_id) => {
  //   Message.find({ room_id }).then((result) => {
  //     socket.emit("output-messages", result);
  //   });
  // });

  //  socket.on("answerCall", (data) => socket.to(data.to).emit("callAccepted"), data.signal)
});
