const express = require("express");
const router = express.Router();
const { getMembers } = require("../controllers/group.controller");

router.get("/:groupId/members", getMembers);

module.exports = router;
