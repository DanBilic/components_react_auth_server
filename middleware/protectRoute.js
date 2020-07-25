const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const CustomError = require("../utils/customError");
const User = require("../models/User");

//protect routes
exports.protectRoute = asyncHandler(async (req, res, next) => {
  let token;

  //Bearer token is send with the req header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    //Bearer space token -> extract token
    console.log("header", req.headers);
    token = req.headers.authorization.split(" ")[1];
  }

  /*
  //Bearer token is send with the cookie
  else if(req.cookies.token){
      token = req.cookies.token
  }
  */

  //make sure token exists
  if (!token) {
    return next(new CustomError("Not authorized to access this route", 401));
  }

  try {
    //verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);

    //set the user to req.user
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(new CustomError("Not authorized to access this route", 401));
  }
});
