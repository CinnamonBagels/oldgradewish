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


var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var mongoose = require('mongoose');

var User = require('./Schemas/users');

var Connection = mongoose.connect('mongodb://samko:huehuehue@kahana.mongohq.com:10089/TritonSX', function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log('connected to database');
	}
});

var Schema = mongoose.Schema;

var instance = new User();

instance.email = 'samuelsko@gmail.com';
instance.password = '1234';
instance.classes = ['cse170', 'cse150'];

instance.save(function(err) {
	if(err) {
		console.log(err);
	} else {
		console.log('instance saved');
	}
});

// Create the server instance
var app = express();

app.engine('handlebars', handlebars({defaultLayout : 'master'}));
app.set('view engine', 'handlebars');

app.set('views', path.join(__dirname, 'views'));

// Print logs to the console and compress pages we send

// Return all pages in the /static directory
// whenever they are requested at '/'
// e.g., http://localhost:3000/index.html
// maps to /static/index.html on this machine
app.use(express.static(__dirname + '/static'));

app.get('/', login.viewLogin);
app.get('/home', homepage.viewHome);
app.get('/register', register.viewRegister);
app.get('/classes', classes.viewClasses);
app.get('/settings', settings.viewSettings);

// Start the server
var port = process.env.PORT || PORT; // 80 for web, 3000 for development

app.listen(port, function() {
	console.log("Node.js server running on port %s", port);
});