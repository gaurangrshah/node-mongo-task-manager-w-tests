const sgMail = require('@sendgrid/mail')

// provide api key
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// Send welcome email:
const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'gaurang.r.shah@mead.io',
    subject: "Thanks for joining in!",
    text: `Welcome to the app, ${name}. Let us know if you have any questions!`,
    html: '',
  })
}

// Send Cancel email:
const sendCancelEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: 'greg@gshah.dev',
    subject: "Sorry to see you go!",
    text: `Hey, ${name}.We're so sorry to see you go, can you please tell us what we can do differently to help customers like you in the future? Thank you`,
    html: '',
  })
}

module.exports = {
  sendWelcomeEmail,
  sendCancelEmail
}
