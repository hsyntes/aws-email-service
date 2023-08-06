const nodemailer = require("nodemailer");
const AWS = require("../aws-config");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.from = process.env.EMAIL_FROM;
    this.to = user.email;
    this.url = url;
  }

  // * Creating transport
  createTransport() {
    if (process.env.NODE_ENV === "production")
      return nodemailer.createTransport({
        SES: { ses: new AWS.SES(), aws: AWS },
      });

    return nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: process.env.MAILTRAP_PORT,
      auth: {
        user: process.env.MAILTRAP_USERNAME,
        password: process.env.MAILTRAP_PASSWORD,
      },
    });
  }

  // * Send Email
  #send() {
    const html = pug.renderFile(`${__dirname}/../views/email.pug`);
  }
};
