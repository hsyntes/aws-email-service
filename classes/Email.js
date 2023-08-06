const nodemailer = require("nodemailer");
const AWS = require("../aws-config");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
    this.from = process.env.EMAIL_FROM;
    this.to = user.email;
    this.firstname = user.firstname;
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
  async #send(subject, text) {
    const html = pug.renderFile(`${__dirname}/../views/email.pug`, {
      subject,
      firstname: this.firstname,
      text,
      url: this.url,
    });

    await this.createTransport().sendMail({
      from: `Huseyin Ates <${process.env.EMAIL_FROM}>`,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    });
  }

  async sendWelcome() {
    await this.#send("Wellcome to InstaMERN", "We're glad to have you! 🥳");
  }

  async sendResetPassword() {
    await this.#send(
      "Reset your password",
      "We received a request to reset your password for your InstaMERN account. To proceed with the password reset, please click on the link below."
    );
  }

  async sendResetEmail() {
    await this.#send(
      "Reset your email",
      "We received a request to reset your email for your InstaMERN account. To proceed with the email reset, pelase click on the lonk below."
    );
  }
};
