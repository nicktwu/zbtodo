const express = require('express');
const router = express.Router();
const emailer = require('../emailer');
const Semester = require('../models/semester');
const Midnights = require('../models/midnights');
const moment = require('moment');

/**
 * GET /all/user
 * retrieve essential user midnight data
 */
router.get('/all/user', function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  Midnights.MidnightType.getCurrent().then(docs => {
    resObj.types = docs;
    return Midnights.Midnight.getWeek()
  }).then(midnights => {
    resObj.midnights = midnights;
    return Midnights.MidnightAccount.getCurrent()
  }).then(accounts => {
    resObj.accounts = accounts;
    res.json(resObj);
  }).catch(next);
});

const midnightPermissions = function(req, res, next) {
  if (req.user.midnight_maker) {
    next();
  } else {
    res.sendStatus(403);
  }
};

/**
 * GET /all/admin
 * retrieve essential admin info
 */
router.get('/all/admin', midnightPermissions, function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  Midnights.MidnightType.getCurrent().then(docs => {
    resObj.types = docs;
    return Midnights.Midnight.getWeek();
  }).then(midnights => {
    resObj.midnights = midnights;
    return Midnights.MidnightAccount.getCurrent();
  }).then(accounts => {
    resObj.accounts = accounts;
    return Midnights.MidnightAccount.getPotential();
  }).then(potentials => {
    resObj.potential = potentials;
    return Midnights.Midnight.getUnreviewed();
  }).then(unreviewed => {
    resObj.unreviewed = unreviewed;
    res.json(resObj);
  }).catch(next);
});

/**
 * POST /midnights/types/create
 * create new midnight from body
 */
router.post('/types/create', midnightPermissions, function(req, res, next) {
  let resObj = {token: req.refreshed_token};
  if (
    req.body // must have content
    && req.body.name // must have a name
    && req.body.value // must have a value
    && req.body.value > 0 // must have a positive value
    && req.body.description // must have a description
  ) {
    Semester.getCurrent().then(currentSem => {
      let newType = {name: req.body.name, value: req.body.value, description: req.body.description};
      if (currentSem) {
        newType.semester = currentSem._id;
      }
      return Midnights.MidnightType.create(newType)
    }).then(() => {
      return Midnights.MidnightType.getCurrent()
    }).then((docs) => {
      resObj.types = docs;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

/**
 * PUT /midnights/types/update/<:id>
 * update the midnight type with the body
 */
router.put('/types/update/:id', midnightPermissions, function(req, res, next) {
  if (
    req.body // must have content
    && req.body.name // must have a name
    && req.body.value // must have a value
    && req.body.value > 0 // must have a positive value
    && req.body.description // must have a description
  ) {
    let resObj = {token: req.refreshed_token};
    Midnights.MidnightType.findByIdAndUpdate(req.params.id, req.body).exec().then(() => {
      return Midnights.MidnightType.getCurrent()
    }).then(docs => {
      resObj.types = docs;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});


/**
 * POST /midnights/types/delete
 * requires body with attribute deleted, containing a list of ids
 */
router.post('/types/delete', midnightPermissions, function(req, res, next) {
  if (req.body && req.body.deleted && req.body.deleted.length > 0) {
    let resObj = {token: req.refreshed_token};
    Midnights.MidnightType.deleteMany({_id: {$in: req.body.deleted}}).exec().then(() => {
      // delete the respective midnights of that type as well
      return Midnights.Midnight.deleteMany({ task : {$in : req.body.deleted}}).exec()
    }).then(() => {
      return Midnights.MidnightType.getCurrent()
    }).then(docs => {
      resObj.types = docs;
      return Midnights.Midnight.getWeek(new Date(req.body.weekDate))
    }).then(midnights => {
      resObj.midnights = midnights;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /midnight/create POST
router.post('/midnight/create', midnightPermissions, function(req, res, next) {
  if (req.body
    && req.body.date // must have date field
    && new Date(req.body.date) // must have valid date
    && req.body.task // must have some task id
    && req.body.account
    && req.body.potential
    && req.body.potential > 0 // positive number of potential points
  ) {
    console.log(req.body.date);
    let resObj = {token: req.refreshed_token};
    Midnights.Midnight.create({
      date: req.body.date,
      task: req.body.task,
      account: req.body.account,
      potential: req.body.potential
    }).then(() => {
      return Midnights.Midnight.getWeek(new Date(req.body.weekDate))
    }).then(midnights => {
      resObj.midnights = midnights;
      return Midnights.Midnight.getUnreviewed()
    }).then(unreviewed => {
      resObj.unreviewed = unreviewed;
      res.json(resObj);
    }).catch(next)
  } else {
    res.sendStatus(400);
  }
});

// /midnight/update/<int:id> PUT
router.put('/midnight/update/:id', midnightPermissions, function(req, res, next) {
  if (req.body
    && req.body.date // must have date field
    && new Date(req.body.date) // must have valid date
    && req.body.task // must have some task id
    && req.body.account
    && req.body.potential
    && req.body.potential > 0 // positive number of potential points
  ) {
    Midnights.Midnight.findByIdAndUpdate(
      req.params.id,
      { $set: { date: req.body.date, task: req.body.task, account: req.body.account, potential: req.body.potential } },
      {runValidators: true, new: true, lean: false}
    ).exec().then(() => {
      return Midnights.Midnight.getWeek(new Date(req.body.weekDate))
    }).then(midnights => {
      res.json({midnights: midnights, token: req.refreshed_token})
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /midnight/delete POST
router.post('/midnight/delete', midnightPermissions, function(req, res, next) {
  if (req.body && req.body.deleted && req.body.deleted.length > 0) {
    let resObj = {token: req.refreshed_token};
    Midnights.Midnight.deleteMany({_id: {$in: req.body.deleted}}).exec().then(() => {
      return Midnights.Midnight.getWeek(new Date(req.body.weekDate))
    }).then(docs => {
      resObj.midnights = docs;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /midnight/award/<int:id> PUT
router.post('/midnight/award/:id', midnightPermissions, function(req, res, next) {
  if (req.body
    && req.body.hasOwnProperty("awarded") // must have date field
  ) {
    let resObj = {token: req.refreshed_token};
    Midnights.Midnight.findByIdAndUpdate(req.params.id, {
      $set: { awarded : req.body.awarded, feedback: req.body.feedback || "", reviewed: true }
    }, {runValidators: true, new: true, lean: false}).exec().then((newMidnight) => {
      // updated the midnight, update the respective points
      return Midnights.MidnightAccount.findByIdAndUpdate(newMidnight.account, {
       $inc: {balance: newMidnight.awarded}
      }, {runValidators: true, new: true, lean: false})
    }).then(() => {
      return Midnights.Midnight.getWeek(new Date(req.body.weekDate))
    }).then(midnights => {
      resObj.midnights = midnights;
      return Midnights.Midnight.getUnreviewed();
    }).then(unreviewed => {
      resObj.unreviewed = unreviewed;
      return Midnights.MidnightAccount.getCurrent();
    }).then(accounts => {
      resObj.accounts = accounts;
      res.json(resObj)
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

router.post('/midnight/week', function(req, res, next) {
  if (req.body && req.body.date) {
    let resObj = {token: req.refreshed_token};
    Midnights.Midnight.getWeek(new Date(req.body.date)).then(midnights => {
      resObj.midnights=midnights;
      res.json(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /accounts/create POST
router.post('/accounts/create', midnightPermissions, function(req, res, next){
  let resObj = {token: req.refreshed_token};
  if (
    req.body // must have content
    && req.body.zebes // must have zebes
    && req.body.zebes.length // must have > 1 to create
  ) {
    Semester.getCurrent().then(semester => {
      let accs = req.body.zebes.map(zebe => ({ zebe: zebe, semester: semester._id}));
      return Midnights.MidnightAccount.create(accs)
    }).then(() => {
      return Midnights.MidnightAccount.getCurrent()
    }).then((docs) => {
      resObj.accounts = docs;
      return Midnights.MidnightAccount.getPotential()
    }).then(potentials => {
      resObj.potential = potentials;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /accounts/update/<int:id> PUT
router.put('/accounts/update/:id', midnightPermissions, function(req, res, next) {
  if (
    req.body // must have content
    && req.body.zebe // must have zebe
  ) {
    let resObj = {token: req.refreshed_token};
    Midnights.MidnightAccount.findByIdAndUpdate(req.params.id, {
      balance: req.body.balance || 0,
      requirement: req.body.requirement || 0
    }, {runValidators: true, new: true, lean: false}).then(() => {
      return Midnights.MidnightAccount.getCurrent()
    }).then((docs) => {
      resObj.accounts = docs;
      res.json(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// /accounts/delete POST
router.post('/accounts/delete', midnightPermissions, function(req, res, next) {
  if (req.body && req.body.deleted && req.body.deleted.length > 0) {
    let resObj = {token: req.refreshed_token};
    Midnights.MidnightAccount.deleteMany({_id: {$in: req.body.deleted}}).exec().then(() => {
      return Midnights.Midnight.deleteMany({account: {$in: req.body.deleted}}).exec();
    }).then(() => {
      return Midnights.MidnightAccount.getCurrent()
    }).then(docs => {
      resObj.accounts = docs;
      return Midnights.Midnight.getWeek(new Date(req.body.weekDate));
    }).then(midnights => {
      resObj.midnights = midnights;
      res.send(resObj);
    }).catch(next);
  } else {
    res.sendStatus(400);
  }
});

// ABOVE THESE ARE USED BELOW ARE NOT

// /midnights/weeklist GET
router.get('/weeklist', function(req, res, next) {
  let today = new Date();
  let firstDay = new Date(today.getFullYear(), today.getMonth(),today.getDate() - today.getDay()); //sets to midnight sunday, all sunday midnights included
  let lastDay = new Date(firstDay.getFullYear(), firstDay.getMonth(), firstDay.getDate() + 7); //sets to midnight Sunday, all saturday midnights are included
  Midnights.Midnight.find( { date: { $gte: firstDay, $lte: lastDay } }, function(err, assignments) {
    if (err) return next(err);
    return res.json(assignments);
  });
});

// /midnights/accounts GET
router.get('/accounts', function(req, res, next) {
  Semester.getCurrent( function(err, cur) {
    if (err) return next(err); // more than one current semester
    Midnights.MidnightAccount.find({ semester: cur.name }, function(err, accounts) {
      if (err) return next(err); // no accounts??
      return res.json(accounts);
    });
  });
});

// /midnights/types GET
router.get('/types', function(req, res, next) {
  Midnights.MidnightType.find({}, function(err, types) {
    if (err) return next(err);
    return res.json(types);
  });
});

// /midnights/all GET

router.get('/all', function(req, res, next) {
  Midnights.Midnight.find({}, function(err, assignments) {
    if (err) return next(err);
    return res.json(assignments);
  })
});



// /midnights/reviewed GET
router.get('/reviewed', function(req, res, next) {
  let today = new Date();
  let lastDay = new Date(today.getFullYear(), today.getMonth(),today.getDate());
  let firstDay = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate() - 7);
  Midnights.Midnight.find( {
    $and: [{reviewed: true},{ date: { $gte: firstDay, $lte: lastDay } }]
  }, function(err, assignments) {
    if (err) return next(err);
    return res.json(assignments);
  });
});

// /midnights/bulk_create POST
router.post('/bulk_create', midnightPermissions, function(req, res, next) {
  let ms = req.body.midnights;
  console.log(req);
  Midnights.Midnight.insertMany(ms, function (err, docs) {
    if (err) return next(err);
    emailer.send("zbt-residents@mit.edu", "[ZBTodo] New Midnights Posted", "View them now at https://zbt.scripts.mit.edu/todo");
    return res.json({stored: docs.length});
  })
});

router.put('/award', midnightPermissions, function(req, res, next) {
  Midnights.Midnight.findOneAndUpdate({
    $and: [
      {_id: req.body._id},
      {$or: [{reviewed: {$exists: false}}, {reviewed: false}]}
    ]
  }, {
    awarded: req.body.awarded,
    reviewed: true
  }, function (err, resp) {
    if (err) return next(err);
    Midnights.MidnightAccount.findOneAndUpdate({zebe: resp.zebe}, {$inc: {balance: req.body.awarded}}, function (err, acc) {
      if (err) return next(err);
      return res.json(acc);
    })
  })
});

// /midnights/:id GET
router.get('/:id', function(req, res, next) {
  Midnights.Midnight.findById(req.params.id, function(err, midnight) {
    if (err) return next(err);
    return res.json(midnight);
  });
});



module.exports = router;
