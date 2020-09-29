import nodemailer from "nodemailer";

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, html: string) {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  // let testAccount = await nodemailer.createTestAccount();
  // console.log("test account: ", testAccount);

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "lqiyc5k7jzhm72il@ethereal.email",
      pass: "C4qPxk3FhC3xH1GNuD",
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Microblog Support" <support@microblog.com>', // sender address
    to, // list of receivers
    subject: "Reset password", // Subject line
    html,
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
