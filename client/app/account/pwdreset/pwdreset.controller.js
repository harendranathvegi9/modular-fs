'use strict';

angular.module('ngApp')
  .controller('PwdResetCtrl', function ($scope, Auth, $location, $routeParams) {
    $scope.errors = {};
    $scope.isLoggedIn = Auth.isLoggedIn;
    var pwdresetCode = $routeParams.pwdresetCode;
    var pwdResetState = 'mailform';
    $scope.pwdResetMailSend = false;
    $scope.invalidResetCode = false;
    $scope.unknownMailAddress = false;


    if (pwdresetCode) {
      pwdResetState = 'passwordform';
    }


    $scope.sendPwdResetMail = function(form) {
      $scope.submitted = true;
      $scope.unknownMailAddress = false;
      if(form.$valid) {
        $scope.pwdResetMailSend = true;
        Auth.sendPwdResetMail( $scope.reset.email )
        .then( function() {
          pwdResetState = 'mailsent';
          $scope.message = 'Password successfully changed.';
        })
        .catch( function(err) {
          $scope.unknownMailAddress = true;
          $scope.message = '';
          $scope.pwdResetMailSend = false;
        });
      }
    };

    $scope.changeResetedPassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.changeResetedPassword( pwdresetCode, $scope.user.newPassword )
        .then( function() {
          $scope.message = 'Password successfully changed.';
          $location.path('/');
        })
        .catch( function(err) {
          //form.password.$setValidity('mongoose', false);
          console.log(err);
          $scope.invalidResetCode = true;
          $scope.message = '';
        });
      }
    };


    $scope.resetStateIs = function(state) {
      return pwdResetState===state;
    };


  });
