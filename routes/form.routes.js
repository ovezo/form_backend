const express = require('express');
const router = express.Router();

const form = require("../controllers/form.controller.js");

// Create up a Class
router.post("/", form.create);

router.put("/comment/:id", form.updateComment);

// Update form information
router.put("/:id", form.update);

//get Classs
router.get("/", form.getAll);
router.get("/comments", form.getComments);
router.get("/teacher-comments", form.getTeacherComments);

// Delete a User with phone number
router.delete("/:id", form.delete);

module.exports = router;
