exports.setup = function (Account, config) {
  var passport = require('passport');
  var FacebookStrategy = require('passport-facebook').Strategy;

  passport.use(new FacebookStrategy(
    config.facebook,
    Account.findOrSave.bind(Account, 'facebook') 
  ));
};