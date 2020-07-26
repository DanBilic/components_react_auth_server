const CustomError = require("../utils/customError");
const asyncHandler = require("../middleware/asyncHandler");
const sendEmail = require("../utils/sendEmail");
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

//@des      Forgot password
//@route    POST /api/v1/auth/forgotpassword
//@access   Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new CustomError("There is no user with that email", 404));
  }

  //get reset token
  const resetToken = user.getResetPasswordToken();
  //console.log("RESET TOKEN", resetToken);

  await user.save({ validateBeforeSave: false });

  //create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ sucess: true, data: "Email sent" });
  } catch (error) {
    console.log(error);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new CustomError("Email could not be sent", 500));
  }
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
