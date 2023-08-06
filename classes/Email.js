const nodemailer = require("nodemailer");
const AWS = require("../aws-config");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.from = process.env.EMAIL_FROM;
    this.to = user.email;
    this.url = url;
  }
};
