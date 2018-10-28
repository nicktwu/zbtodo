const midnightPermissions = function(req, res, next) {
  if (req.user.midnight_maker || req.user.house_chair) {
    next();
  } else {
    res.sendStatus(403);
  }
};

module.exports = midnightPermissions;