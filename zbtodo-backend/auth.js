const router = require('express').Router();
const crypto = require('crypto');
const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const request = require('request');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Zebe = require('./models/zebe');

/* generate the keys now */
const token_secret = crypto.randomBytes(256).toString('hex');
const jwt_secret = crypto.randomBytes(256).toString('hex');

/* here's where to get the auth system */
const token_endpoint = "https://oidc.mit.edu/token";
const userinfo_endpoint = "https://oidc.mit.edu/userinfo";

const jwt_options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwt_secret
};

/*
 * Section 1: the basic login. Every request from user for information must come with
 * a token. We add a processing function that runs a simple auth check for the token
 * validity, and use the processing function for some of the endpoints.
 */

// the strategy gets called on any request that requires the auth filter
const jwt_strategy = new JwtStrategy(jwt_options, function(payload, done) {
  /* a strategy returns either an error, or a truthy object representing the user upon successful login */
  /* read the token's payload */
  if (payload.sub) {
    Zebe.findById(payload.sub, function(err, zebe) {
      if (err) {
        /* bugs */
        done(err);
      }
      if (!zebe) {
        /* no zebe exists for the user */
        done(null, false)
      } else {
        /* zebe exists, return him */
        done(null, zebe)
      }
    })
  } else {
    done("Invalid token", false);
  }
});

passport.use('jwt', jwt_strategy);
// this export is a function that implements the token-check before passing the request along
module.exports.requireAuthentication = passport.authenticate('jwt', {session: false});


/*
 * LOGIN PROCESS (separate backend routes)
 * order of operations:
  * hit initiate: get a state val and nonce. backend ensures integrity by sending a hash of the state+nonce
  * user/frontend should now go to the mit auth site, and present this information
  * after login, the mit auth site will redirect user back to frontend preserving state and nonce, with additional authorization code
  * backend login: confirming that the state and nonce are good by checking the hash to ensure that no one messed with
  *                those, then validate the authentication with MIT by presenting the auth code. once mit verifies,
 */

router.get("/initiate", function(req, res) {
  const hmac = crypto.createHmac("sha256", token_secret);
  const state_val = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');
  hmac.update(state_val + nonce);
  res.send({
    state: state_val,
    nonce: nonce,
    mac: hmac.digest('hex')
  })
});

router.post("/login", function(req, res) {
  if (!req.body || !req.body.state || !req.body.nonce) {
    res.sendStatus(400);
  } else {
    const hmac = crypto.createHmac("sha256", token_secret);
    hmac.update(req.body.state + req.body.nonce);
    const mac = hmac.digest('hex');
    /* first check the hash */
    if (req.body.mac !== mac) {
      res.status(401).send("Unauthorized")
    } else {
      // time to fetch the authentication information
      let options = {
        url: token_endpoint,
        method: "POST",
        headers: {
          'Authorization': "Basic " + new Buffer(process.env.OIDC_ID + ":" + process.env.OIDC_SECRET).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        form: {
          code: req.body.code,
          grant_type: "authorization_code",
          redirect_uri: req.body.redirect_uri
        }
      };
      request(options, function (err, resp, body) { // now fire the request, and then
        if ((!err && resp.statusCode === 200) || !process.env.HEROKU) {
          let body_obj = JSON.parse(body);
          if (!process.env.HEROKU) {
            body_obj = {};
            body_obj.access_token = "token"
          }
          // MIT verified this, let's get the userinfo
          request({
            url: userinfo_endpoint,
            method: "GET",
            headers: {
              "Authorization": "Bearer " + body_obj.access_token
            }
          }, function (err2, resp2, body2) { // callback after sending request for user info
            if ((!err2 && resp2.statusCode === 200) || !process.env.HEROKU) {
              // we've now got the able to get the user information
              let user_data = JSON.parse(body2);
              if (!process.env.HEROKU) {
                user_data = {};
                user_data.sub = mongoose.Types.ObjectId();
                user_data.preferred_username = "developer";
                user_data.name = "Rick Rick";
                user_data.email = "developer@donot.email";
                user_data.phone = "5555555555"
              }
              // either update the user info based on MIT's info, or create a user if need be
              Zebe.findByIdAndUpdate(user_data.sub, {
                $set: {
                  kerberos: user_data.preferred_username,
                  name: user_data.name,
                },
                $setOnInsert: {
                  email: user_data.email,
                  phone: user_data.phone
                }
              }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
                runValidators: true,
                lean: false
              }).exec().then(function (zebe) {
                // we're done, give the user a token verifying this entire handshake process
                res.json({
                  zebe: zebe,
                  token: jwt.sign({
                    sub: user_data.sub
                  }, jwt_secret, { expiresIn: "30m"})
                })
              }).catch(err => {
                console.log(err);
                res.sendStatus(401);
              });
            } else {
              res.sendStatus(401);
            }
          })
        } else {
          console.log(err, resp.statusCode);
          res.sendStatus(500);
        }
      });
    }
  }
});

// refresh the token
function refresh(req, res, next) {
  req.refreshed_token = jwt.sign({sub: req.user._id}, jwt_secret, { expiresIn: "30m"});
  next();
}


module.exports.routes = router;
module.exports.withRefresh = refresh;