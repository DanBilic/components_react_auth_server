// routes to login user
const express = require("express");
const { register, login, getMe } = require("../controllers/auth");
const { protectRoute } = require("../middleware/protectRoute");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protectRoute, getMe);

module.exports = router;
