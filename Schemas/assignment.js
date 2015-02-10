var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var assignmentSchema = new Schema({
	className : String,
	email : String,
	assignment : String,
	percentage : Number,
	weight : Number,
	goal : Number
});

module.exports = mongoose.model('Class', assignmentSchema);