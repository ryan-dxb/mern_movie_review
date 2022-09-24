const mongooose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongooose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isVerified: {
    type: Boolean,
    required: true,
    default: false,
  },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hashedPassword = await bcrypt.hash(this.password, 10);

    this.password = hashedPassword;
  }

  next();
});

module.exports = mongooose.model("User", userSchema);
