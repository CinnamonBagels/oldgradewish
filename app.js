/**
 * Introduction to Human-Computer Interaction
 * Lab 2
 * --------------
 * Created by: Michael Bernstein
 * Last updated: December 2013
 */
var PORT = 3000;

// Express is a web framework for node.js
// that makes nontrivial applications easier to build

var login = require('./routes/login');
var homepage = require('./routes/homepage');
var register = require('./routes/register');
var classes = require('./routes/classes');
var settings = require('./routes/settings');
var help = require('./routes/help');


var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var mongoose = require('mongoose');
var session = require('express-session');
var bodyparser = require('body-parser');
var Schema = mongoose.Schema;

var User = require('./Schemas/users');
var Class = require('./Schemas/class');

var Connection = mongoose.connect('mongodb://samko:huehuehue@kahana.mongohq.com:10089/TritonSX', function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log('connected to database');
	}
});

// Create the server instance
var app = express();

app.engine('handlebars', handlebars({defaultLayout : 'master'}));
app.set('view engine', 'handlebars');
app.use( bodyparser.json() );       // to support JSON-encoded bodies
app.use(bodyparser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.set('views', path.join(__dirname, 'views'));

// Print logs to the console and compress pages we send

// Return all pages in the /static directory
// whenever they are requested at '/'
// e.g., http://localhost:3000/index.html
// maps to /static/index.html on this machine
app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res) {
	//for sessions later
	/*if(req.session.user) {
		res.render('homepage');
	} else {
		res.render('login');
	}*/

	res.render('login');
});

app.get('/login', function(req, res) {
	
});

app.post('/login', function(req, res) {
	validateLogin(req, res);
});
app.get('/home', homepage.viewHome);
app.post('/register', function(req, res) {
	var fields = req.body;

	//if user already exists
	User.findOne({ email : fields.email }, function(err, data) {
		if(data) {
			res.send('already registered');
		} else {

			if(fields.password == fields.verifypassword) {
				var userObject = {
					name : fields.name,
					email : fields.email,
					password : fields.password,
					classes : []
				}
				var newUser = new User(userObject);
				newUser.save();
				res.send('registered');
			} else {
				res.send('passwords dont match');
			}

			
		}
	});
});

app.get('/classes', classes.viewClasses);
app.get('/settings', settings.viewSettings);
app.get('/help', help.helpScreen);

function validateLogin(req, res) {
	var fields = req.body;

	Users.findOne({ email : fields.email, password : fields.password }, function(err, data) {
		if(data) {
			res.render('homepage');
		} else {
			res.send('wrong password/email');
		}
	})
}

// Start the server
var port = process.env.PORT || PORT; // 80 for web, 3000 for development

app.listen(port, function() {
	console.log("Node.js server running on port %s", port);
});