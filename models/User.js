const mongoose = require("mongoose");
const validator = require("validator");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      minlength: [2, "Firstname cannot be shorter than 2 characters."],
      maxlength: [24, "Firstname cannot be longer than 24 characters."],
      required: true,
      trim: true,
    },

    lastname: {
      type: String,
      minlength: [2, "Lastname cannot be shorter than 2 characters."],
      mixlength: [24, "Lastname cannot be longer than 24 characters."],
      required: true,
      trim: true,
    },

    username: {
      type: String,
      minlength: [3, "@username cannot be shorter than 3 characters."],
      maxlength: [12, "@username cannot be longer than 12 characters."],
      required: [true, "@username is required."],
      trim: true,
      unique: true,
    },

    email: {
      type: String,
      required: [true, "Email Address is required."],
      validate: [validator.isEmail, "Please type a valid email address."],
      trim: true,
      unique: true,
    },

    password: {
      type: String,
      minlength: [8, "Password cannot be shorter than 8 characters."],
      maxlength: [32, "Password is too long."],
      required: [true, "Password is required."],
      trim: true,
      select: false,
    },

    passwordConfirm: {
      type: String,
      minlength: [8, "Password cannot be shorter than 8 characters."],
      maxlength: [32, "Password is too long."],
      required: [true, "Please confirm your password."],
      validate: {
        validator: function (value) {
          return value === this.password;
        },

        message: "Password doesn't match.",
      },
      trim: true,
    },

    passwordResetToken: String,
    passwordResetTokenExpiresIn: Date,
  },
  { versionKey: false }
);

// * Document Middleware
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

// * Instance Methods

// * Checking candidate and real passsword
userSchema.methods.isPasswordCorrect = async (candidate, password) =>
  await bcrypt.compare(candidate, password);

userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  this.passwordResetTokenExpiresIn = new Date(Date.now()) + 10 * 60 * 1000;

  return token;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
