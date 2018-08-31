

const FROM_EMAIL = "zbt-no-reply@mit.edu";

const sg = require('@sendgrid/mail');
sg.setApiKey(process.env.SENDGRID_API_KEY);

send = function(to, subject, body) {
  let msg = {
    to: to,
    from: FROM_EMAIL,
    subject: subject,
    text: body
  };

  if (process.env.HEROKU) {
    return sg.send(msg);
  } else {
    console.log('not sending email because we are currently in development mode');
    console.log('would have sent:', msg);
    // it's good practice to return promises
    return Promise.resolve()
  }
};


module.exports = {
  send: send
};
