const {
  createRoom,
  getAllRooms,
  deleteRoom,
  getRoomById,
} = require("../controllers/roomController");
const router = require("express").Router();

router.post("/chatroom/add", createRoom);
router.get("/rooms/", getAllRooms);
router.get("/room/:id", getRoomById);
router.delete("/deleteroom/:id", deleteRoom);

module.exports = router;
