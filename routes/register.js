var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var User = require('../Schemas/users');

var systemMessages = require('../systemMessages');

exports.viewRegister = function(req, res) {
	res.send('no');
}

exports.addUser = function(req, res) {
	var fields = req.body;

	//if user already exists
	User.findOne({ email : fields.email }, function(err, data) {
		if(data) {
			res.send({
				err : 'This email has already registered!'
			});
		} else {

			if(fields.password === fields.verifypassword) {
				var userObject = {
					name : fields.name,
					email : fields.email,
					password : fields.password,
					classes : []
				}
				var newUser = new User(userObject);
				newUser.save();
				res.send({
					ok : 'hue'
				})
			} else {
				res.send({
					err : 'Your passwords do not match'
				})
			}	
		}
	});
}