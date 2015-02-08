var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var userSchema = new Schema({
	email : String,
	password : String,
	classes : [String]
});

module.exports = mongoose.model('User', userSchema);