var systemMessages = require('../systemMessages');
var session = require('express-session');
var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var User = require('../Schemas/users');
var Assignment = require('../Schemas/assignment');
var Class = require('../Schemas/class');

exports.viewClasses = function(req, res) {
	var classObject;
	var classPageObject;
	if(!req.session.email) {
		return res.redirect('/login');
	} else {
		var classes = [];
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
			}
		});
	}
}

exports.viewClass = function(req, res) {
	if(!req.session.email) {
		res.redirect('/login');
	} else {
		var assignments = [];
		Assignment.find({ email : req.session.email, className : req.params.classID }, function(err, data) {
			if(err) {
				console.log(err);
				res.send(err);
			} else {
				assignments = data;
				console.log(assignments);
				Class.findOne({ email : req.session.email, className : req.params.classID }, function(err, classObj) {
					if(err) {
						console.log(err);
						res.send(err);
					} else {
						if(classObj) {
							var desiredGrade = classObj.desiredGrade;
							classPageObject = {
								'className' : req.params.classID,
								'assignments' : assignments,
								'desiredGrade' : desiredGrade,
								'currentGrade' : classObj.currentGrade
							};

							res.render('class', classPageObject);
						}
					}
				});
				
			}
		});
	}
}

exports.addClass = function(req, res) {
	var fields = req.body;
	var newClass = fields.className;
	var currentClasses = [];
	var classExists = false;
	var classObject;

	User.findOne({ email : req.session.email }, function(err, data) {
		if(data) {
			data.classes.forEach(function(element) {
				if(element === newClass) {
					classExists = true;
				}
			});
			if(classExists === false) {
				data.classes.unshift(newClass);
				data.save(function(err) {
					if(err) {
						console.log(err);
						res.send(err);
					}
				});

				classObject = new Class({
					className : newClass,
					email : req.session.email,
					desiredGrade : fields.desiredGrade
				});

				classObject.save(function(err) {
					if(err) {
						console.log(err);
						res.send(err);
					} else {
						res.send(systemMessages.status.ok);
					}
				})
			} else {
				res.send(systemMessages.status.error);
			}
			
		} else {
			res.end();
		}
	});
}

exports.updateDesiredGrade = function(req, res) {
	var fields = req.body;

	Class.findOne({ email : req.session.email, className : fields.className }, function(err, data) {
		if(err) {
			console.log(err);
			res.send(err);
		} else {
			if(data) {
				data.desiredGrade = fields.desiredGrade;
				data.save(function(err) {
					if(err) {
						console.log(err);
						res.send(err);
					} else {
						res.send(systemMessages.status.ok);
					}
				});
			}
		}
	});
}

exports.deleteClass = function(req, res) {
	var fields = req.body;
	var classes = [];

	Class.findOneAndRemove({ email : req.session.email, className : fields.className }, function(err) {
		if(err) {
			console.log(err);
			res.send(err);
		} else {
			Assignment.remove( { email : req.session.email, className : fields.className}, function(err) {
				if(err) {
					console.log(err);
					res.send(err);
				} else {
					User.findOne({ email : req.session.email }, function(err, data) {
						if(err) {
							console.log(err);
							res.send(err);
						} else {
							if(data) {
								data.classes.forEach(function(element) {
									if((element === fields.className) == false) {
										classes.push(element);
									}
								});

								data.classes = classes;
								data.save(function(err) {
									if(err) {
										console.log(err);
										res.send(err);
									} else {
										res.send(systemMessages.status.ok);
									}
								});
							}
						}
					});
				}
			})
		}
	})
}

