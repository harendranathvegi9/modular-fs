'use strict';

var express = require('express');
var passport = require('passport');
var token = require('../token.controller');

var strategies = {
  facebook : require('passport-facebook').Strategy,
  google : require('passport-google-oauth').OAuth2Strategy,
  twitter :require('passport-twitter').Strategy
}

var router = express.Router();


exports.route = function(config, provider){
  config = config.hasOwnProperty(provider)? config[provider] : config;
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

exports.passportSetup = function (findByProfileOrCreate, config, provider) {

  var Strategy = strategies[provider];
  config = config.hasOwnProperty(provider)? config[provider] : config;

  passport.use(new Strategy(
    config,
    function(accessToken, refreshToken, profile, done) {
     return findByProfileOrCreate(provider, profile, done);
   }
  ));
};

exports.strategies = strategies;

exports.authTypes = Object.keys(strategies);
