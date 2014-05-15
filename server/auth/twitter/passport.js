exports.setup = function (Account, config) {
  var passport = require('passport');
  var TwitterStrategy = require('passport-twitter').Strategy;

  passport.use(new TwitterStrategy(
    config.twitter,
    Account.findOrSave.bind(Account, 'twitter')
  ));
};