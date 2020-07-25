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

  sendTokenResponse(user, 200, res);
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

  sendTokenResponse(user, 200, res);
});

//get token from model && create cookie ans send response
const sendTokenResponse = (user, statusCode, res) => {
  //create token
  const token = user.getSignedToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  //send cookie via https
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  //set cookie in response (safer than localstorage by just sending jwt token back)
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

//@des      Get current logged in user
//@route    POST /api/v1/auth/me
//@access   Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});
