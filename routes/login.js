var session = require('express-session');
var status = require('../status');

var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var User = require('../Schemas/users');

exports.viewLogin = function(req, res) {
	res.render('login');
}

exports.validateLogin = function(req, res) {
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