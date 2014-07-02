'use strict';

var User = require('./user.model');
var passport = require('passport');
var config = require('../../config');
var mail = require('./../../mail');
var jwt = require('jsonwebtoken');

var validationError = function(res, err) {
  return res.json(422, err);
};

/**
 * Get list of users
 * restriction: 'admin'
 */
exports.index = function(req, res) {
  User.find({}, '-salt -hashedPassword', function (err, users) {
    if(err) return res.send(500, err);
    res.json(200, users);
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res, next) {
  var newUser = new User(req.body);
  newUser.provider = 'local';
  newUser.role = 'user';
  newUser.save(function(err, user) {
    if (err) return validationError(res, err);
    var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
    mail.sendConfirmCode(user);
    res.json({ token: token });
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res, next) {
  var userId = req.params.id;

  User.findById(userId, function (err, user) {
    if (err) return next(err);
    if (!user) return res.send(401);
    res.json(user.profile);
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function(req, res) {
  User.findByIdAndRemove(req.params.id, function(err, user) {
    if(err) return res.send(500, err);
    return res.send(204);
  });
};

/**
 * Change a users password
 */
exports.changePassword = function(req, res, next) {
  var userId = req.user._id;
  var oldPass = String(req.body.oldPassword);
  var newPass = String(req.body.newPassword);

  User.findById(userId, function (err, user) {
    if(user.authenticate(oldPass)) {
      user.password = newPass;
      user.save(function(err) {
        if (err) return validationError(res, err);
        res.send(200);
      });
    } else {
      res.send(403);
    }
  });
};

/**
 * Get my info
 */
exports.me = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword -mailConfirmationCode', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    res.json(user);
  });
};

/**
 * Authentication callback
 */
exports.authCallback = function(req, res, next) {
  res.redirect('/');
};



/**
 * Confirm mail address
 */
exports.confirmMail = function(req, res, next) {
  User.findOne({mailConfirmationCode : req.param('mailConfirmationCode')}, function(err, user){
          if(err) return res.send(500, { message: err});
          if (!user) return res.send(403, { message: 'Invalid mail confirmation code.' });
          user.confirmedMail = true;
          user.mailConfirmationCode = '';
          user.save(function(err){
            if (err) return res.send(500, { message: err });
            var token = jwt.sign({_id: user._id }, config.secrets.session, { expiresInMinutes: 60*5 });
            res.json({ token: token });
          });
        });

};

/**
 * Send confirmation mail
 */
exports.sendMailconfirmationMail = function(req, res, next) {
  var userId = req.user._id;
  User.findOne({
    _id: userId
  }, '-salt -hashedPassword -passwordResetCode', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    mail.sendConfirmCode(user, function(){res.send(200);});
  });
};

/**
 * Send confirmation mail
 */
exports.sendPwdResetMail = function(req, res, next) {
  var email = req.param('email');
  console.log('Reset mail: '+email);
  User.findOne({
    email: email,
    provider: 'local'
  }, '-salt -hashedPassword -passwordResetCode', function(err, user) { // don't ever give out the password or salt
    if (err) return next(err);
    if (!user) return res.json(401);
    user.setPwResetCode(function(err, user){
      mail.sendPwResetCode(user, function(){res.send(200);})
    });
  });
};


