const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authJwt')

const upload = require('../middlewares/uploader');

const banners = require("../controllers/home.controller.js");

// Create a new Banner
router.post("/", verifyToken.verifyAccToken, upload.none(), banners.create);

// Retrieve Notification
router.get("/notify", upload.none(), banners.getNotif);

// Retrieve all Banners
router.get("/", upload.none(), banners.findAll);

// Update a Banner Link with id
router.put("/link/:id", verifyToken.verifyAccToken, upload.single("image"), banners.updateLink);

// Update Notification with id
router.put("/notify", verifyToken.verifyAccToken, upload.none(), banners.updateNotif);

// Update a Banner Small Image with id
router.put("/field/:id", verifyToken.verifyAccToken, upload.single("image"), banners.updateField);
// Update a Banner with id
router.put("/:id", verifyToken.verifyAccToken, upload.single("image"), banners.update);

// Delete a Banner with id
router.delete("/:id", verifyToken.verifyAccToken, upload.none(), banners.delete);

// Create a new Banner
router.delete("/", verifyToken.verifyAccToken, upload.none(), banners.deleteAll);

module.exports = router;
