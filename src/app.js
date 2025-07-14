const express = require("express");
const { default: helmet } = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const app = express();
require("dotenv").config();

//init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());

app.use(express.json()); // Config req.body
app.use(express.urlencoded({ extend: true }));

//init db
require("./dbs/init.mongodb");
const { checkOverLoad } = require("./helpers/check.connect");

// checkOverLoad();

// init routes
app.use("", require("./routes"));
// handing error

// hàm middleware có 3 tham số ,
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

//hàm quản lý lỗi thì có 4 tham số
app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
  });
});

module.exports = app;
