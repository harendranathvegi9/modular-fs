exports.setup = function (Account, Strategy, config, provider) {
  var passport = require('passport');

  passport.use(new Strategy(
    config[provider],
    Account.findOrSave.bind(Account, provider) 
  ));
};