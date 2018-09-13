const midnightPermissions = function(req, res, next) {
  if (req.user.midnight_maker) {
    next();
  } else {
    res.sendStatus(403);
  }
};

module.exports = midnightPermissions;