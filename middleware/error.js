const CustomError = require("../utils/customError");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  //log to console for DEV
  console.log(err);

  //mongoose bad ObjectID
  if (err.name === "CastError") {
    const message = `User not found with the id of ${err.value}`;
    error = new CustomError(message, 404);
  }

  //mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field entered";
    error = new CustomError(message, 404);
  }

  //mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new CustomError(message, 404);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
