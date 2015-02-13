var systemMessages = require('../systemMessages');
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
			res.send(systemMessages.status.error);
		} else {
			res.send(systemMessages.status.ok);
		}
	});
}

/*
 { className : className, assignmentPercentage: percentage, assignmentName : assignment}
 */
exports.updateAssignmentPercentage = function(req, res) {
	var fields = req.body;

	Assignment.findOne({ email : req.session.email, className : fields.className, assignment : fields.assignmentName }, function(err, data) {
		if(err) {
			console.log(err);
			res.send(err);
		} else {
			data.percentage = fields.assignmentPercentage;
			data.save(function(err) {
				if(err) {
					console.log(err);
					res.send(err);
				} else {
					console.log(systemMessages.status.ok);
					res.send(systemMessages.status.ok);
				}
			});
		}
	});
}

exports.updateAssignmentGoal = function(req, res) {
	var pointsBurned;
	var totalPoints;
	var currentGrade;
	var undoneWeight = 100 - pointsBurned;
	var desiredGrade;
	var assignmentGoal;
	var pointsOfTotal;
	var goalTotal;
	//totalpoints = sum(assignmentPercent * assignmentWeight)
	//currentGrade = totalPoints / pointBurned
	//pointsOfTotal = totalPoints / 100
	//desiredGrade - pointsOfTotal = goalTotal;
	//if(goalTotal < 0) { goal is already met }
	//if(goalTotal > undoneWeight) { they need to acheive extra credit / impossible without extra credit }
	//goalTotal / undoneWeight == goal
}