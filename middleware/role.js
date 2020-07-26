const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const CustomError = require("../utils/customError");
const User = require("../models/User");

//grant access to specific roles
exports.role = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        //403 -> forbidden error
        new CustomError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
