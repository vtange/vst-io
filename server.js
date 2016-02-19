// server.js
// set up ======================================================================
// get all the tools we need
var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var flash    = require('connect-flash');

var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var methodOverride = require('method-override');
var session      = require('express-session');
// configuration ===============================================================
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database


var passport = require('passport');
require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(express.static(__dirname + '/public'));     // set the static files location /public/img will be /img for users
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: false }))    // parse application/x-www-form-urlencoded
app.use(bodyParser.json())    // parse application/json
app.use(methodOverride());                  // simulate DELETE and PUT

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport
require('./app/acct-manage/loginLogout.js')(app, passport); // load basic login logout routes
require('./app/acct-manage/socialMedia.js')(app, passport); // load social media linking
require('./app/acct-manage/passForget.js')(app); // load password forgot functionality
// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
