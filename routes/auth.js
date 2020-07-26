// routes to login user
const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword,
} = require("../controllers/auth");
const { protectRoute } = require("../middleware/protectRoute");
const { role } = require("../middleware/role");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

//protectRoute sets req.user -> needs to be before role("user") middleware, becouse role middleware accesses req.user
router.get("/me", protectRoute, role("user"), getMe);
//router.get("/me", protectRoute, getMe);

router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/updatedetails", protectRoute, updateDetails);
router.put("/updatepassword", protectRoute, updatePassword);

module.exports = router;
