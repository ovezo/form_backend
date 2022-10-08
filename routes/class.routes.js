const express = require('express');
const router = express.Router();

const mClass = require("../controllers/class.controller.js");

// Create up a Class
router.post("/", mClass.create);

// Update class information
router.put("/:id", mClass.update);

//get Classs
router.get("/", mClass.getAll);

// Delete a User with phone number
router.delete("/:id", mClass.delete);

module.exports = router;
