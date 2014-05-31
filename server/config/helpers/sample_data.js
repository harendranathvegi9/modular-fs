/**
 * Populate DB with sample data
 * to disable, edit config/env/index.js, and set `sampleData: false`
 */

'use strict';

var Thing = require('../../api/thing/thing.model');
var User = require('../../api/user/user.model');
var Account = require('../../api/user/account.model');
var _ = require('lodash');

Thing.find({}).remove(function() {
  Thing.create({
    name : 'Development Tools',
    info : 'Integration with popular tools such as Bower, Grunt, Karma, JSHint, Node Inspector, Livereload, Protractor, Jade, SCSS, CoffeScript, and LESS.'
  }, {
    name : 'Server and Client integration',
    info : 'Built with a powerful and fun stack: MongoDB, Express, AngularJS, and Node.'
  }, {
    name : 'Smart Build System',
    info : 'Build system ignores `spec` files, allowing you to keep tests alongside code. Automatic injection of scripts and styles into your index.html'
  },  {
    name : 'Modular Structure',
    info : 'Best practice client and server structures allow for more code reusability and maximum scalability'
  },  {
    name : 'Optimized Build',
    info : 'Build process packs up your templates as a single JavaScript payload, minifies your scripts/css/images, and rewrites asset names for caching.'
  },{
    name : 'Deployment Ready',
    info : 'Easily deploy your app to Heroku or Openshift with the :heroku and :openshift subgenerators'
  });
});


User
.find({}, function(err, docs){
  _.invoke(docs, 'remove');
});


Account
.find({}).remove(function() {
  console.log('Start populating user and account');
  
  Account.create({
    provider: 'local',
    password: 'test',
    email: 'test@test.com',
    profile : {
      name: 'Test User',
      email: 'test@test.com'
    }
  }, {
    provider: 'local',
    password: 'admin',
    email: 'admin@admin.com',
    profile : {
      name: 'Admin',
      email: 'admin@admin.com',
      role: 'admin'
    }
  }, function(err) {      console.log('finished populating users');
    }
  );
});