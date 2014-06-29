'use strict';

angular.module('ngApp')
  .controller('ConfirmCtrl', function ($scope, Auth, $location, $routeParams) {
    $scope.errors = {};
    $scope.isLoggedIn = Auth.isLoggedIn;
    var confirmationMailSend = false;

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
        Auth.confirmMail($scope.confirm.code
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

    $scope.sendConfirmationMail = function() {

      if(Auth.isLoggedIn()) {
        confirmationMailSend = true;
        Auth.sendConfirmationMail(function(){
          confirmationMailSend = false;
        });
      }
    };

    $scope.confirmationMailSend = function() {
      return confirmationMailSend;
    };


  });
