const nodemailer = require("nodemailer");
const EMAIL_FORMAIL = "info@legacyx.uk";
const EMAILPASSWORD_FORMAIL = "Legacy-140399";
const transport = nodemailer.createTransport({
  host: "smtpout.secureserver.net",
  port: 587,
  // secure: true,
  auth: {
    user: EMAIL_FORMAIL,
    pass: EMAILPASSWORD_FORMAIL,
  },
});

const sendMail = async (
  to,
  subject,
  text,
  from = '"LegacyX" <info@legacyx.uk>'
) => {
  try {
    let verified = await transport.verify();

    if (verified) {
      let mailOptions = {
        from,
        to,
        subject,
        text,
      };

      return transport.sendMail(mailOptions);
    }
  } catch (e) {
    console.log("Error Message :: ", e);
  }
};

module.exports = { sendMail };
