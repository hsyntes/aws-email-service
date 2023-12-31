const nodemailer = require("nodemailer");
const AWS = require("../aws-config");
const pug = require("pug");
const { htmlToText } = require("html-to-text");

module.exports = class Email {
  constructor(user, url) {
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
        pass: process.env.MAILTRAP_PASSWORD,
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
      from: `Huseyin Ates <${process.env.EMAIL}>`,
      to: this.to,
      subject,
      html,
      text: htmlToText(html),
    });
  }

  async sendWelcome() {
    await this.#send("Wellcome to MyApp", "We're glad to have you! 🥳");
  }

  async sendResetPassword() {
    await this.#send(
      "Reset your password",
      "We received a request to reset your password for your MyApp account. To proceed with the password reset, please click on the link below."
    );
  }
};
