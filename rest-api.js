const express = require('express');
const router = express.Router();

// import routes
const auth = require("./routes/auth.routes.js");
const student = require("./routes/student.routes.js");
const form = require("./routes/form.routes.js");
const mClass = require("./routes/class.routes.js");
// const category = require("./routes/category.routes.js");
// const product = require("./routes/product.routes.js");
// const home = require("./routes/home.routes.js");
// const order = require("./routes/order.routes.js");


//init routes
router.use("/auth", auth);
router.use("/classes", mClass);
router.use("/students", student);
router.use("/forms", form);
// router.use("/categories", category);
// router.use("/products", product);
// router.use("/orders", order);
// router.use("/home", home);

module.exports = router;
