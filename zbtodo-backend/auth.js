const router = require('express').Router();
const crypto = require('crypto');
const passport = require('passport');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const JwtStrategy = require('passport-jwt').Strategy;
const request = require('request');
const jwt = require('jsonwebtoken');

const Zebe = require('./models/zebe');

const token_secret = crypto.randomBytes(256).toString('hex');
const jwt_secret = crypto.randomBytes(256).toString('hex');

const token_endpoint = "https://oidc.mit.edu/token";
const userinfo_endpoint = "https://oidc.mit.edu/userinfo";

const jwt_options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwt_secret
};

const jwt_strategy = new JwtStrategy(jwt_options, function(payload, done) {
  if (payload.sub) {
    Zebe.findById(payload.sub, function(err, zebe) {
      if (err) {
        done(err);
      }
      if (!zebe) {
        done(null, false)
      } else {
        done(null, zebe)
      }
    })
  } else {
    done("Invalid token", false);
  }
});

passport.use('jwt', jwt_strategy);

router.get("/initiate", function(req, res) {
  const hmac = crypto.createHmac("sha256", token_secret);
  const state_val = crypto.randomBytes(16).toString('hex');
  const nonce = crypto.randomBytes(16).toString('hex');
  hmac.update(state_val + nonce);
  req.session.state = state_val;
  req.session.nonce = nonce;
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
      request(options, function (err, resp, body) {
        if (!err && resp.statusCode === 200) {
          let body_obj = JSON.parse(body);
          // authentication looked okay, let's get the userinfo
          request({
            url: userinfo_endpoint,
            method: "GET",
            headers: {
              "Authorization": "Bearer " + body_obj.access_token
            }
          }, function (err2, resp2, body2) {
            if (!err2 && resp2.statusCode === 200) {
              // able to get the user information
              let user_data = JSON.parse(body2);
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
              }).exec().catch(err => console.log(err)).then(function (zebe) {
                res.json({
                  zebe: zebe,
                  token: jwt.sign({
                    sub: user_data.sub
                  }, jwt_secret, { expiresIn: "30m"})
                })
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

function refresh(req, res, next) {
  req.refreshed_token = jwt.sign({sub: req.user._id}, jwt_secret, { expiresIn: "30m"});
  next();
}

module.exports.routes = router;
module.exports.requireAuthentication = passport.authenticate('jwt', {session: false});
module.exports.withRefresh = refresh;