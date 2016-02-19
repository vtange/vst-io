console.log("	APP/ACCT-MANAGE/PASSFORGET.JS")

var User            = require('../models/user');
var flash    		= require('connect-flash');
var asyncc 			= require('async');
var crypto 			= require('crypto');
var nodemailer 		= require('nodemailer');

// app/passForget.js
module.exports = function(app) {
	
	
	// =====================================
    // FORGOT ===============================
    // =====================================
    // show the login form
    app.get('/forgot', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('acct-manage/forgot.ejs', { user : req.user, message: req.flash('info') }); 
    });
	
    // =====================================
    // FORGOT PASSWORD =====================
    // =====================================
	app.post('/forgot', function(req, res, next) {
	  asyncc.waterfall([
		function(done) {
		  crypto.randomBytes(20, function(err, buf) {
			var token = buf.toString('hex');
			done(err, token);
		  });
		},
		function(token, done) {
		  User.findOne({ 'local.email' : req.body.email }, function(err, user) {
			if (!user) {
			  req.flash('info', 'No account with that email address exists.');
			  return res.redirect('/forgot');
			}

			user.local.resetPasswordToken = token;
			user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

			user.save(function(err) {
			  done(err, token, user);
			});
		  });
		},
		function(token, user, done) {
			var transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: '@gmail.com',
				pass: ''
			}
			});
		  var mailOptions = {
			to: user.local.email,
			from: 'passwordreset@demo.com',
			subject: 'Node.js Password Reset',
			text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
			  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
			  'http://' + req.headers.host + '/reset/' + token + '\n\n' +
			  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
		  };
		  transporter.sendMail(mailOptions, function(err) {
			req.flash('info', 'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
			done(err, 'done');
		  });
		}
	  ], function(err) {
		if (err) return next(err);
		res.redirect('/forgot');
	  });
	});
	app.get('/reset/:token', function(req, res) {
	  User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
		if (!user) {
		  req.flash('error', 'Password reset token is invalid or has expired.');
		  return res.redirect('/forgot');
		}
		res.render('acct-manage/reset.ejs', {
		  token: req.params.token,
		  message: req.flash('info'),
		  user: req.user
		});
	  });
	});
	
	app.post('/reset/:token', function(req, res) {
	  asyncc.waterfall([
		function(done) {
		  User.findOne({ 'local.resetPasswordToken': req.params.token, 'local.resetPasswordExpires': { $gt: Date.now() } }, function(err, user) {
			if (!user) {
			  req.flash('info', 'Password reset token is invalid or has expired.');
			  return res.redirect('back');
			}

			user.local.password = user.generateHash(req.body.password);
			user.local.resetPasswordToken = undefined;
			user.local.resetPasswordExpires = undefined;

			user.save(function(err) {
			  req.logIn(user, function(err) {
				done(err, user);
			  });
			});
		  });
		},
		function(user, done) {
			var transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: '@gmail.com',
				pass: ''
			}
			});
		  var mailOptions = {
			to: user.local.email,
			from: 'passwordreset@demo.com',
			subject: 'Your password has been changed',
			text: 'Hello,\n\n' +
			  'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
		  };
		  transporter.sendMail(mailOptions, function(err) {
			req.flash('info', 'Success! Your password has been changed.');
			done(err);
		  });
		}
	  ], function(err) {
		res.redirect('/');
	  });
	});
};