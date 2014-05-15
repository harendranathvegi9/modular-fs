exports.setup = function (Account, config) {
  var passport = require('passport');
  var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

  passport.use(new GoogleStrategy(
    config.google,
    function(accessToken, refreshToken, profile, done) {
      Account.findOne({
        'provider': 'google',
        'socialId': profile.id
      }, 
      function(err, account) {
        if (!account) {
          account = new Account({
            role: 'user',
            provider: 'google',
            socialId: profile.id,
            google: profile._json
          });
          account.save(function(err) {
            if (err) done(err);
            return done(err, account);
          });
        } else {
          return done(err, account);
        }
      });
    }
  ));
};