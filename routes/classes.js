var status = require('../status');
var session = require('express-session');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var User = require('../Schemas/users');

var classes = [];
var classObject;

exports.viewClasses = function(req, res) {
	if(!req.session.email) {
		return res.redirect('/login');
	}
	if (req.query.class)
	{
		res.render('class', {
			'className' : req.query.class
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
				// res.render('classes', {
				// 	'classes' : classObject
				// });
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
						res.send(status.error);
					} else {
						res.send({
							status : status.ok,
							className : newClass
						});
					}
				});
			} else {
				res.send({
					status : status.error
				})
			}
			
		} else {
			res.end();
		}
		
	});
}

