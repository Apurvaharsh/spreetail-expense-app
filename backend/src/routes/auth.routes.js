const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();

const {
  register,
  login,
  getProfileStats
} = require("../controllers/auth.controller");

router.post(
  "/register",
  register
);

router.post(
  "/login",
  login
);

router.get(
  "/profile/stats",
  auth,
  getProfileStats
);

router.get(
  "/me",
  auth,
  async (req, res) => {
    res.json({
      userId: req.user.id
    });
  }
);

module.exports = router;
