// server.js
// set up ======================================================================
// get all the tools we need
var express  = require('express');
var exphbs = require('express-handlebars');
var app      = express();
var port     = process.env.PORT || 8080;

// DB and Passport configuration ===============================================================
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url); // connect to our database

// get project information
var package = require('./package.json');
app.title = package.title;

var flash    = require('connect-flash');
var session  = require('express-session');
var passport = require('passport');
require('./config/passport')(passport); // pass passport for configuration

//general express stuff
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var methodOverride = require('method-override');
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({ extended: false }));    // parse application/x-www-form-urlencoded
app.use(bodyParser.json());    // parse application/json
app.use(methodOverride());                  // simulate DELETE and PUT

// required for passport
app.use(session({ secret: 'insert_secret_here' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// create handlebars instance with exphbs
var hbs = exphbs.create({
		defaultLayout: 'main',
		extname: '.hbs',
		layoutsDir:"views/layouts/",
		partialsDir:["views/partials/","node_modules/hbs-header/views/partials/"],
		helpers: {
			ifCond: function (v1, operator, v2, options) {

				switch (operator) {
					case '==':
						return (v1 == v2) ? options.fn(this) : options.inverse(this);
					case '===':
						return (v1 === v2) ? options.fn(this) : options.inverse(this);
					case '<':
						return (v1 < v2) ? options.fn(this) : options.inverse(this);
					case '<=':
						return (v1 <= v2) ? options.fn(this) : options.inverse(this);
					case '>':
						return (v1 > v2) ? options.fn(this) : options.inverse(this);
					case '>=':
						return (v1 >= v2) ? options.fn(this) : options.inverse(this);
					case '&&':
						return (v1 && v2) ? options.fn(this) : options.inverse(this);
					case '||':
						return (v1 || v2) ? options.fn(this) : options.inverse(this);
					default:
						return options.inverse(this);
				}
			}
		}//end helpers
	});
app.engine('hbs', hbs.engine);			//define hbs
app.set('view engine', 'hbs');			//use hbs
app.use(express.static(__dirname + '/public'));     // set the static files location /public/img will be /img for users
app.use('/users', express.static(__dirname + '/public'));	//use index.css for login logout pages

// set up our routes
require('./app/routes.js')(app); // use "/" from own /app/routes.js
require('hbs-header')(app,session,passport);


app.listen(port);
console.log('The magic happens on port ' + port);
