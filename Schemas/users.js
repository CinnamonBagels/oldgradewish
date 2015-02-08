var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var userSchema = new Schema({
	name : String,
	email : String,
	password : String,
	classes : [String]
});

module.exports = mongoose.model('User', userSchema);