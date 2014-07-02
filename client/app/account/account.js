'use strict';

angular.module('ngApp')
  .config(function ($routeProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'app/account/login/login.html',
        controller: 'LoginCtrl'
      })
      .when('/signup', {
        templateUrl: 'app/account/signup/signup.html',
        controller: 'SignupCtrl'
      })
      .when('/confirm', {
        templateUrl: 'app/account/confirm/confirm.html',
        controller: 'ConfirmCtrl',
      })
      .when('/confirm/:confirmCode', {
        templateUrl: 'app/account/confirm/confirm.html',
        controller: 'ConfirmCtrl'
      })
      .when('/pwdreset', {
        templateUrl: 'app/account/pwdreset/pwdreset.html',
        controller: 'PwdResetCtrl',
      })
      .when('/pwdreset/:pwdresetCode', {
        templateUrl: 'app/account/pwdreset/pwdreset.html',
        controller: 'PwdResetCtrl'
      })
      .when('/settings', {
        templateUrl: 'app/account/settings/settings.html',
        controller: 'SettingsCtrl',
        authenticate: true
      });
  });