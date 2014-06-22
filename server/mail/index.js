'use strict';

var express = require('express');
var config = require('./../config');
var controller = require('./mail.controller').setup(config.mail);



var router = express.Router();


router.get('/test', controller.sendTest);

router.get('/confirm/:confirmCode', controller.confirmMail);


module.exports = router;