const sgMail = require("@sendgrid/mail");
const EMAIL_SEND_ERROR = "Could not send email";

sgMail.setApiKey(process.env.SENDGRID_KEY);
const sendRegistrationEmail = async (link, recipient) => {
  try {
    const email = {
      to: recipient,
      from: "Hadimalikdev@gmail.com",
      subject: "Confirm Registration",
      text: `Click the following link to verify your account. This link is valid for 30 minutes only ${link}`,
    };
    await sgMail.send(email);
  } catch (error) {
    console.log(error)
    throw Error(EMAIL_SEND_ERROR);
  }
};

module.exports = { sendRegistrationEmail };
