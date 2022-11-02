const Pins = require("../models/pinsModel");

module.exports.addPin = async (req, res) => {
  try {
    const { from, to, content, time, type, fromId } = req.body;
    const data = await Pins.create({
      content: content,
      users: [from, to],
      sender: from,
      time: time,
      type: type,
      fromId: fromId
    });

    if (data) return res.json({ msg: data });
    else return res.json({ msg: "Failed to add PIN to the database" });
  } catch (err) {
    console.log(err);
  }
};

module.exports.getPins = async (req, res) => {
  try {
    const { from, to } = req.body;
    const pins = await Pins.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 }).populate("sender", ["username", "avatarImage"]).populate("fromId", ["_id"]);
    res.json(pins);
  } catch (err) {
    console.log(err);
  }
};

module.exports.deletePin = async (req, res) => {
  try {
    const pinById = await Pins.deleteOne({ _id: req.params.id });
    return res.json(pinById);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};
