

const FROM_EMAIL = "zbt-no-reply@mit.edu";

const sg = require('@sendgrid/mail');
if (process.env.HEROKU) {
  sg.setApiKey(process.env.SENDGRID_API_KEY);
}

send = function(to, subject, body) {
  let msg = {
    to: to,
    from: FROM_EMAIL,
    subject: subject,
    html: body
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

const blastResidents = function(subj, body) {
  return send("zbt-residents@mit.edu", subj, body)
};

const blastCurrent = function(subj, body) {
  return send("zbt-current@mit.edu", subj, body)
};

const notifyMidnightsGenerated = () => {
  return blastResidents(
    "[ZBTodo] Midnights Assigned",
    "Midnights for this week have been assigned. View them in <a href='https://zbt.mit.edu/todo'>ZBTodo</a>.")
};


module.exports = {
  send,
  notifyMidnightsGenerated,
  blastResidents,
  blastCurrent
};
