console.log("	APP/ACCT-MANAGE/LOGINLOGOUT.JS")

// app/acct-manage/loginLogout.js
module.exports = function(app, passport) {
	

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', loginRedundancy, function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('acct-manage/login.ejs', { user : req.user, message: req.flash('loginMessage') }); 
    });

    // process the login form
    app.post('/login', loginRedundancy, passport.authenticate('local-login', {
        successRedirect : '/', // redirect to home page with logged in status
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', loginRedundancy, function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('acct-manage/signup.ejs', { user : req.user, message: req.flash('signupMessage') });
    });

    // process the signup form
    app.post('/signup', loginRedundancy, passport.authenticate('local-signup', {
        successRedirect : '/', // redirect to home page with logged in status
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    // =====================================
    // PROFILE SECTION =====================//DROPPED/ USE FOR OPTIONS
    // =====================================
    // we will want this protected so you have to be logged in to visit
    // we will use route middleware to verify this (the isLoggedIn function)
    app.get('/profile', isLoggedIn, function(req, res) {
        res.render('acct-manage/profile.ejs', {
            user : req.user // get the user out of session and pass to template
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

};
// prevent logged in folks from signing up/logging in again
function loginRedundancy(req, res, next) {
    if (req.isAuthenticated())
       res.redirect('/');
	else
		return next();
}
// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}