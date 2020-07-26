//core module
const crypto = require("crypto");

const mongoose = require("mongoose");
const { Schema } = mongoose;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "please add an email"],
    unique: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minLength: 5,
    //dont show password when returning a user model instance
    select: false,
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//encrypt password with bcrypt
UserSchema.pre("save", async function (next) {
  //if password is not modified move to the next middleware
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);

  //hash password with salt
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// sign JWT and return
UserSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

//match user password from request to hashed password in db
UserSchema.methods.matchPassword = async function (requestPassword) {
  return await bcrypt.compare(requestPassword, this.password);
};

// generate && hash password token -> unique to identify reset process
UserSchema.methods.getResetPasswordToken = function () {
  //generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  //hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  //set expire time to 10 min
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
