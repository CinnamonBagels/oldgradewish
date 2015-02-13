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
var messages = require('./systemMessages');

var loginController = require('./routes/login');
var homeController = require('./routes/homepage');
var registerController = require('./routes/register');
var classesController = require('./routes/classes');
var settingsController = require('./routes/settings');
var helpController = require('./routes/help');
var assignmentController = require('./routes/assignments');


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
});

app.get('/login', loginController.viewLogin);
app.post('/login', loginController.validateLogin);
app.get('/home', homeController.viewHome);
app.post('/register', registerController.addUser);

app.get('/classes', classesController.viewClasses);
app.get('/settings', settingsController.viewSettings);
app.get('/help', helpController.helpScreen);

app.post('/addClass', classesController.addClass);
app.post('/deleteClass', classesController.deleteClass);

app.post('/addAssignment', assignmentController.addAssignment);
app.post('/updateAssignmentPercentage', assignmentController.updateAssignmentPercentage);
app.post('/updateDesiredGrade', classesController.updateDesiredGrade);
app.post('/updateAssignmentWeight', assignmentController.updateAssignmentWeight);
app.post('/deleteAssignment', assignmentController.deleteAssignment);

// Start the server
var port = process.env.PORT || PORT; // 80 for web, 3000 for development

app.listen(port, function() {
	console.log("Node.js server running on port %s", port);
});