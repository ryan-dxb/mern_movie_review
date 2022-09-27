const User = require("../models/User");
const EmailVerificationToken = require("../models/emailVerificationToken");
const { isValidObjectId } = require("mongoose");
const { generateOTP, generateMailTransporter } = require("../utlis/mail");
const { sendError, generateRandomByte } = require("../utlis/helper");
const PasswordResetToken = require("../models/passwordResetToken");
const jwt = require("jsonwebtoken");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser) return sendError(res, "Email is already in use");

  const newUser = new User({ name, email, password });
  await newUser.save();

  // Generate 6 Digit OTP
  const OTP = generateOTP(6);

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@moviewreview.com",
    to: newUser.email,
    subject: "Email Verification",
    html: `
      <p>Your verification OTP</p>
      <h1>${OTP}</h1>
    `,
  });

  res.status(201).json({
    message: "Please verify your email. OTP has been sent to your email",
  });
};

exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  if (!isValidObjectId(userId))
    return res.json({ error: "Invalid Credentials" });

  const user = await User.findById(userId);

  if (!user) return sendError(res, "User not found", 404);

  if (user.isVerified) return sendError(res, "User is already verified");

  const token = await EmailVerificationToken.findOne({ owner: userId });

  if (!token) return sendError(res, "Token not found");

  const isMatched = await token.compareToken(OTP);

  if (!isMatched) return sendError(res, "Please enter valid OTP");

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  res.json({ message: "Your email is verified" });

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@moviewreview.com",
    to: user.email,
    subject: "Welcome Email",
    html: `
    <h1>Welcome to our App !!</h1>  
    <p>Thanks for choosing us</p>
    `,
  });
};

exports.resendEmailVerificationToken = async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (!user) return sendError(res, "User not found");

  if (user.isVerified)
    return sendError(res, "This email id is already verified");

  const alreadyToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  if (alreadyToken)
    return sendError(
      res,
      "Only after one hour you can request for another token"
    );

  // OTP
  const OTP = generateOTP(6);

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "verification@moviewreview.com",
    to: user.email,
    subject: "Email Verification",
    html: `
      <p>Your verification OTP</p>
      <h1>${OTP}</h1>
    `,
  });
  res.status(201).json({
    message: "Please verify your email. OTP has been sent to your email",
  });
};

exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) return sendError(res, "Email is required");

  const user = await User.findOne({ email });
  if (!user) return sendError(res, "User not found", 404);

  const alreadyToken = await PasswordResetToken.findOne({ owner: user._id });
  if (alreadyToken) return sendError(res, "Try again after one hour");

  const token = await generateRandomByte();
  const newPasswordResetToken = await PasswordResetToken({
    owner: user._id,
    token,
  });

  await newPasswordResetToken.save();

  const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "security@moviewreview.com",
    to: user.email,
    subject: "Reset Password Link",
    html: `
      <p>Click here to reset password</p>
      <a href='${resetPasswordUrl}'>Click Here</a>
    `,
  });

  res.status(201).json({
    message: "Password Reset Link sent to your email",
  });
};

exports.sendResetPasswordTokenStatus = async (req, res) => {
  res.json({ valid: true });
};

exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  const user = await User.findById(userId);

  const matched = await user.comparePassword(newPassword);
  if (matched)
    return sendError(
      res,
      "The new password must be different from the old one!"
    );

  user.password = newPassword;
  await user.save();

  await PasswordResetToken.findByIdAndDelete(req.resetToken._id);

  var transport = generateMailTransporter();

  transport.sendMail({
    from: "security@moviewreview.com",
    to: user.email,
    subject: "Password Changed Successfully",
    html: `
      <p>Your Password has been changed successfully</p>
    `,
  });

  res.status(201).json({
    message: "Password changed successfully",
  });
};

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return sendError(res, "Credentials Invalid");

  const matched = await user.comparePassword(password);
  if (!matched) return sendError(res, "Credentials Invalid");

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.json({
    user: { id: user._id, name: user.name, email: user.email, token },
  });
};
