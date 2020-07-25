const CustomError = require("../utils/customError");
const asyncHandler = require("../middleware/asyncHandler");
const User = require("../models/User");

//@des      Register user
//@route    POST /api/v1/auth/register
//@access   Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  //create user
  const user = await User.create({ name, email, password, role });

  //create token
  const token = user.getSignedToken();

  res.status(200).json({ success: true, token });
});

//@des      Login user
//@route    POST /api/v1/auth/login
//@access   Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  //validate email and password
  if (!email || !password) {
    return next(new CustomError("Please provide an email and password", 400));
  }

  //chekc for user && make user password appear in result
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new CustomError("Invalid credentials", 401));
  }

  //check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new CustomError("Invalid credentials", 401));
  }

  //create token
  const token = user.getSignedToken();

  res.status(200).json({ success: true, token });
});
