const express = require('express');
const router = express.Router();

const upload = require('../middlewares/uploader');
const verifyToken = require('../middlewares/authJwt')

const orders = require("../controllers/order.controller.js");

// Create a new Order
router.post("/by-credit", upload.none(), orders.proceedCreditOrder);

// Create a new Order
router.post("/", upload.none(), orders.create);


// Retrieve all Orders 
router.get("/all-orders", upload.none(), verifyToken.verifyAccToken, orders.findAll);

// Get status by order id
router.get("/:id", upload.none(), orders.checkStatusOrder);


// Get orders by UserId
router.get("/", verifyToken.verifyAccToken, upload.none(), orders.findUserOrders);

// Cancel a Order with id
router.put("/cancel/:id", verifyToken.verifyAccToken, upload.none(), orders.cancel);

// Update a Order with id
router.put("/:id", verifyToken.verifyAccToken, upload.none(), orders.update);

// Delete a Order with productId
router.delete("/:orderId", verifyToken.verifyAccToken, upload.none(), orders.delete);

// Create a new Order
router.delete("/", verifyToken.verifyAccToken, upload.none(), orders.deleteAll);


module.exports = router;
