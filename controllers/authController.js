const User = require("../models/User");
const jsonwebtoken = require("jsonwebtoken");

const sendToken = (res, statusCode, user, message) => {
  const token = jsonwebtoken.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("jsonwebtoken", token, {});
};

exports.signup = async (req, res, next) => {
  try {
    const user = await User.create({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    sendToken(res, 201, user, "You've signed up successfully!");
  } catch (e) {
    next(e);
  }
};
