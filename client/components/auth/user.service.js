'use strict';

angular.module('ngApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      sendConfirmationMail: {
        method: 'GET',
        params: {
          id:'sendConfirmMail'
        }
      },
      sendPwdResetMail: {
        method: 'POST',
        params: {
          controller:'sendPwdResetMail'
        }
      }
	  });
  });
