# AWS Email Service with Node.js

This documentation provides a step-by-step guide to implementing AWS Email services using Node.js for your GitHub repository. AWS (Amazon Web Services) provides powerful tools and services to help you manage and send emails efficiently. In this guide, we'll demonstrate how to use AWS Simple Email Service (SES) with Node.js to send emails from your application.

## Introduction to AWS SES

Amazon Simple Email Service (SES) is a cloud-based email sending service designed to help businesses and developers send emails efficiently, reliably, and at scale. SES provides a simple and cost-effective way to send transactional, promotional, or marketing emails, and it integrates seamlessly with other AWS services.

## Prerequisites

Before you begin, ensure you have the following:

- An AWS account (https://aws.amazon.com/)
- Node.js installed (https://nodejs.org/)

## Dependencies

- Required

  `npm install aws-sdk nodemailer`

- Optional

  `npm install html-to-text pug`

## Configuration

```javascript
const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: "YOUR_ACCESS_KEY_ID",
  secretAccessKey: "YOUR_SECRET_KEY",
  region: "YOUR_AWS_REGION",
});
```

## Creating Trasport

```javascript
const transporter = nodemailer.createTransport({
  SES: new AWS.SES({ apiVersion: "2010-12-01" }),
});
```

## Sending Emails

```javascript
transporter.sendMail({
  from: "sender@example.com",
  to: "recipient@example.com",
  subject: "Hello from AWS SES",
  text: "This is a test email sent using AWS SES and Node.js",
});
```

## JavaScript OOP Approach

Just so you know, it's a very common approach for sending email in different scenerious such as welcome, reset password, expired etc.

```javascript
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

  async sendResetEmail() {
    await this.#send(
      "Reset your email",
      "We received a request to reset your email for your MyApp account. To proceed with the email reset, pelase click on the link below."
    );
  }

  async sendPaswordExpired() {
    await this.#send(
      "Your password has expired.",
      "Your password has expired and please click on the link below to set a new password."
    );
  }

  // ...
};
```

## Resources

- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [AWS SDK for JavaScript Documentation](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/index.html)

Please note that this documentation is meant to provide a basic guide to get you started with AWS Email services using Node.js. Depending on your use case and requirements, you may need to explore more advanced features and options provided by AWS SES and Nodemailer.

## 🔗 Contact

[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/hsyntes)
