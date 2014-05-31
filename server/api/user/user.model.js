'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var _ = require('lodash');


var authTypes = ['github', 'twitter', 'facebook', 'google'];


var UserSchema = new Schema({
  name: String,
  email: { type: String, lowercase: true },
  role: {
    type: String,
    default: 'user'
  },
  accounts : [{type: Schema.Types.ObjectId, ref: 'Account' }]
});


/**
 * Validations
 */


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
 * Pre-remove hook
 */


UserSchema.post('remove', function (user) {
  
  mongoose.model('Account')
    .find({user : user._id}, function(err, accounts){
      if (err) console.log('Error: '+err);
      _.invoke(accounts,'remove');
    });
});


UserSchema.static('findByAccountId', function(Id, callback){
  return mongoose.model('Account').findById(Id)
    .populate('user')
    .exec(function(err, account) {
      if (!account) return callback(err, null);
      var user = account.user;
      user.provider = account.provider;
      callback(err, user);
    });
  });

/**
 * Methods
 */
UserSchema.methods = {

};

module.exports = mongoose.model('User', UserSchema);
