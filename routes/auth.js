// routes to login user
const express = require("express");
const { register, login, getMe } = require("../controllers/auth");
const { protectRoute } = require("../middleware/protectRoute");
const { role } = require("../middleware/role");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

//protectRoute sets req.user -> needs to be before role("user") middleware, becouse role middleware accesses req.user
router.get("/me", protectRoute, role("user"), getMe);
//router.get("/me", protectRoute, getMe);

module.exports = router;
