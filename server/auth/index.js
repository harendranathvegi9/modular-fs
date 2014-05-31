'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config');
var Account = require('../api/user/account.model');

var social = require('./social');

var facebookStrategy = require('passport-facebook').Strategy;
var googleStrategy = require('passport-google-oauth').OAuth2Strategy;
var twitterStrategy = require('passport-twitter').Strategy;



// Passport Configuration
require('./local/passport').setup(Account, config);
social.passportSetup(Account.findOrCreate, facebookStrategy, config.facebook, 'facebook');
social.passportSetup(Account.findOrCreate, googleStrategy, config.google, 'google');
social.passportSetup(Account.findOrCreate, twitterStrategy, config.twitter, 'twitter');


var router = express.Router();

router.use('/local', require('./local'));
router.use('/facebook', social.route(config.facebook,'facebook'));
router.use('/twitter', social.route(config.twitter,'twitter'));
router.use('/google', social.route(config.google,'google'));

module.exports = router;
