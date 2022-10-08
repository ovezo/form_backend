const express = require('express');
const router = express.Router();

const verifyToken = require('../middlewares/authJwt')

const categories = require("../controllers/category.controller.js");
  
// Create a new Category
router.post("/", verifyToken.verifyAccToken, upload.single('image'), categories.create);

// Retrieve all Categories For Admin
router.get("/for-admin", upload.none(), categories.findAllForAdmin);

// Retrieve all Categories
router.get("/", upload.none(), categories.findAll);

// Retrieve a single Category with id
router.get("/:id", upload.none(), categories.findById);

// Update a Category Image with id
router.post("/update-image", verifyToken.verifyAccToken, upload.single('image'), categories.updateImage);

// Update a Category Title with id
router.post("/update-title", verifyToken.verifyAccToken, upload.none(), categories.updateTitle);

// Update a Category with id
router.put("/:id", verifyToken.verifyAccToken, upload.none('image'), categories.update);

// Delete a Category with productId
router.delete("/:id", verifyToken.verifyAccToken, upload.none(), categories.delete);

// Create a new Category
router.delete("/", verifyToken.verifyAccToken, upload.none(), categories.deleteAll);


module.exports = router;
