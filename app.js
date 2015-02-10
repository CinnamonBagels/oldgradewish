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
var cookieParser = require('cookie-parser');
var Schema = mongoose.Schema;

var User = require('./Schemas/users');
var Assignment = require('./Schemas/assignment');

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
app.use(cookieParser('huehue'));
app.use(session({
	secret : 'huehue',
	resave : false,
	saveUninitialized : false
}));
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
	console.log(req.session);
	if(req.session.email) {
		res.redirect('/home');
	} else {
		res.redirect('/login');
	}
	//for sessions later
	/*if(req.session.user) {
		res.render('homepage');
	} else {
		res.render('login');
	}*/
});

app.get('/login', function(req, res) {
	res.render('login');
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
				res.redirect('/login');
			} else {
				res.redirect('/login');
			}	
		}
	});
});

app.get('/classes', classes.viewClasses);
app.get('/settings', settings.viewSettings);
app.get('/help', help.helpScreen);

app.post('/addClass', function(req, res) {
	var fields = req.body;
	console.log(fields);
	var className = fields.className;
	var newClasses = []

	User.findOne({ email : req.session.email }, function(err, data) {
		if(data) {
			newClasses = data.classes;
			newClasses.push(className);
			User.where({ email : req.session.email }).update({ classes : newClasses }, function(err) {
				if(err) {
					console.log(err);
					res.send('ERROR');
				} else {
					res.send('OK');
				}
			});
			
		} else {
			console.log('where is the user?');
			res.end();
		}
		
	});


});

app.post('/addAssignment' , function(req, res) {
	
	var fields = req.body;
	//email = req.session.email
	//form fields = req.body = {}
	console.log(req.body);

	var assignmentObject = {
		className : fields.className,
		email : req.session.email,
		assignment : fields.assignmentName,
		percentage : fields.assignmentPercentage,
		weight : fields.assignmentWeight
	}

	var newAssignment = new Assignment(assignmentObject);
	newAssignment.save();

	res.send('OK');
})

function validateLogin(req, res) {
	var fields = req.body;

	User.findOne({ email : fields.email, password : fields.password }, function(err, data) {
		if(data) {
			req.session.email = data.email;
			res.redirect('/classes');
		} else {
			res.render('login');
		}
	});
}

// Start the server
var port = process.env.PORT || PORT; // 80 for web, 3000 for development

app.listen(port, function() {
	console.log("Node.js server running on port %s", port);
});