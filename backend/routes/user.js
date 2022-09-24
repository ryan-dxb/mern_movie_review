const express = require("express");
const {
  create,
  verifyEmail,
  resendEmailVerificationToken,
} = require("../controllers/userCtrl");
const { userValidator, validate } = require("../middlewares/validator,js");

const router = express.Router();

router.post("/create", userValidator, validate, create);
router.post("/verify-email", verifyEmail);
router.post("/resend-verify-email", resendEmailVerificationToken);

module.exports = router;
