const Room = require("../models/roomModel");

module.exports.createRoom = async (req, res, next) => {
  try {
    const { name } = req.body;
    const data = await Room.create({
      name: name,
    });

    if (data) return res.json({ msg: "Room Created successfully." });
    else return res.json({ msg: "Failed to add room to DB" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.getAllRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find().sort({ updatedAt: 1 });
    res.json(rooms);
  } catch (ex) {
    next(ex);
  }
};

module.exports.getRoomById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const room = await Room.find({ _id: id });
    res.json(room);
  } catch (ex) {
    next(ex);
  }
};

module.exports.deleteRoom = async (req, res) => {
  try {
    const roomById = await Room.deleteOne({ _id: req.params.id });
    return res.json(roomById);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};
