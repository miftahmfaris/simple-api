require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const index = require("./api");
const accounts = require("./api/accounts");

const mongoose = require("mongoose");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/", index);
app.use("/accounts", accounts);

mongoose.Promise = global.Promise;

const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI);

app.use(function(req, res, next) {
  const err = new Error("Not Found");
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.message = req.app.get("env") === "development" ? err : {};

  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
