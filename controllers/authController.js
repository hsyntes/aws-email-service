const ErrorProvider = require("../classes/ErrorProvider");
const User = require("../models/User");
const jsonwebtoken = require("jsonwebtoken");

// * Saving & Sending token
const sendToken = (res, statusCode, user, message) => {
  const token = jsonwebtoken.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.cookie("jsonwebtoken", token, {
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRES_IN) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    message,
    data: {
      user,
    },
  });
};

// * Signup
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

// * Login
exports.login = async (req, res, next) => {
  try {
    if ((!req.body.username || !req.body.email) && !req.body.password)
      return next(
        new ErrorProvider(
          403,
          "fail",
          "Please type your email or @username and password."
        )
      );

    if (req.body.username && req.body.email)
      return next(
        new ErrorProvider(
          403,
          "fail",
          "Please type your only email or @username."
        )
      );

    let user;

    if (req.body.email)
      user = await User.findOne({ email: req.body.email }).select("+password");
    if (req.body.username)
      user = await User.findOne({ username: req.body.username }).select(
        "+password"
      );

    if (!(await user.isPasswordCorrect(req.body.password, user.password)))
      return next(new ErrorProvider(401, "fail", "Password doesn't match."));

    sendToken(res, 200, user, "Welcome back!");
  } catch (e) {
    next(e);
  }
};
