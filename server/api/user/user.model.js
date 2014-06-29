'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var bases = require('bases');
var _ = require('lodash');

var authTypes = ['github', 'twitter', 'facebook', 'google'];

var reliableProvider = ['github', 'facebook', 'google'];

function randomStr(length) {
    // We generate a random number in a space at least as big as 62^length,
    // and if it's too big, we just retry. This is still statistically O(1)
    // since repeated probabilities less than one converge to zero. Hat-tip to
    // a Google interview for teaching me this technique! ;)
 
    // The native randomBytes() returns an array of bytes, each of which is
    // effectively a base-256 integer. We derive the number of bytes to
    // generate based on that, but note that it can overflow after ~150:
    var maxNum = Math.pow(62, length);
    var numBytes = Math.ceil(Math.log(maxNum) / Math.log(256));

    if (numBytes === Infinity) {
        throw new Error('Length too large; caused overflow: ' + length);
    }
 
    do {
        var bytes = crypto.randomBytes(numBytes);
        var num = 0
        for (var i = 0; i < bytes.length; i++) {
            num += Math.pow(256, i) * bytes[i];
        }
    } while (num >= maxNum);
 
    return bases.toBase62(num);
};

var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  confirmedMail : { type: Boolean, default: false },
  mailConfirmationCode : {type: String},
  role: {
    type: String,
    default: 'user'
  },
  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {},
  twitter: {},
  github: {},
  google: {}
});

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Public profile information
UserSchema
  .virtual('profile')
  .get(function() {
    return {
      'name': this.name,
      'role': this.role,
      'confirmedMail' : this.confirmedMail
    };
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (reliableProvider.indexOf(this.provider) !== -1) 
    {
      this.confirmedMail = true;
    } else 
    {
      this.mailConfirmationCode = randomStr(16);
    }
    

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });



/**
 * Static methods
 */

UserSchema.static('findByProfileOrCreate',
  _.curry(function(provider, profile, done) {
      var User = mongoose.model('User');
      var query = {'provider': provider};
      query[provider+'.id'] = profile.id;

      User.findOne(query, function(err, user) {
            if (err) {
              return done(err);
            }
            if (!user) {
              console.log('create new user');
              var userConfig = {
                name: profile.displayName,
                email: profile.emails[0].value,
                emailChecked : profile.emails[0].value ? true : false,
                role: 'user',
                username: profile.username,
                provider : provider
              };
              userConfig[provider] = profile._json;
              console.log(userConfig);
              user = new User(userConfig);
              user.save(function(err) {
                if (err) done(err);
                return done(err, user);
              });
            } else {
              console.log('existing user: '+user);
              return done(err, user);
            }
          })
    })
    );


/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  }
};

module.exports = mongoose.model('User', UserSchema);
