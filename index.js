const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require('path');

var dbConfig = require('./config/db.config')

const rest_api = require('./rest-api');
const app = express();

var http = require('http').createServer(app);

app.use(cors());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(bodyParser.json());

// access to public directory
app.use('/public', express.static(path.join(__dirname, '/public')));
app.use(express.static('public'));

// welcome route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to ecommerse project." });
});


//init routes
app.use("/api", rest_api);


// set port, listen for requests
http.listen(4000, () => {
  console.log("Server is running on port 4000.");
});

