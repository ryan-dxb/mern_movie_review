const express = require("express");
const {
  create,
  verifyEmail,
  resendEmailVerificationToken,
  forgetPassword,
  sendResetPasswordTokenStatus,
  resetPassword,
  signIn,
} = require("../controllers/userCtrl");
const { isValidPasswordResetToken } = require("../middlewares/user");
const { signInValidator } = require("../middlewares/validator,js");
const { passwordValidator } = require("../middlewares/validator,js");
const { userValidator, validate } = require("../middlewares/validator,js");

const router = express.Router();

router.post("/create", userValidator, validate, create);
router.post("/signin", signInValidator, signIn);

router.post("/verify-email", verifyEmail);
router.post("/resend-verify-email", resendEmailVerificationToken);

router.post("/forget-password", forgetPassword);
router.post(
  "/verify-password-reset-token",
  isValidPasswordResetToken,
  sendResetPasswordTokenStatus
);
router.post(
  "/reset-password",
  isValidPasswordResetToken,
  passwordValidator,
  validate,
  resetPassword
);

module.exports = router;
