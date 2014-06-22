'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var _ = require('lodash');

var User = require('../api/user/user.model');

var reliableProvider = ['github', 'facebook', 'google'];

var MailSchema = new Schema({
  user : {type: Schema.Types.ObjectId, ref: 'User' },
  email: { type: String, lowercase: true },
  confirmCode : {type: String}
});


MailSchema.static('create', function(user, done){
  
  if (reliableProvider.indexOf(user.provider) !== -1) 
    {
      user.emailChecked = true;
      user.save(function(err) {
        if (err) done(err);
        return true;
      });
    }

  var Mail = mongoose.model('Mail');
  var mail = new Mail({
    user: user._id,
    email : user.email,
    confirmCode: crypto.randomBytes(16).toString('base64')
  });
  console.log(mail);

  mail.save(function(err){
        if (err) done(err);
        console.log(encodeURIComponent(mail.confirmCode));
        return done;    
  })

});

MailSchema.static('confirmMail', function(done){
  this.user.emailChecked = true;
  this.user.save(function(err) {
        if (err) done(err);
        return true;
      });
});



module.exports = mongoose.model('Mail', MailSchema);