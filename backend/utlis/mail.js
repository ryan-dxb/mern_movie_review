const nodemailer = require("nodemailer");

exports.generateOTP = (otpLength = 6) => {
  // Generate 6 Digit OTP
  let OTP = "";

  for (let i = 1; i <= otpLength; i++) {
    const randomVal = Math.round(Math.random() * 9);

    OTP += randomVal;
  }

  return OTP;
};

exports.generateMailTransporter = () =>
  nodemailer.createTransport({
    host: process.env.NODEMAILER_HOST,
    port: 2525,
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASS,
    },
  });
