'use strict';

var express = require('express');
var passport = require('passport');
var config = require('../config');
var Account = require('./account.model');



// Passport Configuration
require('./local/passport').setup(Account, config);
require('./social/passport').setup(Account, require('passport-facebook').Strategy, config, 'facebook');
//require('./facebook/passport').setup(Account, config);
require('./google/passport').setup(Account, config);
require('./twitter/passport').setup(Account, config);

var router = express.Router();

router.use('/local', require('./local'));
router.use('/facebook', require('./facebook'));
router.use('/twitter', require('./twitter'));
router.use('/google', require('./google'));

module.exports = router;
