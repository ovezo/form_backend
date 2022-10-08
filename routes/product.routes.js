const express = require('express');
const router = express.Router();

const upload = require('../middlewares/uploader');
const createThumb = require('../middlewares/thumbnail');
const verifyToken = require('../middlewares/authJwt')

const products = require("../controllers/product.controller.js");


// Retrieve all Products by category
router.post("/get-products", upload.none(), products.findAllByCategory);

// Retrieve all Products by category
router.post("/get-for-admin", verifyToken.verifyAccToken, upload.none(), products.findAllForAdmin);

// Retrieve a single Product with id
router.get("/:id", upload.none(), products.findById);

// Increment view of Product with id
router.put("/view/:id", verifyToken.verifyAccToken, upload.none(), products.incView);

// Retrieve a single Product with id
router.get("/get/:id", upload.none(), products.findById);

// Update a detail of a Product with id
router.put("/product-detail/:id", upload.none(), verifyToken.verifyAccToken, products.updateDetail);

// Update a Product with id
router.put("/:id", verifyToken.verifyAccToken, upload.array("image[]"), createThumb, products.update);

// Delete a Product with array of ids
router.post("/delete-array", verifyToken.verifyAccToken, upload.none(), products.deleteArray);

// Create a new Product
router.post("/", verifyToken.verifyAccToken, upload.array("image[]"), createThumb, products.create);

// Delete a Product with id
router.delete("/:id", verifyToken.verifyAccToken, upload.none(), products.delete);

// Create a new Product
router.delete("/", products.deleteAll);

module.exports = router;
