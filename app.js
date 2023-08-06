const express = require("express");
const expressRateLimit = require("express-rate-limit");
const expressMongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const hpp = require("hpp");
const xss = require("xss-clean");
const errorController = require("./controllers/errorController");

const app = express();

// * Limitting API requests
const limit = expressRateLimit({
  max: 10,
  windowsMs: 60 * 60 * 1000,
  message: "Too many requests.",
  standartHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit }));

// * Security
app.use(expressMongoSanitize);
app.use(helmet());
app.use(hpp());
app.use(xss());

// * Error handling
app.use(errorController);

module.exports = app;
