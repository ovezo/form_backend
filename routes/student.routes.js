const express = require('express');
const router = express.Router();

const student = require("../controllers/student.controller.js");

// Create up a Class
router.post("/", student.create);

// Update student information
router.put("/:id", student.update);

//get student by id
router.get("/:id", student.getById);

//get Classs
router.get("/", student.getAll);

// Delete a User with phone number
router.delete("/:id", student.delete);

module.exports = router;
