var systemMessages = require('../systemMessages');
var session = require('express-session');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var User = require('../Schemas/users');
var Assignment = require('../Schemas/assignment');

var classes = [];
var classObject;
var assignments = [];
var classPageObject;

exports.viewClasses = function(req, res) {
	if(!req.session.email) {
		return res.redirect('/login');
	}
	if (req.query.class)
	{	
		Assignment.find({ email : req.session.email, className : req.query.class }, function(err, data) {
			if(err) {
				console.log(err);
				res.send(err);
			} else {
				classPageObject = {
					'className' : req.query.class,
					'assignments' : data
				};
				res.render('class', classPageObject);
			}
		});
	}
	else 
	{	
		User.findOne({ email : req.session.email }, function(err, data) {
			if(err) {
				console.log(err);
				res.end();
			} else {
				data.classes.forEach(function(element) {
					classObject = {
						'className' : element
					};
					classes.push(classObject);
				});
				console.log(classes);
				res.render('classes', {
					'classes' : classes
				});
			}
		})
	}
}

exports.addClass = function(req, res) {
	var fields = req.body;
	console.log(fields);
	var newClass = fields.className;
	var currentClasses = [];
	var classExists = false;

	User.findOne({ email : req.session.email }, function(err, data) {
		if(data) {
			currentClasses = data.classes;
			currentClasses.forEach(function(element) {
				if(element == newClass) {
					classExists = true;
				}
			});
			if(classExists == false) {
				currentClasses.push(newClass);
				User.where({ email : req.session.email }).update({ classes : currentClasses }, function(err) {
					if(err) {
						console.log(err);
						res.send(systemMessages.status.error);
					} else {
						res.send(systemMessages.status.ok);
					}
				});
			} else {
				res.send(systemMessages.status.error);
			}
			
		} else {
			res.end();
		}
		
	});
}

