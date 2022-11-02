const Messages = require("../models/messageModel");

module.exports.getMessages = async (req, res, next) => {
  try {
    const { from, to } = req.body;

    const messages = await Messages.find({
      users: {
        $all: [from, to],
      },
    }).sort({ updatedAt: 1 });
    const projectedMessages = messages.map((msg) => {
      return {
        id: msg._id,
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
        time: msg.time,
        type: msg.type,
      };
    });
    res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};

module.exports.deleteMessage = async (req, res) => {
  try {
    const messageById = await Messages.deleteOne({ _id: req.params.id })
      return res.json(messageById);
  } catch (err) {
    console.log(err)
    return res.status(500).json(err)
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const { from, to, message, time, type } = req.body;
    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
      time: time,
      type: type,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    next(ex);
  }
};
