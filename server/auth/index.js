'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config');
var User = require('../api/user/user.model');

var social = require('./social');

// Passport Configuration
require('./local/passport').setup(User, config);
social.passportSetup(User.findByProfileOrCreate,  config, 'facebook');
social.passportSetup(User.findByProfileOrCreate,  config, 'google');
social.passportSetup(User.findByProfileOrCreate,  config, 'twitter');


var router = express.Router();

router.use('/local', require('./local'));
router.use('/facebook', social.route(config,'facebook'));
router.use('/twitter', social.route(config,'twitter'));
router.use('/google', social.route(config,'google'));

module.exports = router;
