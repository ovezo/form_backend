const express = require('express');
const router = express.Router();

const auth = require("../controllers/auth.controller.js");

// Create up a Teacher
router.post("/", auth.create);

// Log in admin
router.post("/login-admin", auth.adminLogin);

// Update teacher information
router.put("/:id", auth.update);

//get Teachers
router.get("/", auth.getAll);

// Delete a User with phone number
router.delete("/:id", auth.delete);

module.exports = router;
