exports.setup = function (Account, config) {
  var passport = require('passport');
  var LocalStrategy = require('passport-local').Strategy;

  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      Account.findOne({
        email: email.toLowerCase()
      }, function(err, account) {
        if (err) return done(err);

        if (!account) {
          return done(null, false, { message: 'This email is not registered.' });
        }
        if (!account.authenticate(password)) {
          return done(null, false, { message: 'This password is not correct.' });
        }
        return done(null, account);
      });
    }
  ));
};