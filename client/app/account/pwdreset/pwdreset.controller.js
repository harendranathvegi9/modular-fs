'use strict';

angular.module('ngApp')
  .controller('PwdResetCtrl', function ($scope, Auth, $location, $routeParams) {
    $scope.errors = {};
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.pwdResetMailSend = false;

    if ($routeParams.confirmCode) {
      Auth.confirmMail( $routeParams.confirmCode
        )
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
    }

    $scope.confirm = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.confirmMail($scope.reset.email
        )
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

    $scope.sendPwdResetMail = function(form) {
      $scope.pwdResetMailSend = true;
      console.log($scope.reset.email);
      if(form.$valid) {
        Auth.sendPwdResetMail( $scope.reset.email )
        .then( function() {
          $scope.message = 'Password successfully changed.';
        })
        .catch( function() {
          form.password.$setValidity('mongoose', false);
          $scope.errors.other = 'Incorrect password';
          $scope.message = '';
        });
      }
    };

    $scope.pwdResetMailSend = function() {
      return pwdResetMailSend;
    };


  });
