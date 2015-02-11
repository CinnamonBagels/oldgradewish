var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var User = require('../Schemas/users');

var status = require('../status');

exports.viewRegister = function(req, res) {
	res.send('no');
}

exports.addUser = function(req, res) {
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
}