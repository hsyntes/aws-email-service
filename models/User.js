const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
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
    validator: [validator.isEmail, "Please type a valid email address."],
    trim: true,
    unique: true,
  },

  password: {
    type: String,
    minlength: [8, "Password cannot be shorter than 8 characters."],
    maxlength: [32, "Password is too long."],
    required: [true, "Password is required."],
    trim: true,
  },

  passwordConfirm: {
    type: String,
    minlength: [8, "Password cannot be shorter than 8 characters."],
    maxlength: [32, "Password is too long."],
    required: [true, "Please confirm your password."],
    validator: {
      validate: function (value) {
        return value === this.password;
      },

      message: "Password doesn't match.",
    },
    trim: true,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
