const express = require('express');
const router = express.Router();
const Midnights = require('../../models/midnights');
const midnightsRoutes = require('./midnights');
const typesRoutes = require('./types');
const accountRoutes = require('./accounts');
const permissions = require('./permissions');


router.use("/midnight", midnightsRoutes);
router.use("/types", typesRoutes);
router.use('/accounts', accountRoutes);

// WE MAKE A CRITICAL ASSUMPTION THAT THE MIDNIGHTMAKER NEVER TRIGGERS A RACE BETWEEN
// DISTINCT OPERATIONS WITH HIMSELF
// AS A RESULT, OUR MAIN RACE CONDITION IS WITH DELETE OPERATIONS FROM RELATED OBJECTS (Zebes, etc)

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


router.use(permissions);

/**
 * GET /all/admin
 * retrieve essential admin info
 */
router.get('/all/admin', function(req, res, next) {
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


module.exports = router;
