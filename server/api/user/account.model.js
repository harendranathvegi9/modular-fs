'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var _ = require('lodash');
var User = require('./user.model');

var authTypes = ['github', 'twitter', 'facebook', 'google'];

var AccountSchema = new Schema({
  email: { type: String, lowercase: true },
  hashedPassword: String,
  provider: String,
  salt: String,
  socialId: String,
  profile: {},
  user : {type: Schema.Types.ObjectId, ref: 'User' }
});

/**
 * Virtuals
 */
AccountSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });



// Non-sensitive info we'll be putting in the token
AccountSchema
  .virtual('token')
  .get(function() {
    console.log(this.user.role);
    return {
      '_id': this._id,
      'role': this.user.role
    };
  });

/**
 * Validations
 */

// Validate empty email
AccountSchema
  .path('email')
  .validate(function(email) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
AccountSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    // if you are authenticating by any of the oauth strategies, don't validate
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
AccountSchema
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
AccountSchema
  .pre('save', function(next) {

    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

AccountSchema
  .pre('save', function(next) {
    var self = this;

    if (!self.user) {
      if (self.provider === 'twitter') {
        self.createAndAddUser(next);
      }
      else {
        User.findOne({
          email: self.profile.email
          },
          function(err, user) {
            if (!user) 
              self.createAndAddUser(next);       
            else
              self.addUser(user,next);
          }
        );
      }
    }
    else next();
    
});

/**
 * FindOrSave - check if an account already exist and if not create one
 *
 * @param {String} provider
 * @param {String} accessToken
 * @param {String} refreshToken
 * @param {Json} profile
 * @return {Done}
 * @api public
 */
AccountSchema.static('findOrCreate',
  _.curry(function(provider, accessToken, refreshToken, profile, done) {
      var Account = mongoose.model('Account');
      Account.findOne({
        'provider': provider,
        'socialId': profile.id
      }, 
      function(err, account) {
        if (err) {
          return done(err);
        }
        if (!account) {
            account = new Account({
            role: 'user',
            provider: provider,
            socialId: profile.id,
            profile: profile._json
          });
          account.save(function(err) {
            if (err) done(err);
            return done(err, account);
          });
        } else {
          return done(err, account);
        }
      })
    })
    );


/**
 * Methods
 */
AccountSchema.methods = {
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
  },


  /**
   * Create and add user from the profile
   *
   * @param {Function} next
   * @return {next}
   * @api public
   */
  createAndAddUser: function(next){
    var self = this;
    var user = new User({
          name: self.profile.name,
          email: self.profile.email||'',
          role: self.profile.role||'',
          accounts : [self._id]
        });
    user.save(function(err){
          if (err) console.log(err);
          self.user = user._id;
          return next();
    });
  },

  /**
   * Add user from the profile
   *
   * @param {Json} user
   * @param {Function} next
   * @return {next}
   * @api public
   */
  addUser: function(user, next){
    var self = this;
    user.accounts.push(self);
    user.save(function(err){
      self.user = user;
      return next();
    });
  }

};


module.exports = mongoose.model('Account', AccountSchema);
