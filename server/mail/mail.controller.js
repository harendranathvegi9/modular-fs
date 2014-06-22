var path           = require('path'),
    templatesDir   = path.join(__dirname, './templates'),
    nodemailer = require("nodemailer"),
    emailTemplates = require('email-templates'),
    Mail = require('./mail.model');

var smtpTransport,
    from;


var sendmail = function(templateName, locals) {
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
                console.log(err);
              } else {
                console.log(responseStatus.message);
              }
            });
          }
        })
      }
    });
};


exports.sendTest = function(req, res){
  console.log('Send Test Mail');

  var mailOptions = {
  to: "remi.castaing+test@gmail.com",
  subject: "Activation",
  name:'Rémi Castaing',
  CURRENT_YEAR: '2014',
  COMPANY: 'ludic.io',
  ARCHIVE: '',
  ARCHIVE_PAGE:'',
  DESCRIPTION:'',
  UNSUB:'',
  UPDATE_PROFILE: ''
  };


  sendmail('activate', mailOptions);

  res.send(200, 'mail sent');
};

exports.confirmMail = function(req, res) {
  console.log('confirmCode: '+req.params);
  Mail.findOne(req.params)
      .populate('user')
      .exec( function(err, mail){
          if(err) return res.send(500, err);
          console.log(mail);
          mail.user.emailChecked = true;
          mail.user.save(function(err){
            if (err) return res.send(500, err);
            res.send(200);
          });
        });

};


 

module.exports.setup = function(mailconfig) {
    smtpTransport= nodemailer.createTransport(mailconfig.transport, mailconfig);
    from = mailconfig.from;

    return this;
};