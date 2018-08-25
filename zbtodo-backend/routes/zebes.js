const express = require('express');
const router = express.Router();
const Zebe = require('../models/zebe');
const emailValidator = require('email-validator');

const editPermissions = function(req, res, next) {
  if (req.user.tech_chair || req.user.president || req.user.rush_chair) {
    next()
  } else {
    res.sendStatus(401);
  }
};


/* GET current zebe listing. */
router.get('/current', function(req, res) {
  Zebe.find({ zebe: true, current: true }).select("name kerberos email phone").exec(function(err, docs) {
    if (err) {
      res.sendStatus(500);
    } else {
      res.json({ zebes: docs, token: req.refreshed_token })
    }
  });
});

router.put('/update_current', function(req, res) {
  if (req.body // must have valid body
    && (!req.body.phone || /^\d+$/.test(req.body.phone)) // must have a numeric phone number
    && (!req.body.email || emailValidator.validate(req.body.email)) // must have a valid email
  ) {
    let setObj = {};
    setObj.phone = req.body.phone ? req.body.phone : "";
    setObj.email = req.body.email ? req.body.email : "";
    Zebe.findByIdAndUpdate(req.user._id, {$set: setObj}, {runValidators: true, new: true, lean: false}).exec().then((doc) => {
      res.json({ token: req.refreshed_token, user: doc });
    }).catch(() => {res.sendStatus(500)});
  } else {
    // on or more of our checks failed, the request was bad
    res.sendStatus(400);
  }
});

router.get('/admin', editPermissions, function(req, res) {
  let responseObj = {token: req.refreshed_token};
  Zebe.find({zebe: false}).exec().then((potentialDocs) => {
    responseObj.potential = potentialDocs;
    return Zebe.find({zebe: true, current: true}).exec()
  }).then((currentZebes) => {
    responseObj.current = currentZebes;
    return Zebe.find({zebe: true, current: false}).exec()
  }).then((inactiveZebes) => {
    responseObj.inactive = inactiveZebes;
    res.json(responseObj);
  }).catch(err => {
    if (err) {
      res.sendStatus(500)
    }
  })
});

// validate zebes
router.post("/validate", editPermissions, function(req, res) {
  let responseObj = {token: req.refreshed_token};
  if (req.body && req.body.validated && req.body.validated.length > 0) {
    Zebe.update(
      {_id: {$in: req.body.validated}},
      {$set: {zebe: true, current: true}},
      {multi: true, runValidators: true}
      ).exec().then(() => {
        return Zebe.find({zebe: false}).exec()
      }).then((zebes) => {
        responseObj.potential = zebes;
        return Zebe.find({zebe: true, current: true}).exec()
      }).then((currentZebes) => {
        responseObj.current = currentZebes;
        res.json(responseObj);
      }).catch(err => {
        if (err) {
          res.sendStatus(500)
        }
    })
  } else {
    res.sendStatus(400);
  }
});

// deactivate zebes
router.post("/deactivate", editPermissions, function(req, res) {
  let responseObj = {token: req.refreshed_token};
  if (req.body && req.body.deactivated && req.body.deactivated.length > 0) {
    Zebe.update(
      {_id: {$in: req.body.deactivated}},
      {$set: {current: false}},
      {multi: true, runValidators: true})
      .exec()
      .then(() => {
        return Zebe.find({zebe: false}).exec()
      }).then((zebes) => {
      responseObj.potential = zebes;
      return Zebe.find({zebe: true, current: true}).exec()
    }).then((currentZebes) => {
      responseObj.current = currentZebes;
      return Zebe.find({zebe: true, current: false}).exec()
    }).then((inactiveZebes) => {
      responseObj.inactive = inactiveZebes;
      res.json(responseObj);
    }).catch(err => {
      if (err) {
        res.sendStatus(500)
      }
    })
  } else {
    res.sendStatus(400);
  }
});

// reactivate
router.post("/reactivate", editPermissions, function(req, res) {
  let responseObj = {token: req.refreshed_token};
  if (req.body && req.body.reactivated && req.body.reactivated.length > 0) {
    Zebe.update(
      {_id: {$in: req.body.reactivated}},
      {$set: {current: true}},
      {multi: true, runValidators: true})
      .exec()
      .then(() => {
        return Zebe.find({zebe: false}).exec()
      }).then((zebes) => {
      responseObj.potential = zebes;
      return Zebe.find({zebe: true, current: true}).exec()
    }).then((currentZebes) => {
      responseObj.current = currentZebes;
      return Zebe.find({zebe: true, current: false}).exec()
    }).then((inactiveZebes) => {
      responseObj.inactive = inactiveZebes;
      res.json(responseObj);
    }).catch(err => {
      if (err) {
        res.sendStatus(500)
      }
    })
  } else {
    res.sendStatus(400);
  }
});

// delete zebes
router.post("/delete", editPermissions, function(req, res) {
  let responseObj = {token: req.refreshed_token};
  if (req.body && req.body.deleted && req.body.deleted.length > 0) {
    Zebe.deleteMany(
      {_id: {$in: req.body.deleted}})
      .exec()
      .then(() => {
        return Zebe.find({zebe: false}).exec()
      }).then((zebes) => {
      responseObj.potential = zebes;
      return Zebe.find({zebe: true, current: false}).exec()
    }).then((inactiveZebes) => {
      responseObj.inactive = inactiveZebes;
      res.json(responseObj);
    }).catch(err => {
      if (err) {
        res.sendStatus(500)
      }
    })
  } else {
    res.sendStatus(400);
  }
});

router.put("/permissions", editPermissions, function(req, res) {
  let responseObj = {token: req.refreshed_token};
  if (req.body && req.body.id && req.body.permissions) {
    Zebe.findByIdAndUpdate(req.body.id,
      {$set: req.body.permissions}, {runValidators: true, new: true, lean: false})
      .exec()
      .then(() => {
        return Zebe.find({zebe: true, current: true}).exec()
      }).then((zebes) => {
      responseObj.current = zebes;
      res.json(responseObj);
    }).catch(err => {
      if (err) {
        res.sendStatus(500)
      }
    })
  } else {
    res.sendStatus(400);
  }
});

module.exports = router;
