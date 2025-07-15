"use trict";

const express = require("express");
const acccessController = require("../../controllers/access.controller");
const { asyncHandler } = require("../../helpers/asyncHandler");
const { authentication } = require("../../auth/authUtils");
const router = express.Router();

// signUp
router.post("/shop/signup", asyncHandler(acccessController.signUp));
router.post("/shop/login", asyncHandler(acccessController.login));

// authentication
router.use(authentication);
////////////////////
router.post("/shop/logout", asyncHandler(acccessController.logout));

module.exports = router;
