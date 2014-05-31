'use strict';

// Environment variables that Grunt will start the server with.
// Add your settings to a local process_env.js, that will not be tracked by git
module.exports = {
  SESSION_SECRET: "angular-fullstack",
  FACEBOOK_ID: "",
  FACEBOOK_SECRET: "",
  FACEBOOK_SCOPE: ['email', 'user_about_me'],
  TWITTER_ID: "",
  TWITTER_SECRET: "",
  GOOGLE_ID: "",
  GOOGLE_SECRET: "",
  GOOGLE_SCOPE: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email'
    ]
}