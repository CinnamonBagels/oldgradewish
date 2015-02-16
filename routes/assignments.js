var systemMessages = require('../systemMessages');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var Assignment = require('../Schemas/assignment');
var Class = require('../Schemas/class');

exports.addAssignment = function(req, res) {
	
	var fields = req.body;
	//email = req.session.email
	//form fields = req.body = {}
	console.log(req.body);

	Assignment.find({ email : req.session.email, className : fields.className }, function(err, data) {
		if(err) {
			console.log(err);
			res.send(err);
		} else {
			var totalWeight = 0;
			data.forEach(function(entry) {
				totalWeight = +totalWeight + +entry.weight;
			});
			totalWeight = +totalWeight + +fields.assignmentWeight;
			console.log(Math.floor(totalWeight) !== 100);
			if(Math.floor(totalWeight) > 100) {
				console.log('Weight cannot exceed 100');
				res.send(systemMessages.status.error);
			} else {
				Class.findOne({ email : req.session.email, className : fields.className }, function(err, classDoc) {
					if(err) {
						console.log(err);
						res.send(err);
					} else {
						if(classDoc) {
							var assignmentObject = {
								className : fields.className,
								email : req.session.email,
								assignment : fields.assignmentName,
								percentage : fields.assignmentPercentage,
								weight : fields.assignmentWeight,
								desiredPercentage : classDoc.desiredGrade
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
						} else {
							console.log('cannot find classDoc');
							res.send(systemMessages.status.error);
						}
					}
				});
				
			}
		}
	})
	
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
	var fields = req.body;
	console.log(fields);
	var desiredGrade = +fields.desiredGrade / 100;
	var pointsBurned = 0;
	var totalPoints = 0;
	var currentGrade = 0;
	var undoneWeight = 0;
	var goalTotal = 0;
	var necessaryPoints = 0;

	for(var i = 0; i < fields.assignmentWeights.length; i++) {
		if(fields.assignmentWeights[i] === '') {
			totalPoints += fields.assignmentPercentages[i] / 100;
		} else if(fields.assignmentPercentages[i] !== '' && fields.assignmentWeights[i] !== '') {
			totalPoints += (+fields.assignmentPercentages[i] / 100) * (+fields.assignmentWeights[i] / 100);
			pointsBurned += (+fields.assignmentWeights[i] / 100);
		} 
	}

	currentGrade = totalPoints / pointsBurned;

	undoneWeight = 1 - pointsBurned;

	goalTotal = desiredGrade - totalPoints;

	necessaryPoints = goalTotal / undoneWeight;

	console.log(necessaryPoints);

	fields.assignmentPercentages.forEach(function(percentage) {
		totalPoints = percentage
	});

	res.send({
		currentGrade : currentGrade * 100,
		goal : necessaryPoints * 100
	});
}

/*{ assignmentName : assignment, className : className, weight : weight }*/
exports.updateAssignmentWeight = function(req, res) {
	var fields = req.body;

	Assignment.find({ email : req.session.email, className : fields.className }, function(err, data) {
		if(err) {
			console.log(err);
			res.send(err);
		} else {
			if(data) {
				Assignment.findOne({email : req.session.email, assignment : fields.assignmentName, className : fields.className }, function(err, assignment) {
					if(err) {
						console.log(err);
						res.send(err);
					} else {
						if(assignment) {
							//calculate whether assignment + total weight > 100
							var totalWeight = 0;

							data.forEach(function(entry) {
								console.log(entry);
								totalWeight = totalWeight + entry.weight;
							});
							totalWeight = +totalWeight - +assignment.weight;
							totalWeight = +totalWeight + +fields.weight;
							if(Math.floor(totalWeight) > 100) {
								console.log('Weight cannot exceed 100');
								res.send(systemMessages.status.error);
							} else {
								assignment.weight = fields.weight;
								assignment.save(function(err) {
									if(err) {
										console.log(err);
										res.send(err);
									} else {
										res.send(systemMessages.status.ok);
									}
								});
							}
						} else {
							console.log('assignment not found');
							res.end();
						}
					}
				});
			} else {
				console.log('data not found');
				res.end();
			}
		}
	})
}

/*{ assignmentName : assignment, className : className }*/
exports.deleteAssignment = function(req, res) {
	var fields = req.body;

	Assignment.findOneAndRemove({ assignment : fields.assignmentName, email : req.session.email, className : fields.className }, function(err) {
		if(err) {
			console.log(err);
			res.send(err);
		} else {
			res.send(systemMessages.status.ok);
		}
	});
}

