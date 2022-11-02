const { addPin, getPins, deletePin } = require("../controllers/pinController");
const router = require("express").Router();

router.post("/addpin/", addPin);
router.post("/getpins/", getPins);
router.delete("/deletePin/:id", deletePin);

module.exports = router;
