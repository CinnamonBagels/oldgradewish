var status = require('../status');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Assignment = require('../Schemas/assignment');

exports.addAssignment = function(req, res) {
	
	var fields = req.body;
	//email = req.session.email
	//form fields = req.body = {}
	console.log(req.body);

	var assignmentObject = {
		className : fields.className,
		email : req.session.email,
		assignment : fields.assignmentName,
		percentage : fields.assignmentPercentage,
		weight : fields.assignmentWeight
	}

	var newAssignment = new Assignment(assignmentObject);
	newAssignment.save(function(err) {
		if(err) {
			console.log(err);
			res.send(status.error);
		} else {
			res.send(status.ok);
		}
	});
}