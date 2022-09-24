const User = require("../models/User");
const EmailVerificationToken = require("../models/emailVerificationToken");
const nodemailer = require("nodemailer");
const { isValidObjectId } = require("mongoose");

exports.create = async (req, res) => {
  const { name, email, password } = req.body;

  const oldUser = await User.findOne({ email });

  if (oldUser)
    return res.status(401).json({ error: "Email is already in use" });

  const newUser = new User({ name, email, password });
  await newUser.save();

  // Generate 6 Digit OTP
  let OTP = "";

  for (let i = 0; i <= 5; i++) {
    const randomVal = Math.round(Math.random() * 9);

    OTP += randomVal;
  }

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: newUser._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "a587bc4e5cd48d",
      pass: "8226d8eeb30bab",
    },
  });

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

  if (!user) return res.json({ error: "User not found" });

  if (user.isVerified) return res.json({ error: "User is already verified" });

  const token = await EmailVerificationToken.findOne({ owner: userId });

  if (!token) return res.json({ error: "Token not found" });

  const isMatched = await token.compareToken(OTP);

  if (!isMatched) return res.json({ error: "Please enter valid OTP" });

  user.isVerified = true;
  await user.save();

  await EmailVerificationToken.findByIdAndDelete(token._id);

  res.json({ message: "Your email is verified" });

  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "a587bc4e5cd48d",
      pass: "8226d8eeb30bab",
    },
  });

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

  if (!user) return res.json({ error: "User not found" });

  if (user.isVerified)
    return res.json({ error: "This email id is already verified" });

  const alreadyToken = await EmailVerificationToken.findOne({
    owner: userId,
  });

  if (alreadyToken)
    return res.json({
      error: "Only after one hour you can request for another token",
    });

  // Generate 6 Digit OTP
  let OTP = "";

  for (let i = 0; i <= 5; i++) {
    const randomVal = Math.round(Math.random() * 9);

    OTP += randomVal;
  }

  const newEmailVerificationToken = new EmailVerificationToken({
    owner: user._id,
    token: OTP,
  });

  await newEmailVerificationToken.save();

  var transport = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: "a587bc4e5cd48d",
      pass: "8226d8eeb30bab",
    },
  });

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
