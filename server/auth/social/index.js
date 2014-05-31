'use strict';

var express = require('express');
var passport = require('passport');
var token = require('../token.controller');

var router = express.Router();


exports.route = function(config, provider){
  return router
    .get('/', passport.authenticate(provider, {
      scope: config.scope,
      failureRedirect: '/signup',
      session: false
    }))

    .get('/callback', passport.authenticate(provider, {
      failureRedirect: '/signup',
      session: false
    }), token.setToken);
};

exports.passportSetup = function (findOrCreate, Strategy, config, provider) {

  passport.use(new Strategy(
    config,
    findOrCreate(provider) 
  ));
};