var config = require('../config'),
    path = require('path'),
    templatesDir = path.join(__dirname, './templates'),
    nodemailer = require("nodemailer"),
    emailTemplates = require('email-templates'),
    _ = require('lodash');

var smtpTransport = nodemailer.createTransport(config.mail.transport, config.mail),
    from = config.mail.from;


var sendmail = function(templateName, locals, callback) {

    var cb = callback || _.noop;
    // Send a single email
    emailTemplates(templatesDir, function(err, template) {

      if (err) {
        console.log(err);
      } else {
        template(templateName, locals, function(err, html, text) {
          if (err) {
            console.log(err);
          } else {
            smtpTransport.sendMail({
              from: from,
              to: locals.to,
              subject: locals.subject,
              html: html,
              // generateTextFromHTML: true,
              text: text
            }, function(err, responseStatus) {
              if (err) {
                cb(err);
              } else {
                cb(responseStatus.message);
              }
            });
          }
        })
      }
    });
};


exports.sendConfirmCode = function(user, callback){
  console.log('Send Activation Mail');

  var mailOptions = {
  to: user.email,
  subject: "Activation",
  name:user.name,
  COMPANY: 'angular-fullstack',
  CONFIRMATION_URL : 'http://localhost:9000/confirm/',
  MAILCONFIRMATIONCODE : user.mailConfirmationCode
  };


  sendmail('mail_confirmation', mailOptions, callback);

};