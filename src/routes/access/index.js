"use trict";

const express = require("express");
const acccessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../auth/checkAuth");
const router = express.Router();

// signUp
router.post("/shop/signup", asyncHandler(acccessController.signUp));

module.exports = router;
