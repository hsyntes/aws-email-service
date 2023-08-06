const Email = require("../classes/Email");
const ErrorProvider = require("../classes/ErrorProvider");
const User = require("../models/User");
const jsonwebtoken = require("jsonwebtoken");
const validator = require("validator");

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
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
    });

    try {
      await new Email(
        user,
        `${req.protocol}://${req.get("host")}`
      ).sendWelcome();
    } catch (e) {
      // * Ignore email verification error and proceed
      console.error(`Email verification error: ${e}`);
    }

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

    try {
      await new Email(
        user,
        `${req.protocol}://${req.get("host")}:8000`
      ).sendWelcome();
    } catch (e) {
      // * Ignore email verification error and proceed
    }

    sendToken(res, 200, user, "Welcome back!");
  } catch (e) {
    next(e);
  }
};

// * Sending rest link to user's email address
exports.forgotPassword = async (req, res, next) => {
  try {
    if (!req.body.email)
      return next(
        new ErrorProvider(
          403,
          "fail",
          "Please type your email address to reset your password."
        )
      );

    const { email } = req.body;

    if (!validator.isEmail(email))
      return next(
        new ErrorProvider(403, "fail", "Please type a valid email address.")
      );

    const user = await User.findOne({ email });

    if (!user)
      return next(
        new ErrorProvider(404, "fail", "Not found user with that email.")
      );

    const token = await user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    try {
      await new Email(
        user,
        `${req.protovol}://${req.get("host")}/reset-password/${token}`
      ).sendResetPassword();

      res.status(200).json({
        status: "success",
        message: "The password reset link has ben sent to your email address.",
      });
    } catch (e) {
      user.passwordResetToken = undefined;
      user.passwordResetTokenExpiresIn = undefined;

      next(
        new ErrorProvider(
          500,
          "error",
          "Password reset link couldn't sent to your email address. Try again later."
        )
      );
    }
  } catch (e) {
    next(e);
  }
};

// * Resetting password
exports.resetPassword = async (req, res, next) => {
  try {
    if (!req.params.token)
      return next(
        new ErrorProvider(
          404,
          "fail",
          "Page not found or the reset link has expired."
        )
      );

    const user = await User.findOne({
      passwordResetToken: crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex"),

      passwordResetTokenExpiresIn: { $gt: Date.now() },
    });

    if (!user)
      return next(
        new ErrorProvider(
          404,
          "fail",
          "The password reset link has expired or has broken. Please try again later."
        )
      );

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;

    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;

    await user.save();

    res.clearCookie("jsonwebtoken");

    sendToken(res, 200, user, "Your password has been updated successfully.");
  } catch (e) {
    next(e);
  }
};
