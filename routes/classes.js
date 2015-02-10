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

