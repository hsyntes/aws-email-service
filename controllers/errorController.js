const ErrorProvider = require("../classes/ErrorProvider");
const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");

// ! 409: Duplicate error
const uniqueError = (err) => {
  if (
    err.keyPattern.hasOwnProperty("username") ||
    err.keyPattern.hasOwnProperty("email")
  )
    return new ErrorProvider(409, "fail", "That user already exists.");

  return new ErrorProvider(409, "fail", err.message);
};

// ! Validation Error
const validationError = (err) => {
  const messages = err.message.split(",");

  const message = messages
    .map((message, index) => message.split(":").at(index === 0 ? 2 : 1))
    .join("")
    .trim();

  return new ErrorProvider(403, "fail", message);
};

const jsonWebTokenError = () =>
  new ErrorProvider(401, "fail", "Authentication failed. Please log in.");

const tokenExpiredError = () =>
  new ErrorProvider(
    401,
    "fail",
    "Authorization has expired. Please log in again."
  );

module.exports = async (err, req, res, next) => {
  // res.status(500).json({
  //   err,
  // });

  if (process.env.NODE_ENV === "production") {
    if (err.code === 11000) err = uniqueError(err);
    if (err.name === "ValidationError") err = validationError(err);
    if (err instanceof JsonWebTokenError) err = jsonWebTokenError();
    if (err instanceof TokenExpiredError) err = tokenExpiredError();
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });

  next();
};
